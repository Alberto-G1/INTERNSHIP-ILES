from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

# Create your models here.

class User(AbstractUser):
    """
    Custom User Model extending Django's AbstractUser.
    
    Why extend AbstractUser instead of AbstractBaseUser?
    - AbstractUser includes all Django's default auth fields (username, password, etc.)
    - We only need to add extra fields, not rewrite everything
    - Saves time and reduces bugs
    """
    
    # Role choices for RBAC (Role-Based Access Control)
    # Why: Different users have different permissions in the system
    ROLE_CHOICES = (
        ('student', 'Student Intern'),
        ('workplace_supervisor', 'Workplace Supervisor'),
        ('academic_supervisor', 'Academic Supervisor'),
        ('admin', 'Internship Administrator'),
    )
    
    # Role field - determines what user can do in the system
    # Why: Essential for RBAC - controls access to different modules
    role = models.CharField(
        max_length=25, 
        choices=ROLE_CHOICES, 
        default='student',
        help_text="User's role in the system determines their permissions"
    )
    
    # Contact information
    # Why: Need to contact users for notifications and verification
    phone = models.CharField(
        max_length=15, 
        blank=True,
        help_text="Contact number for communication"
    )
    
    # Department - relevant for students and academic supervisors
    # Why: To know which department the user belongs to
    department = models.CharField(
        max_length=100, 
        blank=True,
        help_text="Academic department (for students and academic supervisors)"
    )
    
    # Company - relevant for workplace supervisors
    # Why: To know which company the supervisor represents
    company = models.CharField(
        max_length=200, 
        blank=True,
        help_text="Company name (for workplace supervisors)"
    )
    
    # Email verification status
    # Why: Ensure valid email addresses for communication
    email_verified = models.BooleanField(
        default=False,
        help_text="Whether user has verified their email address"
    )
    
    # Account status
    # Why: Allow admins to temporarily disable accounts
    is_active = models.BooleanField(
        default=True,
        help_text="Whether user account is active"
    )
    
    # Timestamps for tracking
    # Why: Useful for auditing and debugging
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'  # Custom table name
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        """String representation for admin interface and debugging"""
        return f"{self.username} - {self.get_role_display()}"
    
    def get_full_name(self):
        """Return full name with role for display"""
        return f"{self.first_name} {self.last_name} ({self.get_role_display()})"