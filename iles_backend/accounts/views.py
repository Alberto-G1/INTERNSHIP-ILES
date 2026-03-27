from django.shortcuts import render
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import authenticate
from .models import User
from rest_framework_simplejwt.exceptions import TokenError
import logging
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from .models import User, StudentProfile, SupervisorProfile
from .serializers import (
    LoginSerializer, ChangePasswordSerializer, UserRegistrationSerializer,
    UserSerializer, UserProfileSerializer, RegisterSerializer,
    StudentProfileSerializer, SupervisorProfileSerializer, ProfileUpdateSerializer
)
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
    
    Allow users to view and update their profile.
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
        
        Allow users to update their information.
        """
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    """
    Password Change View.
    
    Allow users to change their password securely.
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


class RegisterView(generics.CreateAPIView):
    """User Registration with automatic profile creation"""
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer


class UserProfileView(APIView):
    """Get and update current user's complete profile"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get current user's profile"""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        """Update current user's profile"""
        user = request.user
        profile_data = request.data
        
        # Update user fields
        user_fields = ['first_name', 'last_name', 'phone']
        for field in user_fields:
            if field in profile_data:
                setattr(user, field, profile_data[field])
        user.save()
        
        # Update role-specific profile
        if user.role == 'student' and hasattr(user, 'student_profile'):
            profile = user.student_profile
            profile_serializer = StudentProfileSerializer(
                profile, 
                data=profile_data, 
                partial=True
            )
            if profile_serializer.is_valid():
                profile_serializer.save()
            else:
                return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        elif user.role in ['workplace_supervisor', 'academic_supervisor'] and hasattr(user, 'supervisor_profile'):
            profile = user.supervisor_profile
            profile_serializer = SupervisorProfileSerializer(
                profile, 
                data=profile_data, 
                partial=True
            )
            if profile_serializer.is_valid():
                profile_serializer.save()
            else:
                return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Return updated profile
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)


class ProfileCompletionView(APIView):
    """Check and update profile completion status"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get profile completion status"""
        user = request.user
        
        if user.role == 'student' and hasattr(user, 'student_profile'):
            profile = user.student_profile
            completion = profile.completion_percentage()
            return Response({
                'completed': profile.profile_completed,
                'percentage': completion,
                'required_fields': ['registration_number', 'institution', 'course', 'year_of_study', 'expected_graduation_year']
            })
            
        elif user.role in ['workplace_supervisor', 'academic_supervisor'] and hasattr(user, 'supervisor_profile'):
            profile = user.supervisor_profile
            completion = profile.completion_percentage()
            return Response({
                'completed': profile.profile_completed,
                'percentage': completion,
                'required_fields': ['supervisor_type', 'organization_name', 'position']
            })
        
        return Response({
            'completed': True,
            'percentage': 100,
            'message': 'Admin profile always complete'
        })


class AdminProfileListView(APIView):
    """Admin view to list all user profiles"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """List all profiles (admin only)"""
        if request.user.role != 'admin':
            raise PermissionDenied("Only administrators can access this endpoint")
        
        role = request.query_params.get('role')
        users = User.objects.all()
        
        if role:
            users = users.filter(role=role)
        
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)