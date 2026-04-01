from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    # Action type choices
    ACTION_CREATE = 'CREATE'
    ACTION_UPDATE = 'UPDATE'
    ACTION_DELETE = 'DELETE'
    ACTION_SUBMIT = 'SUBMIT'
    ACTION_APPROVE = 'APPROVE'
    ACTION_REJECT = 'REJECT'
    ACTION_LOGIN = 'LOGIN'
    ACTION_LOGOUT = 'LOGOUT'
    ACTION_FINALIZE = 'FINALIZE'
    ACTION_COMPUTE = 'COMPUTE'

    ACTION_CHOICES = (
        (ACTION_CREATE, 'Create'),
        (ACTION_UPDATE, 'Update'),
        (ACTION_DELETE, 'Delete'),
        (ACTION_SUBMIT, 'Submit'),
        (ACTION_APPROVE, 'Approve'),
        (ACTION_REJECT, 'Reject'),
        (ACTION_LOGIN, 'Login'),
        (ACTION_LOGOUT, 'Logout'),
        (ACTION_FINALIZE, 'Finalize'),
        (ACTION_COMPUTE, 'Compute'),
    )

    # Entity type choices
    ENTITY_USER = 'User'
    ENTITY_PLACEMENT = 'Placement'
    ENTITY_LOGBOOK = 'WeeklyLog'
    ENTITY_EVALUATION = 'PlacementEvaluation'
    ENTITY_SCORE = 'FinalInternshipScore'

    ENTITY_CHOICES = (
        (ENTITY_USER, 'User'),
        (ENTITY_PLACEMENT, 'Placement'),
        (ENTITY_LOGBOOK, 'Weekly Log'),
        (ENTITY_EVALUATION, 'Evaluation'),
        (ENTITY_SCORE, 'Final Score'),
    )

    # Actor
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs_as_actor',
    )
    actor_role = models.CharField(
        max_length=50,
        blank=True,
        help_text='Role of actor at time of action',
    )

    # Action
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)

    # Target entity
    entity_type = models.CharField(max_length=50, choices=ENTITY_CHOICES)
    entity_id = models.IntegerField()
    entity_description = models.CharField(
        max_length=255,
        blank=True,
        help_text='Human-readable description of the entity',
    )

    # Changes
    previous_value = models.JSONField(
        null=True,
        blank=True,
        help_text='Previous state before change',
    )
    new_value = models.JSONField(
        null=True,
        blank=True,
        help_text='New state after change',
    )

    # Context
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text='IP address of request',
    )
    user_agent = models.TextField(
        blank=True,
        help_text='Browser/client info',
    )

    # Timestamps
    action_time = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-action_time']
        indexes = [
            models.Index(fields=['actor', '-action_time']),
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['action']),
            models.Index(fields=['-action_time']),
        ]

    def __str__(self):
        return f"{self.actor} {self.action} {self.entity_type}#{self.entity_id} at {self.action_time}"


class Notification(models.Model):
    # Type choices
    TYPE_INFO = 'info'
    TYPE_SUCCESS = 'success'
    TYPE_WARNING = 'warning'
    TYPE_ERROR = 'error'

    TYPE_CHOICES = (
        (TYPE_INFO, 'Info'),
        (TYPE_SUCCESS, 'Success'),
        (TYPE_WARNING, 'Warning'),
        (TYPE_ERROR, 'Error'),
    )

    # Entity reference for notifications (optional)
    REFERENCE_PLACEMENT = 'Placement'
    REFERENCE_LOGBOOK = 'WeeklyLog'
    REFERENCE_EVALUATION = 'PlacementEvaluation'
    REFERENCE_SCORE = 'FinalInternshipScore'

    REFERENCE_CHOICES = (
        (REFERENCE_PLACEMENT, 'Placement'),
        (REFERENCE_LOGBOOK, 'Weekly Log'),
        (REFERENCE_EVALUATION, 'Evaluation'),
        (REFERENCE_SCORE, 'Final Score'),
    )

    # Recipient
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )

    # Content
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default=TYPE_INFO,
    )

    # Reference to related entity (optional)
    reference_type = models.CharField(
        max_length=50,
        choices=REFERENCE_CHOICES,
        null=True,
        blank=True,
    )
    reference_id = models.IntegerField(null=True, blank=True)

    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['recipient', 'is_read']),
        ]

    def __str__(self):
        return f"Notification for {self.recipient}: {self.title}"
