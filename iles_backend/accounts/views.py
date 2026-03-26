from django.shortcuts import render
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import (
    RegisterSerializer, LoginSerializer, 
    UserSerializer, ChangePasswordSerializer
)
from rest_framework_simplejwt.exceptions import TokenError
import logging
# Create your views here.


class RegisterView(APIView):
    """
    User Registration View.
    
    Why: Allow new users to create accounts.
    Permission: AllowAny - anyone can register.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """
        Handle POST request for registration.
        
        Process:
        1. Validate registration data
        2. Create new user
        3. Return user data with tokens
        """
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate tokens for immediate login
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Registration successful'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    """
    User Login View.
    
    Why: Authenticate users and provide JWT tokens.
    Permission: AllowAny - anyone can login.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """
        Handle POST request for login.
        
        Process:
        1. Validate credentials
        2. Return user data with tokens
        """
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

logger = logging.getLogger(__name__)

class LogoutView(APIView):
    """
    User Logout View.
    
    Blacklist the refresh token to invalidate it.
    Permission: IsAuthenticated - only logged-in users can logout.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Handle POST request for logout.
        
        Process:
        1. Get refresh token from request
        2. Blacklist it
        3. Return success response
        """
        try:
            # Get refresh token from request data
            refresh_token = request.data.get('refresh')
            
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Blacklist the token
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response(
                {'message': 'Successfully logged out'},
                status=status.HTTP_200_OK
            )
            
        except TokenError as e:
            logger.error(f"Token error during logout: {str(e)}")
            return Response(
                {'error': 'Invalid or expired token'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error during logout: {str(e)}")
            return Response(
                {'error': 'Logout failed'},
                status=status.HTTP_400_BAD_REQUEST
            )
    """
    User Logout View.
    
    Why: Blacklist the refresh token to invalidate it.
    Permission: IsAuthenticated - only logged-in users can logout.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Handle POST request for logout.
        
        Process:
        1. Get refresh token from request
        2. Blacklist it
        """
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    """
    User Profile View.
    
    Why: Allow users to view and update their profile.
    Permission: IsAuthenticated - only logged-in users.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        GET: Return current user's profile.
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        """
        PUT: Update user profile.
        
        Why: Allow users to update their information.
        """
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    """
    Password Change View.
    
    Why: Allow users to change their password securely.
    Permission: IsAuthenticated - only logged-in users.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Handle password change.
        
        Process:
        1. Validate old password
        2. Set new password if valid
        """
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            
            # Check old password
            if not user.check_password(serializer.data.get('old_password')):
                return Response(
                    {'old_password': 'Wrong password.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set new password
            user.set_password(serializer.data.get('new_password'))
            user.save()
            
            return Response(
                {'message': 'Password changed successfully'},
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)