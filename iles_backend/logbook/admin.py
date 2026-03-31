from django.contrib import admin

from .models import SupervisorReview, WeeklyLog, WeeklyLogAuditTrail


@admin.register(WeeklyLog)
class WeeklyLogAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'student',
        'placement',
        'week_number',
        'week_ending_date',
        'submission_status',
        'review_status',
        'is_late',
        'created_at',
    ]
    list_filter = ['submission_status', 'review_status', 'is_late', 'week_ending_date']
    search_fields = ['student__username', 'student__first_name', 'student__last_name', 'placement__organization__name']
    readonly_fields = ['created_at', 'updated_at', 'submitted_at', 'reviewed_at']


@admin.register(SupervisorReview)
class SupervisorReviewAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'weekly_log',
        'supervisor',
        'decision',
        'review_round',
        'rating',
        'reviewed_at',
    ]
    list_filter = ['decision', 'review_round', 'reviewed_at']
    search_fields = ['weekly_log__student__username', 'supervisor__username', 'comments']
    readonly_fields = ['reviewed_at']


@admin.register(WeeklyLogAuditTrail)
class WeeklyLogAuditTrailAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'weekly_log',
        'actor',
        'action_type',
        'previous_state',
        'new_state',
        'created_at',
    ]
    list_filter = ['action_type', 'created_at']
    search_fields = ['weekly_log__student__username', 'actor__username', 'notes']
    readonly_fields = ['created_at']
