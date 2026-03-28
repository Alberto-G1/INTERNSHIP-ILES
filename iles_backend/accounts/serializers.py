from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import AdminProfile, StudentProfile, SupervisorProfile, User


class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer for auth/session payloads."""

    full_name = serializers.SerializerMethodField()
    is_verified = serializers.BooleanField(source='email_verified', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'other_names',
            'full_name',
            'role',
            'phone',
            'alternative_phone',
            'country',
            'city',
            'profile_picture',
            'email_verified',
            'is_verified',
            'is_active',
            'created_at',
        ]
        read_only_fields = ['id', 'email_verified', 'created_at']

    def get_full_name(self, obj):
        return obj.get_full_name()


class RegisterSerializer(serializers.ModelSerializer):
    """Simple registration serializer."""

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'password2',
            'first_name',
            'last_name',
            'other_names',
            'role',
            'phone',
            'alternative_phone',
            'country',
            'city',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """Validate credentials and return JWT tokens."""

    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid username or password.")

        if not user.is_active:
            raise serializers.ValidationError("This account is disabled.")

        refresh = RefreshToken.for_user(user)
        return {
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords don't match."})
        return attrs


class StudentProfileSerializer(serializers.ModelSerializer):
    completion_percentage = serializers.ReadOnlyField()

    class Meta:
        model = StudentProfile
        fields = [
            'id',
            'registration_number',
            'student_number',
            'institution',
            'faculty',
            'department',
            'course',
            'year_of_study',
            'semester',
            'date_of_birth',
            'gender',
            'nationality',
            'expected_graduation_year',
            'internship_status',
            'disability_status',
            'special_needs',
            'profile_picture',
            'profile_completed',
            'completion_percentage',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'profile_completed', 'completion_percentage', 'created_at', 'updated_at']


class SupervisorProfileSerializer(serializers.ModelSerializer):
    completion_percentage = serializers.ReadOnlyField()
    supervisor_type_display = serializers.CharField(source='get_supervisor_type_display', read_only=True)

    class Meta:
        model = SupervisorProfile
        fields = [
            'id',
            'supervisor_type',
            'supervisor_type_display',
            'organization_name',
            'organization_type',
            'industry',
            'location',
            'faculty',
            'department',
            'position',
            'work_email',
            'work_phone',
            'office_phone',
            'office_address',
            'specialization',
            'years_of_experience',
            'profile_picture',
            'profile_completed',
            'completion_percentage',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'profile_completed', 'completion_percentage', 'created_at', 'updated_at']


class AdminProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminProfile
        fields = [
            'id',
            'admin_level',
            'department',
            'profile_picture',
            'permissions',
            'can_manage_users',
            'can_assign_placements',
            'can_view_reports',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """User serializer with nested role profile details."""

    student_profile = StudentProfileSerializer(read_only=True)
    supervisor_profile = SupervisorProfileSerializer(read_only=True)
    admin_profile = AdminProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    has_complete_profile = serializers.SerializerMethodField()
    is_verified = serializers.BooleanField(source='email_verified', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'other_names',
            'full_name',
            'role',
            'phone',
            'alternative_phone',
            'country',
            'city',
            'profile_picture',
            'email_verified',
            'is_verified',
            'is_active',
            'created_at',
            'student_profile',
            'supervisor_profile',
            'admin_profile',
            'has_complete_profile',
        ]
        read_only_fields = ['id', 'email_verified', 'created_at']

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_has_complete_profile(self, obj):
        if obj.role == 'student':
            return hasattr(obj, 'student_profile') and obj.student_profile.profile_completed
        if obj.role in ['workplace_supervisor', 'academic_supervisor']:
            return hasattr(obj, 'supervisor_profile') and obj.supervisor_profile.profile_completed
        if obj.role == 'admin':
            return hasattr(obj, 'admin_profile')
        return False


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Registration serializer with automatic role-profile creation."""

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    organization_name = serializers.CharField(required=False, allow_blank=True)
    position = serializers.CharField(required=False, allow_blank=True)
    department = serializers.CharField(required=False, allow_blank=True)
    supervisor_type = serializers.ChoiceField(required=False, choices=['workplace', 'academic'])
    other_names = serializers.CharField(required=False, allow_blank=True)
    alternative_phone = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'password2',
            'first_name',
            'last_name',
            'other_names',
            'role',
            'phone',
            'alternative_phone',
            'country',
            'city',
            'organization_name',
            'position',
            'department',
            'supervisor_type',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        if not attrs.get('country'):
            raise serializers.ValidationError({"country": "Country is required."})

        if not attrs.get('phone'):
            raise serializers.ValidationError({"phone": "Phone number is required."})

        role = attrs.get('role', 'student')
        if role in ['workplace_supervisor', 'academic_supervisor']:
            if not attrs.get('organization_name'):
                raise serializers.ValidationError({"organization_name": "Organization name is required for supervisors"})
            if not attrs.get('position'):
                raise serializers.ValidationError({"position": "Position is required for supervisors"})

        if role == 'academic_supervisor' and not attrs.get('department'):
            raise serializers.ValidationError({"department": "Department is required for academic supervisors"})

        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        role = validated_data.pop('role', 'student')

        organization_name = validated_data.pop('organization_name', '')
        position = validated_data.pop('position', '')
        department = validated_data.pop('department', '')
        supervisor_type = validated_data.pop('supervisor_type', '')

        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.role = role
        user.save()

        if role == 'student':
            StudentProfile.objects.create(
                user=user,
                registration_number=f"TEMP{user.id:06d}",
                institution="To be updated",
                faculty="To be updated",
                department="To be updated",
                course="To be updated",
                year_of_study=1,
                expected_graduation_year=2026,
            )
        elif role in ['workplace_supervisor', 'academic_supervisor']:
            SupervisorProfile.objects.create(
                user=user,
                supervisor_type=supervisor_type or ('workplace' if role == 'workplace_supervisor' else 'academic'),
                organization_name=organization_name,
                department=department,
                faculty='To be updated' if role == 'academic_supervisor' else '',
                location='To be updated' if role == 'workplace_supervisor' else '',
                position=position,
                work_email=user.email,
            )
        elif role == 'admin':
            AdminProfile.objects.create(user=user)

        return user


