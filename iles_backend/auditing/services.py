from concurrent.futures import ThreadPoolExecutor

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import EmailMultiAlternatives
from django.db import transaction
from django.template.loader import render_to_string

from .models import Notification

User = get_user_model()
_EMAIL_EXECUTOR = ThreadPoolExecutor(max_workers=2)


def _build_action_url(reference_type, reference_id):
    base = getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:5173').rstrip('/')
    if not reference_type or not reference_id:
        return f'{base}/dashboard'

    route_map = {
        'Placement': f'/placements/{reference_id}',
        'WeeklyLog': '/logs',
        'PlacementEvaluation': '/evaluations',
        'FinalInternshipScore': '/evaluations',
    }
    path = route_map.get(reference_type, '/dashboard')
    return f'{base}{path}'


def _send_notification_email(notification, recipient):
    if not recipient.email:
        return

    context = {
        'recipient_name': recipient.get_full_name() or recipient.username,
        'title': notification.title,
        'message': notification.message,
        'notification_type': notification.notification_type,
        'action_url': _build_action_url(notification.reference_type, notification.reference_id),
    }

    subject = render_to_string('auditing/emails/notification_subject.txt', context).strip()
    text_body = render_to_string('auditing/emails/notification_body.txt', context)
    html_body = render_to_string('auditing/emails/notification_body.html', context)

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@iles.local'),
        to=[recipient.email],
    )
    email.attach_alternative(html_body, 'text/html')
    email.send(fail_silently=True)


def queue_notification_email(notification, recipient):
    # on_commit keeps async dispatch consistent with DB state.
    transaction.on_commit(lambda: _EMAIL_EXECUTOR.submit(_send_notification_email, notification, recipient))


def notify_user(
    recipient_id,
    title,
    message,
    notification_type='info',
    reference_type=None,
    reference_id=None,
    send_email=False,
):
    """
    Create a notification for a user.
    
    Args:
        recipient_id: ID of the user to notify
        title: Notification title
        message: Notification message
        notification_type: 'info', 'success', 'warning', 'error'
        reference_type: Related entity type (optional)
        reference_id: Related entity ID (optional)
    """
    try:
        recipient = User.objects.get(id=recipient_id)
        notification = Notification.objects.create(
            recipient=recipient,
            title=title,
            message=message,
            notification_type=notification_type,
            reference_type=reference_type,
            reference_id=reference_id,
        )

        if send_email:
            queue_notification_email(notification, recipient)

        return notification
    except User.DoesNotExist:
        return None


def notify_users(
    user_ids,
    title,
    message,
    notification_type='info',
    reference_type=None,
    reference_id=None,
    send_email=False,
):
    """Notify multiple users."""
    for user_id in user_ids:
        notify_user(
            user_id,
            title,
            message,
            notification_type=notification_type,
            reference_type=reference_type,
            reference_id=reference_id,
            send_email=send_email,
        )


def notify_by_role(
    role,
    title,
    message,
    notification_type='info',
    reference_type=None,
    reference_id=None,
    send_email=False,
):
    """Notify all users with a specific role."""
    users = User.objects.filter(role=role, is_active=True)
    for user in users:
        notify_user(
            user.id,
            title,
            message,
            notification_type=notification_type,
            reference_type=reference_type,
            reference_id=reference_id,
            send_email=send_email,
        )
