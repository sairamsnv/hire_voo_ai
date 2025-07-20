from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import json
from .serializers import (
    RegisterSerializer, UserProfileSerializer, UserSessionSerializer,
    SessionActivitySerializer, SessionSettingsSerializer, SessionAnalyticsSerializer,
    APIKeySerializer, APIKeyCreateSerializer, APIRequestLogSerializer,
    SecurityEventSerializer, SecurityEventResolveSerializer, SecurityDashboardSerializer,
    UserManagementSerializer, UserDetailSerializer
)
import sentry_sdk
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView

from rest_framework.permissions import IsAuthenticated, AllowAny
from .authentication import APIKeyAuthentication
from django.http import HttpResponse
from django.views import View
import os
from django.conf import settings
from django.http import HttpResponse, HttpResponseNotFound
import mimetypes
from pathlib import Path
from django.core.mail import send_mail
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.http import HttpResponseRedirect
import ssl
from .throttles import LoginThrottle, RegisterThrottle, ForgotThrottle
from rest_framework.decorators import throttle_classes
from django.contrib.auth.tokens import default_token_generator
from .services import SessionManagementService
from .models import User, UserSession, SessionActivity, SessionSettings, APIKey, APIRequestLog, SecurityEvent
from django.db import models

ssl._create_default_https_context = ssl._create_unverified_context

class FrontendAppView(View):
    def get(self, request, *args, **kwargs):
        index_path = os.path.join(settings.REACT_BUILD_DIR, 'index.html')
        print("Looking for:", index_path)

        if os.path.exists(index_path):
            with open(index_path, 'r', encoding='utf-8') as f:
                return HttpResponse(f.read())
        return HttpResponseNotFound("index.html not found")

@ensure_csrf_cookie
@require_http_methods(["GET"])
def get_csrf_token(request):
    return JsonResponse({"message": "CSRF cookie set"})

