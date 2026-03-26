from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Register your models here.

class CustomUserAdmin(UserAdmin):
    """
    Custom admin interface for User model.
    
    Show all our custom fields in the admin interface.
    """
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active')
    list_filter = ('role', 'is_active', 'email_verified')
    
    # Add custom fields to the admin forms
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Information', {
            'fields': ('role', 'phone', 'department', 'company', 'email_verified')
        }),
    )
    
    # Fields to show in add user form
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Information', {
            'fields': ('role', 'phone', 'department', 'company')
        }),
    )

admin.site.register(User, CustomUserAdmin)