from django.apps import AppConfig


class AuditingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'auditing'

    def ready(self):
        import auditing.signals
        import auditing.auth_signals
