from rest_framework import serializers

from .models import AuditLog, Notification


class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'actor',
            'actor_name',
            'actor_role',
            'action',
            'entity_type',
            'entity_id',
            'entity_description',
            'previous_value',
            'new_value',
            'ip_address',
            'user_agent',
            'action_time',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'actor_name',
            'action_time',
            'created_at',
        ]

    def get_actor_name(self, obj):
        if not obj.actor:
            return 'System'
        return obj.actor.get_full_name() or obj.actor.username


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id',
            'recipient',
            'title',
            'message',
            'notification_type',
            'reference_type',
            'reference_id',
            'is_read',
            'read_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'recipient',
            'created_at',
            'updated_at',
        ]


class NotificationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['is_read', 'read_at']
        read_only_fields = ['read_at']

    def update(self, instance, validated_data):
        if validated_data.get('is_read') and not instance.is_read:
            from django.utils import timezone
            instance.read_at = timezone.now()
        return super().update(instance, validated_data)
