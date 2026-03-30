from django.contrib import admin

from .models import Organization, Placement


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'region', 'district', 'is_verified', 'updated_at')
    search_fields = ('name', 'region', 'district', 'contact_email')
    list_filter = ('is_verified', 'region', 'district')


@admin.register(Placement)
class PlacementAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'student',
        'organization',
        'submission_status',
        'approval_status',
        'start_date',
        'end_date',
        'approved_by',
    )
    search_fields = ('student__username', 'student__first_name', 'student__last_name', 'organization__name')
    list_filter = ('submission_status', 'approval_status', 'work_mode')