class ProfileUpdateSerializer(serializers.Serializer):
    """Loose serializer kept for backward compatibility with existing callers."""

    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    other_names = serializers.CharField(required=False)
    phone = serializers.CharField(required=False)
    alternative_phone = serializers.CharField(required=False)
    country = serializers.CharField(required=False)
    city = serializers.CharField(required=False)
    profile_picture = serializers.ImageField(required=False)

    registration_number = serializers.CharField(required=False)
    student_number = serializers.CharField(required=False)
    institution = serializers.CharField(required=False)
    faculty = serializers.CharField(required=False)
    department = serializers.CharField(required=False)
    course = serializers.CharField(required=False)
    year_of_study = serializers.IntegerField(required=False, min_value=1, max_value=6)
    semester = serializers.IntegerField(required=False, min_value=1)
    date_of_birth = serializers.DateField(required=False)
    gender = serializers.ChoiceField(required=False, choices=['M', 'F', 'O', 'P'])
    nationality = serializers.CharField(required=False)
    expected_graduation_year = serializers.IntegerField(required=False)
    disability_status = serializers.BooleanField(required=False)
    special_needs = serializers.CharField(required=False, allow_blank=True)
    internship_status = serializers.ChoiceField(
        required=False,
        choices=['not_assigned', 'assigned', 'ongoing', 'completed'],
    )

    organization_name = serializers.CharField(required=False)
    organization_type = serializers.CharField(required=False)
    industry = serializers.CharField(required=False)
    location = serializers.CharField(required=False)
    department = serializers.CharField(required=False)
    position = serializers.CharField(required=False)
    work_email = serializers.EmailField(required=False)
    work_phone = serializers.CharField(required=False)
    office_phone = serializers.CharField(required=False)
    office_address = serializers.CharField(required=False, allow_blank=True)
    specialization = serializers.CharField(required=False)
    years_of_experience = serializers.IntegerField(required=False, min_value=0)

    admin_level = serializers.CharField(required=False)
    can_manage_users = serializers.BooleanField(required=False)
    can_assign_placements = serializers.BooleanField(required=False)
    can_view_reports = serializers.BooleanField(required=False)
