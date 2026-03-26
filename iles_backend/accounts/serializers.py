from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.
    
    Why: Converts User objects to JSON and validates incoming data.
    Controls what data is exposed to the frontend.
    """
    
    # Additional field for full name
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        # Fields to include in JSON response
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 
            'full_name', 'role', 'phone', 'department', 'company',
            'email_verified', 'created_at'
        )
        # Fields that cannot be modified via API
        read_only_fields = ('id', 'email_verified', 'created_at')
    
    def get_full_name(self, obj):
        """Get user's full name"""
        return obj.get_full_name()

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    
    Why: Handles user creation with password validation.
    Separates registration logic from regular user serialization.
    """
    
    password = serializers.CharField(
        write_only=True,  # Password should never be sent back in responses
        required=True,
        validators=[validate_password]  # Use Django's built-in password validators
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        label="Confirm Password"
    )
    
    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password2',
            'first_name', 'last_name', 'role', 'phone', 
            'department', 'company'
        )
    
    def validate(self, attrs):
        """
        Validate passwords match.
        
        Why: Ensure user doesn't mistype their password.
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs
    
    def create(self, validated_data):
        """
        Create new user.
        
        Why: Remove password2 and use create_user method to hash password properly.
        """
        # Remove password2 as it's not a model field
        validated_data.pop('password2')
        
        # Create user with hashed password
        user = User.objects.create_user(**validated_data)
        
        return user

class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    
    Why: Validates credentials and returns JWT tokens.
    """
    username = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """
        Validate username and password.
        
        Why: Check if credentials are correct and user is active.
        """
        username = attrs.get('username')
        password = attrs.get('password')
        
        # Authenticate user
        user = authenticate(username=username, password=password)
        
        if not user:
            raise serializers.ValidationError(
                "Invalid username or password."
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                "This account is disabled."
            )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return {
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change.
    
    Why: Allow authenticated users to change their password.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password]
    )
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        """
        Validate passwords match.
        """
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords don't match."}
            )
        return attrs