from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver

from .audit import log_action
from .models import AuditLog


@receiver(user_logged_in)
def audit_user_logged_in(sender, request, user, **kwargs):
    log_action(
        action=AuditLog.ACTION_LOGIN,
        entity_type=AuditLog.ENTITY_USER,
        entity_id=user.id,
        entity_description=f'User login: {user.username}',
        actor=user,
        previous_value=None,
        new_value={'status': 'logged_in'},
    )


@receiver(user_logged_out)
def audit_user_logged_out(sender, request, user, **kwargs):
    if not user:
        return

    log_action(
        action=AuditLog.ACTION_LOGOUT,
        entity_type=AuditLog.ENTITY_USER,
        entity_id=user.id,
        entity_description=f'User logout: {user.username}',
        actor=user,
        previous_value={'status': 'logged_in'},
        new_value={'status': 'logged_out'},
    )
