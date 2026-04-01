from django.contrib import admin

from .models import AuditLog, Notification


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'action',
        'entity_type',
        'entity_id',
        'actor',
        'actor_role',
        'action_time',
    ]
    list_filter = ['action', 'entity_type', 'actor_role', 'action_time']
    search_fields = ['entity_description', 'actor__username', 'actor__first_name', 'actor__last_name']
    readonly_fields = [
        'action_time',
        'created_at',
        'previous_value',
        'new_value',
    ]
    ordering = ['-action_time']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'recipient',
        'title',
        'notification_type',
        'is_read',
        'created_at',
    ]
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['recipient__username', 'title', 'message']
    readonly_fields = ['created_at', 'updated_at', 'read_at']
    ordering = ['-created_at']
