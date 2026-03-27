from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .models import User, StudentProfile, SupervisorProfile, AdminProfile

class UserSerializer(serializers.ModelSerializer):
    """Basic User Serializer - No department/company fields (moved to profiles)"""
    
    full_name = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone', 'email_verified', 'is_active', 'created_at'
        ]
    read_only_fields = ['id', 'email_verified', 'created_at']
    
    def get_full_name(self, obj):
        return obj.get_full_name()

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    
    Handles user creation with password validation.
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
        
         Ensure user doesn't mistype their password.
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


# Profile serializers

class StudentProfileSerializer(serializers.ModelSerializer):
    """Serializer for Student Profile"""
    
    completion_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = StudentProfile
        fields = [
            'id', 'registration_number', 'institution', 'faculty', 'course',
            'year_of_study', 'date_of_birth', 'gender', 'expected_graduation_year',
            'internship_status', 'profile_completed', 'completion_percentage',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'profile_completed', 'completion_percentage', 'created_at', 'updated_at']


class SupervisorProfileSerializer(serializers.ModelSerializer):
    """Serializer for Supervisor Profile"""
    
    completion_percentage = serializers.ReadOnlyField()
    supervisor_type_display = serializers.CharField(source='get_supervisor_type_display', read_only=True)
    
    class Meta:
        model = SupervisorProfile
        fields = [
            'id', 'supervisor_type', 'supervisor_type_display', 'organization_name',
            'department', 'position', 'work_email', 'office_phone', 'specialization',
            'years_of_experience', 'profile_completed', 'completion_percentage',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'profile_completed', 'completion_percentage', 'created_at', 'updated_at']


class AdminProfileSerializer(serializers.ModelSerializer):
    """Serializer for Admin Profile"""
    
    class Meta:
        model = AdminProfile
        fields = ['id', 'admin_level', 'department', 'permissions', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """Complete User Profile Serializer - Combines User + Role-specific profile"""
    
    student_profile = StudentProfileSerializer(read_only=True)
    supervisor_profile = SupervisorProfileSerializer(read_only=True)
    admin_profile = AdminProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    has_complete_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone', 'email_verified', 'is_active', 'created_at',
            'student_profile', 'supervisor_profile', 'admin_profile',
            'has_complete_profile'
        ]
        read_only_fields = ['id', 'email_verified', 'created_at']
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_has_complete_profile(self, obj):
        """Check if user has completed their profile based on role"""
        if obj.role == 'student':
            return hasattr(obj, 'student_profile') and obj.student_profile.profile_completed
        elif obj.role in ['workplace_supervisor', 'academic_supervisor']:
            return hasattr(obj, 'supervisor_profile') and obj.supervisor_profile.profile_completed
        return True  # Admin always has complete profile


# backend/accounts/serializers.py

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Enhanced registration serializer with automatic profile creation"""
    
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    # Additional fields for supervisor registration
    department = serializers.CharField(required=False, allow_blank=True)
    company = serializers.CharField(required=False, allow_blank=True)  # For workplace supervisors
    organization_name = serializers.CharField(required=False, allow_blank=True)
    position = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2', 
            'first_name', 'last_name', 'role', 'phone',
            'department', 'company', 'organization_name', 'position'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        role = attrs.get('role', 'student')
        
        # Validate supervisor-specific fields
        if role in ['workplace_supervisor', 'academic_supervisor']:
            if not attrs.get('organization_name'):
                raise serializers.ValidationError({
                    "organization_name": "Organization name is required for supervisors"
                })
            if not attrs.get('position'):
                raise serializers.ValidationError({
                    "position": "Position is required for supervisors"
                })
        
        # Validate academic supervisor department
        if role == 'academic_supervisor':
            if not attrs.get('department'):
                raise serializers.ValidationError({
                    "department": "Department is required for academic supervisors"
                })
        
        # Validate workplace supervisor company
        if role == 'workplace_supervisor':
            if not attrs.get('company'):
                raise serializers.ValidationError({
                    "company": "Company name is required for workplace supervisors"
                })
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        role = validated_data.pop('role', 'student')
        
        # Extract supervisor-specific fields
        department = validated_data.pop('department', '')
        company = validated_data.pop('company', '')
        organization_name = validated_data.pop('organization_name', '')
        position = validated_data.pop('position', '')
        
        # Create user
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.role = role
        user.save()
        
        # Auto-create profile based on role
        if role == 'student':
            StudentProfile.objects.create(
                user=user,
                registration_number=f"TEMP{user.id:06d}",
                institution="To be updated",
                course="To be updated",
                year_of_study=1,
                expected_graduation_year=2026
            )
            
        elif role in ['workplace_supervisor', 'academic_supervisor']:
            SupervisorProfile.objects.create(
                user=user,
                supervisor_type='workplace' if role == 'workplace_supervisor' else 'academic',
                organization_name=organization_name,
                department=department if role == 'academic_supervisor' else '',
                position=position,
                work_email=validated_data.get('email', '')
            )
            
        elif role == 'admin':
            AdminProfile.objects.create(user=user)
        
        return user
    
    
class ProfileUpdateSerializer(serializers.Serializer):
    """Serializer for updating profile - dynamic based on role"""
    
    # Common fields (user-level)
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    phone = serializers.CharField(required=False)
    
    # Student-specific fields
    registration_number = serializers.CharField(required=False)
    institution = serializers.CharField(required=False)
    faculty = serializers.CharField(required=False)
    course = serializers.CharField(required=False)
    year_of_study = serializers.IntegerField(required=False, min_value=1, max_value=6)
    date_of_birth = serializers.DateField(required=False)
    gender = serializers.ChoiceField(required=False, choices=['M', 'F', 'O', 'P'])
    expected_graduation_year = serializers.IntegerField(required=False)
    
    # Supervisor-specific fields
    organization_name = serializers.CharField(required=False)
    department = serializers.CharField(required=False)
    position = serializers.CharField(required=False)
    work_email = serializers.EmailField(required=False)
    office_phone = serializers.CharField(required=False)
    specialization = serializers.CharField(required=False)
    years_of_experience = serializers.IntegerField(required=False, min_value=0)
    
    def validate_registration_number(self, value):
        """Validate registration number format and uniqueness"""
        import re
        if not re.match(r'^[A-Z0-9]{6,20}$', value):
            raise serializers.ValidationError(
                'Registration number must be 6-20 alphanumeric characters'
            )
        return value