@csrf_protect
@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginThrottle])
def login_view(request):
    print("Login request received")
    try:
        username = request.data.get("username")
        password = request.data.get("password")

        print("Username:", username)
        print("Password:", password)

        if not username or not password:
            return Response(
                {"detail": "Username and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(request, username=username, password=password)

        print("Authenticated user:", user)

        if user:
            if user.is_active:
                login(request, user)
                request.session['user_id'] = user.id
                request.session['is_authenticated'] = True
                request.session.save()
                
                # Create user session for tracking (for ALL users)
                try:
                    from .services import SessionManagementService
                    user_session = SessionManagementService.create_user_session(
                        request, user, request.session.session_key
                    )
                    print(f"✅ Session created for user: {user.email}")
                except Exception as session_error:
                    print(f"⚠️ Session creation failed: {session_error}")
                    # Continue with login even if session tracking fails
                
                # Create security event for successful login
                try:
                    from .models import SecurityEvent
                    SecurityEvent.objects.create(
                        event_type='login_success',
                        severity='low',
                        description=f'Successful login for user {user.email}',
                        ip_address=request.META.get('REMOTE_ADDR'),
                        user_agent=request.META.get('HTTP_USER_AGENT', ''),
                        user=user,
                        request_data={'username': username}
                    )
                except Exception as security_error:
                    print(f"⚠️ Security event creation failed: {security_error}")
                
                return Response({
                        "message": "Logged in successfully",
                        "user": {
                            "id": user.id,
                            "email": user.email,
                            "full_name": getattr(user, 'full_name', user.email)
                        }
                    }, status=status.HTTP_200_OK)

            else:
                return Response({"detail": "Account is disabled"}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            # Create security event for failed login attempt
            try:
                from .models import SecurityEvent
                SecurityEvent.objects.create(
                    event_type='login_failed',
                    severity='medium',
                    description=f'Failed login attempt for username: {username}',
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    request_data={'username': username}
                )
            except Exception as security_error:
                print(f"⚠️ Security event creation failed: {security_error}")
            
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    except Exception as e:
        print("Login error:", str(e))  # <-- LOG THE ERROR
        return Response({"detail": f"Login failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    try:
        if request.user.is_authenticated:
            user_email = request.user.email
            print("Logout request received from:", user_email)
            
            # Terminate user session for tracking
            try:
                from .services import SessionManagementService
                session_key = request.session.session_key
                if session_key:
                    user_session = SessionManagementService.get_session_by_key(session_key)
                    if user_session:
                        SessionManagementService.terminate_session(user_session, 'user_logout')
                        print(f"✅ Session terminated for user: {user_email}")
            except Exception as session_error:
                print(f"⚠️ Session termination failed: {session_error}")
            
            logout(request)
            request.session.flush()
            print("Logout successful for:", user_email)
            
            # Create security event for logout
            try:
                from .models import SecurityEvent
                SecurityEvent.objects.create(
                    event_type='logout',
                    severity='low',
                    description=f'User logout: {user_email}',
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    user=request.user
                )
            except Exception as security_error:
                print(f"⚠️ Security event creation failed: {security_error}")
        else:
            print("Logout request received from anonymous user")
            # Clear any remaining session data
            request.session.flush()
        
        return Response({'message': 'Logged out successfully.'})
    except Exception as e:
        print("Logout error:", str(e))
        return Response(
            {'error': 'Logout failed'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

token_generator = PasswordResetTokenGenerator()

def send_verification_email(user, request):
    current_site = get_current_site(request)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = token_generator.make_token(user)
    verify_url = f"http://{current_site.domain}{reverse('accounts:verify-email')}?uid={uid}&token={token}"
    subject = 'Verify your email address'
    html_message = f"""
    <div style='font-family: Arial, sans-serif; background: #f6f8fa; padding: 32px;'>
      <div style='max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 32px;'>
        <div style='text-align: center; margin-bottom: 24px;'>
          <div style='display: inline-block; background: linear-gradient(90deg, #2563eb, #1e40af); border-radius: 16px; width: 56px; height: 56px; line-height: 56px; color: #fff; font-size: 2rem; font-weight: bold;'>H</div>
        </div>
        <h2 style='color: #1e293b; font-size: 1.5rem; margin-bottom: 8px;'>Verify your Hire voo.ai account</h2>
        <p style='color: #334155; margin-bottom: 24px;'>Hi {user.full_name},<br><br>Thank you for registering! Please verify your email address to activate your account.</p>
        <a href='{verify_url}' style='display: block; width: 100%; background: linear-gradient(90deg, #2563eb, #1e40af); color: #fff; text-decoration: none; text-align: center; padding: 14px 0; border-radius: 8px; font-weight: 600; font-size: 1rem; margin-bottom: 16px;'>Verify Email</a>
        <p style='color: #64748b; font-size: 0.95rem; margin-bottom: 0;'>If the button above does not work, copy and paste this link into your browser:</p>
        <div style='word-break: break-all; color: #2563eb; font-size: 0.95rem; margin-bottom: 24px;'>{verify_url}</div>
        <p style='color: #64748b; font-size: 0.95rem;'>If you did not sign up, you can safely ignore this email.</p>
        <div style='margin-top: 32px; text-align: center; color: #94a3b8; font-size: 0.9rem;'>
          &copy; {2025} Hire voo.ai
        </div>
      </div>
    </div>
    """
    message = f'Hi {user.full_name},\n\nPlease verify your email by clicking the link below:\n{verify_url}\n\nIf you did not sign up, please ignore this email.'
    send_mail(subject, message, None, [user.email], html_message=html_message)

@csrf_protect
@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([RegisterThrottle])
def register_view(request):
    try:
        print("📥 Incoming data:", request.data)
        email = request.data.get('email')
        from .models import User
        existing_user = User.objects.filter(email=email).first()
        if existing_user:
            if not existing_user.is_active:
                send_verification_email(existing_user, request)
                return Response(
                    {'message': 'Account already exists but is not activated. Activation email resent. Please check your email.'},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {'email': ['user with this email already exists.']},
                    status=status.HTTP_400_BAD_REQUEST
                )
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(is_active=False)  # Set inactive until verified
            print("✅ User created:", user.email)
            send_verification_email(user, request)
            return Response(
                {'message': 'Account created successfully. Please check your email to verify your account.'}, 
                status=status.HTTP_201_CREATED
            )
        else:
            print("❌ Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(
            {'error': 'Registration failed. Please try again.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def session_check_view(request):
    """Check if user is authenticated and return session info"""
    try:
        if request.user.is_authenticated:
            serializer = UserProfileSerializer(request.user)
            return Response({
                "isAuthenticated": True,
                "user": serializer.data
            })
        else:
            return Response({
                "isAuthenticated": False,
                "user": None
            })
    except Exception as e:
        return Response(
            {"error": "Session check failed"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@csrf_protect
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile_view(request):
    try:
        serializer = UserProfileSerializer(request.user)
        return Response({
            "isAuthenticated": True,
            "user": serializer.data
        })
    except Exception as e:
        print("Profile fetch failed:", str(e))
        return Response({
            "isAuthenticated": False,
            "error": "Failed to fetch profile."
        }, status=500)

# Keep the old check_auth_view for backward compatibility
@api_view(['GET'])
@permission_classes([AllowAny])
def check_auth_view(request):
    is_authenticated = request.user.is_authenticated
    username = request.user.get_username() if is_authenticated else None
    return Response({
        'isAuthenticated': is_authenticated,
        'username': username
    })


@csrf_protect
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    try:
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Profile updated successfully', 'user': serializer.data})
        return Response(serializer.errors, status=400)
    except Exception as e:
        return Response({'error': 'Update failed'}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email_view(request):
    uidb64 = request.GET.get('uid')
    token = request.GET.get('token')
    if not uidb64 or not token:
        return Response({'error': 'Invalid verification link.'}, status=400)
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        from .models import User
        user = User.objects.get(pk=uid)
    except Exception:
        return Response({'error': 'Invalid or expired link.'}, status=400)
    if user.is_active:
        # Redirect to login with verified=1 if already active
        return HttpResponseRedirect('/login?verified=1')
    if token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        # Redirect to login with verified=1 after successful activation
        return HttpResponseRedirect('/login?verified=1')
    else:
        return Response({'error': 'Invalid or expired token.'}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([ForgotThrottle])
def forgot_password_view(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required.'}, status=400)
    from .models import User
    user = User.objects.filter(email=email).first()
    if user:
        token = PasswordResetTokenGenerator().make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"http://{request.get_host()}/reset-password?uid={uid}&token={token}"
        subject = "Password Reset Request"
        html_message = f"""
        <div style='font-family: Arial, sans-serif; background: #f6f8fa; padding: 32px;'>
          <div style='max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 32px;'>
            <div style='text-align: center; margin-bottom: 24px;'>
              <div style='display: inline-block; background: linear-gradient(90deg, #2563eb, #1e40af); border-radius: 16px; width: 56px; height: 56px; line-height: 56px; color: #fff; font-size: 2rem; font-weight: bold;'>H</div>
            </div>
            <h2 style='color: #1e293b; font-size: 1.5rem; margin-bottom: 8px;'>Reset your Hire voo.ai password</h2>
            <p style='color: #334155; margin-bottom: 24px;'>We received a request to reset your password. Click the button below to set a new password for your account.</p>
            <a href='{reset_url}' style='display: block; width: 100%; background: linear-gradient(90deg, #2563eb, #1e40af); color: #fff; text-decoration: none; text-align: center; padding: 14px 0; border-radius: 8px; font-weight: 600; font-size: 1rem; margin-bottom: 16px;'>Reset Password</a>
            <p style='color: #64748b; font-size: 0.95rem; margin-bottom: 0;'>If the button above does not work, copy and paste this link into your browser:</p>
            <div style='word-break: break-all; color: #2563eb; font-size: 0.95rem; margin-bottom: 24px;'>{reset_url}</div>
            <p style='color: #64748b; font-size: 0.95rem;'>If you did not request a password reset, you can safely ignore this email.</p>
            <div style='margin-top: 32px; text-align: center; color: #94a3b8; font-size: 0.9rem;'>
              &copy; {2025} Hire voo.ai
            </div>
          </div>
        </div>
        """
        message = "Hi,\n\nClick the link below to reset your password:\n{reset_url}\n\nIf you didn't request this, ignore this email."
        send_mail(subject, message, None, [user.email], html_message=html_message)
    # Always return success for security
    return Response({'message': "If an account with that email exists, you'll receive a password reset link."})

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_view(request):
    uidb64 = request.data.get('uid')
    token = request.data.get('token')
    password = request.data.get('password')
    if not (uidb64 and token and password):
        return Response({'error': 'Missing data.'}, status=400)
    from .models import User
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except Exception:
        return Response({'error': 'Invalid link.'}, status=400)
    if PasswordResetTokenGenerator().check_token(user, token):
        user.set_password(password)
        user.save()
        return Response({'message': 'Password reset successful.'})
    else:
        return Response({'error': 'Invalid or expired token.'}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_email_change_view(request):
    user = request.user
    new_email = request.data.get('new_email')
    if not new_email:
        return Response({'error': 'New email is required.'}, status=400)
    from .models import User
    if User.objects.filter(email=new_email).exists():
        return Response({'error': 'This email is already in use.'}, status=400)
    user.pending_email = new_email
    user.save()
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    verify_url = f"http://{request.get_host()}/api/verify-email-change/?uid={uid}&token={token}"
    subject = "Verify your new email address"
    html_message = f"""
    <div style='font-family: Arial, sans-serif; background: #f6f8fa; padding: 32px;'>
      <div style='max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 32px;'>
        <div style='text-align: center; margin-bottom: 24px;'>
          <div style='display: inline-block; background: linear-gradient(90deg, #2563eb, #1e40af); border-radius: 16px; width: 56px; height: 56px; line-height: 56px; color: #fff; font-size: 2rem; font-weight: bold;'>H</div>
        </div>
        <h2 style='color: #1e293b; font-size: 1.5rem; margin-bottom: 8px;'>Verify your new email address</h2>
        <p style='color: #334155; margin-bottom: 24px;'>Click the button below to confirm your new email address for Hire voo.ai.</p>
        <a href='{verify_url}' style='display: block; width: 100%; background: linear-gradient(90deg, #2563eb, #1e40af); color: #fff; text-decoration: none; text-align: center; padding: 14px 0; border-radius: 8px; font-weight: 600; font-size: 1rem; margin-bottom: 16px;'>Verify New Email</a>
        <p style='color: #64748b; font-size: 0.95rem; margin-bottom: 0;'>If the button above does not work, copy and paste this link into your browser:</p>
        <div style='word-break: break-all; color: #2563eb; font-size: 0.95rem; margin-bottom: 24px;'>{verify_url}</div>
        <p style='color: #64748b; font-size: 0.95rem;'>If you did not request this, you can safely ignore this email.</p>
        <div style='margin-top: 32px; text-align: center; color: #94a3b8; font-size: 0.9rem;'>
          &copy; {2025} Hire voo.ai
        </div>
      </div>
    </div>
    """
    message = f"Click the link to verify your new email: {verify_url}"
    send_mail(subject, message, None, [new_email], html_message=html_message)
    return Response({'message': 'Verification email sent to new address.'})

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email_change_view(request):
    uidb64 = request.GET.get('uid')
    token = request.GET.get('token')
    if not uidb64 or not token:
        return Response({'error': 'Invalid verification link.'}, status=400)
    from .models import User
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except Exception:
        return Response({'error': 'Invalid or expired link.'}, status=400)
    if not user.pending_email:
        return Response({'error': 'No pending email change.'}, status=400)
    if default_token_generator.check_token(user, token):
        user.email = user.pending_email
        user.pending_email = None
        user.save()
        from django.http import HttpResponseRedirect
        return HttpResponseRedirect('/login?email_changed=1')
    else:
        return Response({'error': 'Invalid or expired token.'}, status=400)

# Session Management Views

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_sessions_view(request):
    """Get all sessions for the current user"""
    try:
        include_inactive = request.GET.get('include_inactive', 'false').lower() == 'true'
        sessions = SessionManagementService.get_user_sessions(request.user, include_inactive)
        serializer = UserSessionSerializer(sessions, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {"error": "Failed to fetch sessions"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_session_analytics_view(request):
    """Get session analytics for the current user"""
    try:
        days = int(request.GET.get('days', 30))
        analytics = SessionManagementService.get_session_analytics(request.user, days)
        serializer = SessionAnalyticsSerializer(analytics)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {"error": "Failed to fetch analytics"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def terminate_session_view(request):
    """Terminate a specific session"""
    try:
        session_id = request.data.get('session_id')
        if not session_id:
            return Response(
                {"error": "Session ID is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify the session belongs to the current user
        try:
            session = UserSession.objects.get(id=session_id, user=request.user)
        except UserSession.DoesNotExist:
            return Response(
                {"error": "Session not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        SessionManagementService.terminate_session(session, 'user_terminated')
        return Response({"message": "Session terminated successfully"})
    except Exception as e:
        return Response(
            {"error": "Failed to terminate session"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def terminate_all_sessions_view(request):
    """Terminate all sessions except current"""
    try:
        current_session_key = request.session.session_key
        sessions = UserSession.objects.filter(
            user=request.user, 
            is_active=True
        ).exclude(session_key=current_session_key)
        
        terminated_count = 0
        for session in sessions:
            SessionManagementService.terminate_session(session, 'user_terminated_all')
            terminated_count += 1
        
        return Response({
            "message": f"Terminated {terminated_count} sessions",
            "terminated_count": terminated_count
        })
    except Exception as e:
        return Response(
            {"error": "Failed to terminate sessions"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def session_settings_view(request):
    """Get or update session settings"""
    try:
        settings, created = SessionSettings.objects.get_or_create(user=request.user)
        
        if request.method == 'GET':
            serializer = SessionSettingsSerializer(settings)
            return Response(serializer.data)
        
        elif request.method == 'PUT':
            serializer = SessionSettingsSerializer(settings, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response(
            {"error": "Failed to manage session settings"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_session_activities_view(request):
    """Get recent session activities"""
    try:
        limit = int(request.GET.get('limit', 20))
        activities = SessionActivity.objects.filter(
            user_session__user=request.user
        ).order_by('-created_at')[:limit]
        
        serializer = SessionActivitySerializer(activities, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {"error": "Failed to fetch activities"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Admin session management views (for staff users)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_get_user_sessions_view(request):
    """Admin view to get sessions for any user"""
    if not request.user.is_staff:
        return Response(
            {"error": "Permission denied"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user_id = request.GET.get('user_id')
        if not user_id:
            return Response(
                {"error": "User ID is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from .models import User
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        include_inactive = request.GET.get('include_inactive', 'false').lower() == 'true'
        sessions = SessionManagementService.get_user_sessions(user, include_inactive)
        serializer = UserSessionSerializer(sessions, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {"error": "Failed to fetch user sessions"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_get_all_sessions_view(request):
    """Admin view to get all sessions across all users"""
    if not request.user.is_staff:
        return Response(
            {"error": "Permission denied"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from .models import UserSession
        from django.db.models import Q
        
        # Get query parameters
        include_inactive = request.GET.get('include_inactive', 'true').lower() == 'true'
        limit = int(request.GET.get('limit', 100))
        
        # Build query
        query = UserSession.objects.select_related('user').order_by('-created_at')
        
        if not include_inactive:
            query = query.filter(is_active=True)
        
        # Apply limit
        sessions = query[:limit]
        
        # Serialize with user information
        session_data = []
        for session in sessions:
            session_data.append({
                'id': session.id,
                'user': {
                    'email': session.user.email,
                    'full_name': session.user.full_name or session.user.email,
                },
                'ip_address': session.ip_address,
                'device_type': session.device_type or 'unknown',
                'browser': session.browser or 'Unknown',
                'os': session.os or 'Unknown',
                'location': session.location or 'Unknown',
                'is_active': session.is_active,
                'created_at': session.created_at.isoformat(),
                'last_activity': session.last_activity.isoformat() if session.last_activity else session.created_at.isoformat(),
                'expires_at': session.expires_at.isoformat() if session.expires_at else None,
            })
        
        return Response(session_data)
    except Exception as e:
        return Response(
            {"error": "Failed to fetch sessions"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_force_logout_user_view(request):
    """Admin view to force logout all sessions for a user"""
    if not request.user.is_staff:
        return Response(
            {"error": "Permission denied"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {"error": "User ID is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from .models import User
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        terminated_count = SessionManagementService.force_logout_all_sessions(user, 'admin_action')
        return Response({
            "message": f"Force logged out {terminated_count} sessions",
            "terminated_count": terminated_count
        })
    except Exception as e:
        return Response(
            {"error": "Failed to force logout user"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_force_logout_session_view(request):
    """Admin view to force logout a specific session"""
    print(f"DEBUG: User: {request.user}")
    print(f"DEBUG: User is_staff: {request.user.is_staff}")
    print(f"DEBUG: User is_superuser: {request.user.is_superuser}")
    print(f"DEBUG: User is_authenticated: {request.user.is_authenticated}")
    print(f"DEBUG: Request method: {request.method}")
    print(f"DEBUG: Request headers: {dict(request.headers)}")
    print(f"DEBUG: Request body: {request.body}")
    print(f"DEBUG: Request data: {request.data}")
    
    if not request.user.is_staff:
        print(f"DEBUG: Access denied - user is not staff")
        return Response(
            {"error": "Permission denied"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    print(f"DEBUG: Access granted - user is staff")
    
    try:
        session_id = request.data.get('session_id')
        if not session_id:
            return Response(
                {"error": "Session ID is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            session = UserSession.objects.get(id=session_id)
        except UserSession.DoesNotExist:
            return Response(
                {"error": "Session not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        SessionManagementService.terminate_session(session, 'admin_force_logout')
        return Response({
            "message": "Session terminated successfully",
            "session_id": session_id
        })
    except Exception as e:
        return Response(
            {"error": "Failed to terminate session"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_session_details_view(request, session_id):
    """Admin view to get detailed session information"""
    if not request.user.is_staff:
        return Response(
            {"error": "Permission denied"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        session = UserSession.objects.get(id=session_id)
        serializer = UserSessionSerializer(session)
        return Response(serializer.data)
    except UserSession.DoesNotExist:
        return Response(
            {"error": "Session not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_session_activity_view(request, session_id):
    """Admin view to get session activity log"""
    if not request.user.is_staff:
        return Response(
            {"error": "Permission denied"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        session = UserSession.objects.get(id=session_id)
        activities = SessionActivity.objects.filter(session=session).order_by('-created_at')
        serializer = SessionActivitySerializer(activities, many=True)
        return Response(serializer.data)
    except UserSession.DoesNotExist:
        return Response(
            {"error": "Session not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )

# API Security Views

@csrf_exempt
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def api_keys_view(request):
    """Manage API keys for the authenticated user"""
    if request.method == 'GET':
        api_keys = APIKey.objects.filter(user=request.user, is_active=True)
        serializer = APIKeySerializer(api_keys, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = APIKeyCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            api_key = serializer.save()
            # Return the full key only on creation
            return Response({
                'message': 'API key created successfully',
                'api_key': APIKeySerializer(api_key).data,
                'full_key': api_key.key  # Only shown once
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def api_key_detail_view(request, key_id):
    """Manage a specific API key"""
    try:
        api_key = APIKey.objects.get(id=key_id, user=request.user)
    except APIKey.DoesNotExist:
        return Response({'error': 'API key not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = APIKeySerializer(api_key)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = APIKeySerializer(api_key, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'API key updated successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        api_key.delete()
        return Response({'message': 'API key deleted successfully'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_key_usage_view(request, key_id):
    """Get usage logs for a specific API key"""
    try:
        api_key = APIKey.objects.get(id=key_id, user=request.user)
    except APIKey.DoesNotExist:
        return Response({'error': 'API key not found'}, status=status.HTTP_404_NOT_FOUND)
    
    logs = APIRequestLog.objects.filter(api_key=api_key).order_by('-created_at')[:50]
    serializer = APIRequestLogSerializer(logs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_request_logs_view(request):
    """Get API request logs for the authenticated user"""
    logs = APIRequestLog.objects.filter(user=request.user).order_by('-created_at')[:100]
    serializer = APIRequestLogSerializer(logs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def security_events_view(request):
    """Get security events for the authenticated user"""
    events = SecurityEvent.objects.filter(user=request.user).order_by('-created_at')[:50]
    serializer = SecurityEventSerializer(events, many=True)
    return Response(serializer.data)


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resolve_security_event_view(request, event_id):
    """Resolve a security event"""
    try:
        event = SecurityEvent.objects.get(id=event_id, user=request.user)
    except SecurityEvent.DoesNotExist:
        return Response({'error': 'Security event not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = SecurityEventResolveSerializer(data=request.data)
    if serializer.is_valid():
        if serializer.validated_data.get('resolved', False):
            event.resolve(resolved_by_user=request.user)
        return Response({'message': 'Security event updated successfully'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def security_dashboard_view(request):
    """Get security dashboard data for the authenticated user"""
    print(f"Security Dashboard - User: {request.user}")
    print(f"Security Dashboard - User ID: {request.user.id if request.user.is_authenticated else 'Not authenticated'}")
    
    # Get user's security events
    user_events = SecurityEvent.objects.filter(user=request.user)
    
    # Calculate statistics
    total_events = user_events.count()
    events_by_severity = {}
    events_by_type = {}
    
    for event in user_events:
        events_by_severity[event.severity] = events_by_severity.get(event.severity, 0) + 1
        events_by_type[event.event_type] = events_by_type.get(event.event_type, 0) + 1
    
    # Get recent events
    recent_events = user_events[:10]
    
    # Get top threat IPs
    from django.db.models import Count
    top_threat_ips = user_events.exclude(ip_address__isnull=True)\
        .values('ip_address')\
        .annotate(count=Count('id'))\
        .order_by('-count')[:5]
    
    # Get API key usage
    api_key_usage = []
    user_api_keys = APIKey.objects.filter(user=request.user)
    
    for api_key in user_api_keys:
        key_logs = APIRequestLog.objects.filter(api_key=api_key)
        if key_logs.exists():
            total_requests = key_logs.count()
            successful_requests = key_logs.filter(status_code__lt=400).count()
            failed_requests = total_requests - successful_requests
            avg_response_time = key_logs.aggregate(avg_time=models.Avg('response_time'))['avg_time'] or 0
            
            # Get top endpoints
            top_endpoints = key_logs.values('endpoint')\
                .annotate(count=Count('id'))\
                .order_by('-count')[:5]
            
            api_key_usage.append({
                'api_key_id': str(api_key.id),
                'api_key_name': api_key.name,
                'total_requests': total_requests,
                'successful_requests': successful_requests,
                'failed_requests': failed_requests,
                'avg_response_time': round(avg_response_time, 3),
                'last_used': api_key.last_used,
                'top_endpoints': list(top_endpoints)
            })
    
    dashboard_data = {
        'total_events': total_events,
        'events_by_severity': events_by_severity,
        'events_by_type': events_by_type,
        'recent_events': SecurityEventSerializer(recent_events, many=True).data,
        'top_threat_ips': list(top_threat_ips),
        'api_key_usage': api_key_usage
    }
    
    serializer = SecurityDashboardSerializer(dashboard_data)
    return Response(serializer.data)


# Admin Views for Security Management

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_security_events_view(request):
    """Admin view: Get all security events"""
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    events = SecurityEvent.objects.all().order_by('-created_at')[:100]
    serializer = SecurityEventSerializer(events, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_security_event_detail_view(request, event_id):
    """Admin view: Get detailed security event information"""
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        event = SecurityEvent.objects.get(id=event_id)
        serializer = SecurityEventSerializer(event)
        return Response(serializer.data)
    except SecurityEvent.DoesNotExist:
        return Response({'error': 'Security event not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_security_event_investigation_view(request, event_id):
    """Admin view: Get investigation data for a security event"""
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        event = SecurityEvent.objects.get(id=event_id)
        # For now, return related security events from the same IP
        related_events = SecurityEvent.objects.filter(
            ip_address=event.ip_address
        ).exclude(id=event.id).order_by('-created_at')[:20]
        
        serializer = SecurityEventSerializer(related_events, many=True)
        return Response(serializer.data)
    except SecurityEvent.DoesNotExist:
        return Response({'error': 'Security event not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_block_ip_view(request):
    """Admin view: Block an IP address"""
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        ip_address = request.data.get('ip_address')
        reason = request.data.get('reason', 'Admin action')
        event_id = request.data.get('event_id')
        
        if not ip_address:
            return Response({'error': 'IP address is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # For now, just create a security event for the block
        # In a real implementation, you'd add the IP to a blocklist
        SecurityEvent.objects.create(
            event_type='ip_blocked',
            severity='high',
            description=f'IP {ip_address} blocked: {reason}',
            ip_address=ip_address,
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            user=request.user,
            request_data={'reason': reason, 'event_id': event_id}
        )
        
        return Response({
            'message': f'IP address {ip_address} blocked successfully',
            'ip_address': ip_address
        })
    except Exception as e:
        return Response({'error': 'Failed to block IP address'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_resolve_security_event_view(request, event_id):
    """Admin view: Resolve any security event"""
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        event = SecurityEvent.objects.get(id=event_id)
    except SecurityEvent.DoesNotExist:
        return Response({'error': 'Security event not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = SecurityEventResolveSerializer(data=request.data)
    if serializer.is_valid():
        if serializer.validated_data.get('resolved', False):
            event.resolve(resolved_by_user=request.user)
        return Response({'message': 'Security event updated successfully'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_api_analytics_view(request):
    """Admin view: Get API analytics across all users"""
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    from django.db.models import Count, Avg
    from django.utils import timezone
    from datetime import timedelta
    
    # Get date range from query params
    days = int(request.GET.get('days', 7))
    start_date = timezone.now() - timedelta(days=days)
    
    # Get API request statistics
    api_logs = APIRequestLog.objects.filter(created_at__gte=start_date)
    
    total_requests = api_logs.count()
    successful_requests = api_logs.filter(status_code__lt=400).count()
    failed_requests = total_requests - successful_requests
    avg_response_time = api_logs.aggregate(avg_time=Avg('response_time'))['avg_time'] or 0
    
    # Get requests by endpoint
    requests_by_endpoint = api_logs.values('endpoint')\
        .annotate(count=Count('id'))\
        .order_by('-count')[:10]
    
    # Get requests by method
    requests_by_method = api_logs.values('method')\
        .annotate(count=Count('id'))\
        .order_by('-count')
    
    # Get top API keys
    top_api_keys = api_logs.values('api_key__name')\
        .annotate(count=Count('id'))\
        .order_by('-count')[:10]
    
    analytics_data = {
        'total_requests': total_requests,
        'successful_requests': successful_requests,
        'failed_requests': failed_requests,
        'avg_response_time': round(avg_response_time, 3),
        'requests_by_endpoint': list(requests_by_endpoint),
        'requests_by_method': list(requests_by_method),
        'top_api_keys': list(top_api_keys),
        'date_range_days': days
    }
    
    return Response(analytics_data)

# Payment Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session_view(request):
    """Create a checkout session for payment"""
    try:
        plan = request.data.get('plan')
        if not plan:
            return Response(
                {"error": "Plan is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # For now, return a mock checkout URL
        # In production, integrate with Stripe, PayPal, etc.
        checkout_url = f"https://example.com/checkout?plan={plan}&user={request.user.id}"
        
        return Response({
            "checkout_url": checkout_url,
            "plan": plan,
            "amount": get_plan_amount(plan)
        })
    except Exception as e:
        return Response(
            {"error": "Failed to create checkout session"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_subscription_view(request):
    """Get user's current subscription"""
    try:
        # Mock subscription data
        subscription = {
            "plan": "basic",
            "status": "active",
            "current_period_end": "2024-12-31T23:59:59Z",
            "features": {
                "api_keys_limit": 5,
                "security_features": ["basic"],
                "support": "email"
            }
        }
        
        return Response(subscription)
    except Exception as e:
        return Response(
            {"error": "Failed to fetch subscription"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def get_plan_amount(plan):
    """Get the amount for a given plan"""
    plan_prices = {
        'basic': 900,  # $9.00 in cents
        'pro': 2900,   # $29.00 in cents
        'enterprise': 9900  # $99.00 in cents
    }
    return plan_prices.get(plan, 900)


# User Management Endpoints for Admins
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_get_all_users_view(request):
    """Get all users for admin management"""
    try:
        # Check if user is admin
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get query parameters for filtering and pagination
        search = request.GET.get('search', '')
        status_filter = request.GET.get('status', 'all')
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        
        # Start with all users
        users = User.objects.all()
        
        # Apply search filter
        if search:
            users = users.filter(
                models.Q(email__icontains=search) |
                models.Q(full_name__icontains=search)
            )
        
        # Apply status filter
        if status_filter == 'active':
            users = users.filter(is_active=True)
        elif status_filter == 'inactive':
            users = users.filter(is_active=False)
        elif status_filter == 'admin':
            users = users.filter(is_staff=True)
        elif status_filter == 'superuser':
            users = users.filter(is_superuser=True)
        
        # Order by id (newest first)
        users = users.order_by('-id')
        
        # Calculate pagination
        total_users = users.count()
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        users_page = users[start_index:end_index]
        
        # Serialize users
        serializer = UserManagementSerializer(users_page, many=True)
        
        # Prepare response with pagination info
        response_data = {
            'users': serializer.data,
            'pagination': {
                'current_page': page,
                'page_size': page_size,
                'total_users': total_users,
                'total_pages': (total_users + page_size - 1) // page_size,
                'has_next': end_index < total_users,
                'has_previous': page > 1
            },
            'filters': {
                'search': search,
                'status': status_filter
            }
        }
        
        return Response(response_data)
        
    except Exception as e:
        print(f"Error in admin_get_all_users_view: {str(e)}")
        return Response(
            {'error': f'Failed to get users: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_get_user_detail_view(request, user_id):
    """Get detailed information about a specific user"""
    try:
        # Check if user is admin
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get the user
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Serialize user with detailed information
        serializer = UserDetailSerializer(user)
        
        return Response(serializer.data)
        
    except Exception as e:
        print(f"Error in admin_get_user_detail_view: {str(e)}")
        return Response(
            {'error': f'Failed to get user details: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_update_user_view(request, user_id):
    """Update user information (admin only)"""
    try:
        # Check if user is admin
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get the user
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update user fields
        allowed_fields = ['full_name', 'bio', 'country', 'job_stream', 'is_active', 'is_staff']
        
        for field in allowed_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        
        user.save()
        
        # Serialize and return updated user
        serializer = UserManagementSerializer(user)
        return Response(serializer.data)
        
    except Exception as e:
        print(f"Error in admin_update_user_view: {str(e)}")
        return Response(
            {'error': f'Failed to update user: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_delete_user_view(request, user_id):
    """Delete a user (admin only)"""
    try:
        # Check if user is admin
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Prevent admin from deleting themselves
        if str(request.user.id) == str(user_id):
            return Response(
                {'error': 'Cannot delete your own account'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the user
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Delete user (this will cascade to related objects)
        user.delete()
        
        return Response({'message': 'User deleted successfully'})
        
    except Exception as e:
        return Response(
            {'error': f'Failed to delete user: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_user_analytics_view(request):
    """Get user analytics for admin dashboard"""
    try:
        # Check if user is admin
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        
        # Calculate various metrics
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        # Note: Using id for date approximation since date_joined is not available
        new_users_today = 0  # Will be calculated differently
        new_users_week = 0   # Will be calculated differently
        new_users_month = 0  # Will be calculated differently
        
        # User status distribution
        status_distribution = {
            'active': User.objects.filter(is_active=True, is_staff=False, is_superuser=False).count(),
            'admin': User.objects.filter(is_staff=True, is_superuser=False).count(),
            'superuser': User.objects.filter(is_superuser=True).count(),
            'inactive': User.objects.filter(is_active=False).count(),
        }
        
        # Recent user registrations (using id as proxy for date)
        recent_users = User.objects.order_by('-id')[:10]
        recent_users_data = UserManagementSerializer(recent_users, many=True).data
        
        # User growth over time (last 30 days) - simplified version
        growth_data = []
        for i in range(30):
            date = now - timedelta(days=i)
            # Since we don't have date_joined, we'll use a placeholder
            growth_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'new_users': 0  # Placeholder - would need date_joined field for accurate data
            })
        growth_data.reverse()
        
        analytics_data = {
            'overview': {
                'total_users': total_users,
                'active_users': active_users,
                'new_users_today': new_users_today,
                'new_users_week': new_users_week,
                'new_users_month': new_users_month,
            },
            'status_distribution': status_distribution,
            'recent_users': recent_users_data,
            'growth_data': growth_data
        }
        
        return Response(analytics_data)
        
    except Exception as e:
        print(f"Error in admin_user_analytics_view: {str(e)}")
        return Response(
            {'error': f'Failed to get user analytics: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


