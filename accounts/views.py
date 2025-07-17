from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import json
from .serializers import RegisterSerializer, UserProfileSerializer
import sentry_sdk
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView

from rest_framework.permissions import IsAuthenticated, AllowAny
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

import ssl
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
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    except Exception as e:
        print("Login error:", str(e))  # <-- LOG THE ERROR
        return Response({"detail": f"Login failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_protect
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        # Clear session data
        request.session.flush()  # This clears all session data
        logout(request)
        return Response({'message': 'Logged out successfully.'})
    except Exception as e:
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
    message = f'Hi {user.full_name},\n\nPlease verify your email by clicking the link below:\n{verify_url}\n\nIf you did not sign up, please ignore this email.'
    send_mail(subject, message, None, [user.email])

@csrf_protect
@api_view(['POST'])
@permission_classes([AllowAny])
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
        print("Session check failed:", str(e))
        return Response({
            "isAuthenticated": False,
            "error": "Failed to check session."
        }, status=500)

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
        return Response({'message': 'Account already verified.'}, status=200)
    if token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return Response({'message': 'Email verified successfully. You can now log in.'}, status=200)
    else:
        return Response({'error': 'Invalid or expired token.'}, status=400)
