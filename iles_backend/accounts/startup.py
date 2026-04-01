import os

from django.contrib.auth import get_user_model
from django.db.utils import OperationalError, ProgrammingError


_SEEDED = False


def ensure_default_admin():
    User = get_user_model()

    username = os.environ.get('ILES_ADMIN_USERNAME', 'Administrator')
    email = os.environ.get('ILES_ADMIN_EMAIL', 'admin@iles.local')
    password = os.environ.get('ILES_ADMIN_PASSWORD', 'Admin@12345')

    try:
        admin_user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            },
        )
    except (OperationalError, ProgrammingError):
        # DB tables may not exist yet during early startup/migrations.
        return

    updated_fields = []
    if admin_user.role != 'admin':
        admin_user.role = 'admin'
        updated_fields.append('role')
    if not admin_user.is_staff:
        admin_user.is_staff = True
        updated_fields.append('is_staff')
    if not admin_user.is_superuser:
        admin_user.is_superuser = True
        updated_fields.append('is_superuser')
    if not admin_user.is_active:
        admin_user.is_active = True
        updated_fields.append('is_active')
    if admin_user.email != email:
        admin_user.email = email
        updated_fields.append('email')

    if created or not admin_user.check_password(password):
        admin_user.set_password(password)
        updated_fields.append('password')

    if updated_fields:
        admin_user.save(update_fields=updated_fields)


def ensure_default_admin_once(*args, **kwargs):
    global _SEEDED
    if _SEEDED:
        return

    ensure_default_admin()
    _SEEDED = True
