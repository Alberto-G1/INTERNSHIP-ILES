from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allow access only to admin users."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')


class IsStudent(BasePermission):
    """Allow access only to students."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'student')


class IsWorkplaceSupervisor(BasePermission):
    """Allow access only to workplace supervisors."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'workplace_supervisor'
        )


class IsAcademicSupervisor(BasePermission):
    """Allow access only to academic supervisors."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'academic_supervisor'
        )


class IsAnySupervisor(BasePermission):
    """Allow access to workplace and academic supervisors."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ['workplace_supervisor', 'academic_supervisor']
        )
