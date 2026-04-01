from .models import AuditLog
from .request_context import get_current_request


SENSITIVE_KEYS = {
    'password',
    'new_password',
    'old_password',
    'confirm_password',
    'access',
    'refresh',
    'token',
    'secret',
}


def _sanitize_value(key, value):
    if isinstance(key, str) and key.lower() in SENSITIVE_KEYS:
        return '***REDACTED***'
    return value


def _serialize_model(instance):
    data = {}
    for field in instance._meta.fields:
        if field.name in {'id', 'created_at', 'updated_at', 'last_login'}:
            continue

        value = getattr(instance, field.name, None)
        if hasattr(value, 'isoformat'):
            serialized = value.isoformat()
        elif hasattr(value, 'name') and field.get_internal_type() in {'FileField', 'ImageField'}:
            serialized = value.name if value else None
        else:
            serialized = value

        data[field.name] = _sanitize_value(field.name, serialized)

    return data


def _dict_diff(previous_value, new_value):
    previous_value = previous_value or {}
    new_value = new_value or {}

    keys = set(previous_value.keys()) | set(new_value.keys())
    old_changes = {}
    new_changes = {}

    for key in keys:
        old_val = previous_value.get(key)
        new_val = new_value.get(key)
        if old_val != new_val:
            old_changes[key] = old_val
            new_changes[key] = new_val

    return old_changes or None, new_changes or None


def capture_previous_state(sender, instance):
    if not instance.pk:
        return

    previous = sender.objects.filter(pk=instance.pk).first()
    if not previous:
        return

    instance._audit_previous_state = _serialize_model(previous)


def get_request_context():
    request = get_current_request()
    if not request:
        return {'ip_address': None, 'user_agent': ''}

    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', '')
    ip_address = forwarded_for.split(',')[0].strip() if forwarded_for else request.META.get('REMOTE_ADDR')

    return {
        'ip_address': ip_address,
        'user_agent': request.META.get('HTTP_USER_AGENT', '')[:512],
    }


def log_action(
    action,
    entity_type,
    entity_id,
    entity_description='',
    actor=None,
    previous_value=None,
    new_value=None,
):
    context = get_request_context()
    actor_role = getattr(actor, 'role', '') if actor else ''

    old_changes, new_changes = _dict_diff(previous_value, new_value)

    AuditLog.objects.create(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_description=entity_description,
        actor=actor,
        actor_role=actor_role,
        previous_value=old_changes,
        new_value=new_changes,
        ip_address=context.get('ip_address'),
        user_agent=context.get('user_agent', ''),
    )


def serialize_model(instance):
    return _serialize_model(instance)
