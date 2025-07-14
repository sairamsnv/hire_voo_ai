from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import json
from .serializers import RegisterSerializer,UserProfileSerializer
import sentry_sdk
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView

from rest_framework.permissions import IsAuthenticated,AllowAny
from django.http import HttpResponse
from django.views import View
import os
from django.conf import settings
from django.http import HttpResponse, HttpResponseNotFound
import mimetypes
from pathlib import Path

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
    email = request.data.get("email")
    password = request.data.get("password")
    user = authenticate(request, username=email, password=password)

    if user:
        login(request, user)
        return Response({"message": "Logged in successfully", "username": user.full_name})
    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logged out successfully.'})

@csrf_protect
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    try:
        print("📥 Incoming data:", request.data)
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            print("✅ User created:", user.email)
            return Response({'message': 'Account created successfully'}, status=status.HTTP_201_CREATED)
        else:
            print("❌ Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    

# FIXED: Added csrf_protect decorator for GET requests that access user data
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
        print("Session check failed:", str(e))
        return Response({
            "isAuthenticated": False,
            "error": "Failed to fetch session."
        }, status=500)



@csrf_protect
@api_view(['GET'])
@permission_classes([AllowAny])
def check_auth_view(request):
    is_authenticated = request.user.is_authenticated
    username = request.user.get_username() if is_authenticated else None
    return Response({
        'isAuthenticated': is_authenticated,
        'username': username
    })


