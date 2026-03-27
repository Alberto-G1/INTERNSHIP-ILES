# backend/accounts/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
import re

class User(AbstractUser):
    """
    Core User Model - Authentication Identity
    """
    
    ROLE_CHOICES = (
        ('student', 'Student Intern'),
        ('workplace_supervisor', 'Workplace Supervisor'),
        ('academic_supervisor', 'Academic Supervisor'),
        ('admin', 'Internship Administrator'),
    )
    
    role = models.CharField(max_length=25, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=15, blank=True)
    email_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    def has_profile(self):
        """Check if user has a profile based on role"""
        if self.role == 'student':
            return hasattr(self, 'student_profile')
        elif self.role in ['workplace_supervisor', 'academic_supervisor']:
            return hasattr(self, 'supervisor_profile')
        return True  # Admin doesn't need profile


class StudentProfile(models.Model):
    """
    Student Profile - Represents intern in the system
    """
    
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
        ('P', 'Prefer not to say'),
    )
    
    INTERNSHIP_STATUS_CHOICES = (
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('suspended', 'Suspended'),
    )
    
    # Link to User
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='student_profile'
    )
    
    # Academic Information
    registration_number = models.CharField(
        max_length=50, 
        unique=True,
        help_text="University registration number"
    )
    institution = models.CharField(
        max_length=200,
        help_text="University or institution name"
    )
    faculty = models.CharField(
        max_length=200,
        blank=True,
        help_text="Faculty/School"
    )
    course = models.CharField(
        max_length=200,
        help_text="Course/Program of study"
    )
    year_of_study = models.PositiveIntegerField(
        help_text="Current year of study (1-6)"
    )
    
    # Personal Information
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    
    # Internship Context
    expected_graduation_year = models.PositiveIntegerField(
        help_text="Expected year of graduation"
    )
    internship_status = models.CharField(
        max_length=20, 
        choices=INTERNSHIP_STATUS_CHOICES, 
        default='not_started'
    )
    
    # Profile Completion
    profile_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'student_profiles'
        verbose_name = 'Student Profile'
        verbose_name_plural = 'Student Profiles'
    
    def __str__(self):
        return f"Student: {self.user.get_full_name()} ({self.registration_number})"
    
    def clean(self):
        """Validate registration number format and year of study"""
        # Only validate registration number if provided and not temporary
        if self.registration_number and not self.registration_number.startswith('TEMP'):
            import re
            if not re.match(r'^[A-Z0-9]{6,20}$', self.registration_number):
                raise ValidationError({
                    'registration_number': 'Registration number must be 6-20 alphanumeric characters'
                })
        
        # Only validate year_of_study if it's not None
        if self.year_of_study is not None:
            if self.year_of_study < 1 or self.year_of_study > 6:
                raise ValidationError({
                    'year_of_study': 'Year of study must be between 1 and 6'
                })
    
    def save(self, *args, **kwargs):
        """Override save to check profile completion"""
        # Don't run full_clean if we have temporary data
        if not self.registration_number.startswith('TEMP'):
            self.full_clean()
        
        # Check if profile is complete (skip temporary registration numbers)
        required_fields = ['registration_number', 'institution', 'course', 'year_of_study', 'expected_graduation_year']
        self.profile_completed = all(
            getattr(self, field) and not str(getattr(self, field)).startswith('TEMP')
            for field in required_fields
        )
        
        if self.profile_completed and not self.completed_at:
            self.completed_at = timezone.now()
        
        super().save(*args, **kwargs)
    
    def completion_percentage(self):
        """Calculate profile completion percentage"""
        fields = [
            'registration_number', 'institution', 'faculty', 'course', 
            'year_of_study', 'date_of_birth', 'gender', 'expected_graduation_year'
        ]
        completed = sum(
            1 for field in fields 
            if getattr(self, field) and not str(getattr(self, field)).startswith('TEMP')
        )
        return int((completed / len(fields)) * 100)


