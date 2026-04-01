from django.apps import AppConfig
from django.core.signals import request_started


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        from .startup import ensure_default_admin_once

        request_started.connect(ensure_default_admin_once, dispatch_uid='accounts.ensure_default_admin_once')
