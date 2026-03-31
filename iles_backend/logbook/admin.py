from django.contrib import admin

from .models import WeeklyLog


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