class SupervisorProfile(models.Model):
    """
    Supervisor Profile - For both workplace and academic supervisors
    """
    
    SUPERVISOR_TYPES = (
        ('workplace', 'Workplace Supervisor'),
        ('academic', 'Academic Supervisor'),
    )
    
    # Link to User
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='supervisor_profile'
    )
    
    # Supervisor Type
    supervisor_type = models.CharField(
        max_length=20, 
        choices=SUPERVISOR_TYPES,
        help_text="Type of supervisor"
    )
    
    # Organization Information
    organization_name = models.CharField(
        max_length=200,
        help_text="Company or institution name"
    )
    department = models.CharField(
        max_length=200,
        blank=True,
        help_text="Department/Unit"
    )
    position = models.CharField(
        max_length=100,
        help_text="Job title or position"
    )
    
    # Contact Information
    work_email = models.EmailField(
        blank=True,
        help_text="Work email (if different from user email)"
    )
    office_phone = models.CharField(
        max_length=15,
        blank=True,
        help_text="Office contact number"
    )
    
    # Professional Information
    specialization = models.CharField(
        max_length=200,
        blank=True,
        help_text="Area of expertise"
    )
    years_of_experience = models.PositiveIntegerField(
        null=True, 
        blank=True,
        help_text="Years in current role"
    )
    
    # Profile Completion
    profile_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'supervisor_profiles'
        verbose_name = 'Supervisor Profile'
        verbose_name_plural = 'Supervisor Profiles'
        indexes = [
            models.Index(fields=['supervisor_type']),
            models.Index(fields=['organization_name']),
        ]
    
    def __str__(self):
        return f"{self.get_supervisor_type_display()}: {self.user.get_full_name()} ({self.organization_name})"
    
    def clean(self):
        """Validate based on supervisor type"""
        if self.supervisor_type == 'workplace' and (not self.organization_name or self.organization_name == "To be updated"):
            # Skip validation for temporary data
            if self.organization_name != "To be updated":
                raise ValidationError({
                    'organization_name': 'Organization name is required for workplace supervisors'
                })
        
        if self.supervisor_type == 'academic' and not self.department:
            # Skip validation for temporary data
            if self.department != "To be updated":
                raise ValidationError({
                    'department': 'Department is required for academic supervisors'
                })
        elif self.supervisor_type == 'academic':
            if not self.organization_name:
                raise ValidationError({
                    'organization_name': 'Institution name is required for academic supervisors'
                })
            if not self.department:
                raise ValidationError({
                    'department': 'Department is required for academic supervisors'
                })
    
    def save(self, *args, **kwargs):
        """Override save to check profile completion"""
        # Don't run full_clean if we have temporary data
        if self.organization_name != "To be updated" and self.position != "To be updated":
            self.full_clean()
        
        # Check if profile is complete
        required_fields = ['supervisor_type', 'organization_name', 'position']
        self.profile_completed = all(
            getattr(self, field) and not str(getattr(self, field)).startswith('To be updated')
            for field in required_fields
        )
        
        if self.profile_completed and not self.completed_at:
            self.completed_at = timezone.now()
        
        super().save(*args, **kwargs)
    
    def completion_percentage(self):
        """Calculate profile completion percentage"""
        fields = [
            'supervisor_type', 'organization_name', 'department', 'position',
            'work_email', 'office_phone', 'specialization', 'years_of_experience'
        ]
        completed = sum(
            1 for field in fields 
            if getattr(self, field) and not str(getattr(self, field)).startswith('To be updated')
        )
        return int((completed / len(fields)) * 100)

class AdminProfile(models.Model):
    """
    Admin Profile - System administrators
    """
    
    ADMIN_LEVELS = (
        ('staff', 'Staff'),
        ('senior', 'Senior Admin'),
        ('super', 'Super Admin'),
    )
    
    # Link to User
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='admin_profile'
    )
    
    # Admin Information
    admin_level = models.CharField(
        max_length=10, 
        choices=ADMIN_LEVELS, 
        default='staff'
    )
    department = models.CharField(
        max_length=100,
        blank=True,
        help_text="Administrative department"
    )
    
    # Permissions (JSON field for future expansion)
    permissions = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'admin_profiles'
        verbose_name = 'Admin Profile'
        verbose_name_plural = 'Admin Profiles'
    
    def __str__(self):
        return f"Admin: {self.user.get_full_name()} ({self.get_admin_level_display()})"