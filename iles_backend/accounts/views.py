import logging
import random

from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta

from auditing.audit import log_action
from auditing.models import AuditLog

from .models import PasswordResetCode, User
from .permissions import IsAdmin
from .serializers import (
    AdminProfileSerializer,
    ChangePasswordSerializer,
    ForgotPasswordConfirmSerializer,
    ForgotPasswordRequestSerializer,
    LoginSerializer,
    StudentProfileSerializer,
    SupervisorProfileSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
)

logger = logging.getLogger(__name__)


class RegisterView(APIView):
    """User registration with automatic role-based profile creation."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Supervisors are not auto-signed-in at registration time.
        if user.role in ['workplace_supervisor', 'academic_supervisor']:
            return Response(
                {
                    'user': UserProfileSerializer(user).data,
                    'approval_required': True,
                    'message': (
                        'Registration successful. You may login once, then wait for admin approval.'
                    ),
                },
                status=status.HTTP_201_CREATED,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'user': UserProfileSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Registration successful',
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """Authenticate a user and return JWT tokens."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = getattr(serializer, 'user', None)
            if user:
                log_action(
                    action=AuditLog.ACTION_LOGIN,
                    entity_type=AuditLog.ENTITY_USER,
                    entity_id=user.id,
                    entity_description=f'User login: {user.username}',
                    actor=user,
                    previous_value={'status': 'anonymous'},
                    new_value={'status': 'authenticated'},
                )
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """Invalidate refresh token via blacklist."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            if request.user and request.user.is_authenticated:
                log_action(
                    action=AuditLog.ACTION_LOGOUT,
                    entity_type=AuditLog.ENTITY_USER,
                    entity_id=request.user.id,
                    entity_description=f'User logout: {request.user.username}',
                    actor=request.user,
                    previous_value={'status': 'authenticated'},
                    new_value={'status': 'logged_out'},
                )

            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
        except TokenError as exc:
            logger.error("Token error during logout: %s", str(exc))
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:  # pragma: no cover
            logger.error("Unexpected error during logout: %s", str(exc))
            return Response({"error": "Logout failed"}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """Get/update current user and role-specific profile."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        payload = request.data

        # Update core user fields.
        for field in [
            "first_name",
            "last_name",
            "other_names",
            "phone",
            "alternative_phone",
            "country",
            "city",
            "profile_picture",
        ]:
            if field in payload:
                setattr(user, field, payload[field])
        user.save()

        # Support both nested and flat payloads.
        student_payload = payload.get("student_profile", payload)
        supervisor_payload = payload.get("supervisor_profile", payload)
        admin_payload = payload.get("admin_profile", payload)

        if user.role == "student" and hasattr(user, "student_profile"):
            serializer = StudentProfileSerializer(user.student_profile, data=student_payload, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()

        elif user.role in ["workplace_supervisor", "academic_supervisor"] and hasattr(
            user, "supervisor_profile"
        ):
            serializer = SupervisorProfileSerializer(
                user.supervisor_profile,
                data=supervisor_payload,
                partial=True,
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()

        elif user.role == "admin" and hasattr(user, "admin_profile"):
            serializer = AdminProfileSerializer(user.admin_profile, data=admin_payload, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()

        return Response(UserProfileSerializer(user).data, status=status.HTTP_200_OK)


class ProfileCompletionView(APIView):
    """Return current user's profile-completion details."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == "student" and hasattr(user, "student_profile"):
            profile = user.student_profile
            return Response(
                {
                    "completed": profile.profile_completed,
                    "percentage": profile.completion_percentage(),
                    "required_fields": [
                        "registration_number",
                        "institution",
                        "faculty",
                        "department",
                        "course",
                        "year_of_study",
                        "expected_graduation_year",
                    ],
                }
            )

        if user.role in ["workplace_supervisor", "academic_supervisor"] and hasattr(
            user, "supervisor_profile"
        ):
            profile = user.supervisor_profile
            return Response(
                {
                    "completed": profile.profile_completed,
                    "percentage": profile.completion_percentage(),
                    "required_fields": (
                        [
                            "supervisor_type",
                            "organization_name",
                            "department",
                            "position",
                            "location",
                        ]
                        if profile.supervisor_type == "workplace"
                        else [
                            "supervisor_type",
                            "organization_name",
                            "faculty",
                            "department",
                        ]
                    ),
                }
            )

        if user.role == "admin" and hasattr(user, "admin_profile"):
            return Response({"completed": True, "percentage": 100})

        return Response(
            {
                "completed": False,
                "percentage": 0,
                "message": "Profile has not been initialized for this role",
            },
            status=status.HTTP_404_NOT_FOUND,
        )


class AdminProfileListView(APIView):
    """List all user profiles (admin only)."""

    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        role = request.query_params.get("role")
        users = User.objects.all().order_by("-created_at")
        if role:
            users = users.filter(role=role)

        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)


class AdminSupervisorApprovalListView(APIView):
    """List supervisor accounts and their approval status."""

    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        pending_only = request.query_params.get('pending') == 'true'
        users = User.objects.filter(role__in=['workplace_supervisor', 'academic_supervisor']).order_by('-created_at')

        if pending_only:
            users = users.filter(admin_approved=False)

        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)


class AdminSupervisorApprovalActionView(APIView):
    """Approve or revoke a supervisor account."""

    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def patch(self, request, user_id):
        approved = request.data.get('approved')
        if approved is None:
            return Response({'error': 'approved is required'}, status=status.HTTP_400_BAD_REQUEST)

        target_user = User.objects.filter(
            id=user_id,
            role__in=['workplace_supervisor', 'academic_supervisor'],
        ).first()
        if not target_user:
            return Response({'error': 'Supervisor account not found'}, status=status.HTTP_404_NOT_FOUND)

        target_user.admin_approved = bool(approved)
        target_user.save(update_fields=['admin_approved', 'updated_at'])

        return Response(
            {
                'message': 'Approval status updated successfully',
                'user': UserProfileSerializer(target_user).data,
            },
            status=status.HTTP_200_OK,
        )


class ChangePasswordView(APIView):
    """Change authenticated user password."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            raise PermissionDenied("Wrong current password")

        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)


class ForgotPasswordRequestView(APIView):
    """Generate a one-time reset code for an account email."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        user = User.objects.filter(email__iexact=email).first()

        # Always return generic response to avoid user enumeration.
        if not user:
            return Response(
                {'message': 'If this email exists, a reset code has been sent.'},
                status=status.HTTP_200_OK,
            )

        PasswordResetCode.objects.filter(user=user, is_used=False).update(is_used=True)
        code = f"{random.randint(0, 999999):06d}"
        expires_at = timezone.now() + timedelta(minutes=15)
        PasswordResetCode.objects.create(user=user, code=code, expires_at=expires_at)

        logger.info('Password reset code for %s: %s', user.email, code)
        return Response(
            {'message': 'If this email exists, a reset code has been sent.'},
            status=status.HTTP_200_OK,
        )


class ForgotPasswordConfirmView(APIView):
    """Validate reset code and set a new password."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response({'error': 'Invalid reset code or email.'}, status=status.HTTP_400_BAD_REQUEST)

        reset_code = PasswordResetCode.objects.filter(
            user=user,
            code=code,
            is_used=False,
            expires_at__gte=timezone.now(),
        ).first()

        if not reset_code:
            return Response({'error': 'Invalid or expired reset code.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save(update_fields=['password', 'updated_at'])
        reset_code.is_used = True
        reset_code.save(update_fields=['is_used'])

        return Response({'message': 'Password reset successful.'}, status=status.HTTP_200_OK)