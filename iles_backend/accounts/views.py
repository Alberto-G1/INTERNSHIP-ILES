import logging

from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .permissions import IsAdmin
from .serializers import (
    AdminProfileSerializer,
    ChangePasswordSerializer,
    LoginSerializer,
    StudentProfileSerializer,
    SupervisorProfileSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
)

logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    """User registration with automatic role-based profile creation."""

    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer


class LoginView(APIView):
    """Authenticate a user and return JWT tokens."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """Invalidate refresh token via blacklist."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
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