# backend/accounts/urls.py

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

"""
Accounts App URLs.

Why separate URLs file:
- Keeps accounts-related endpoints organized
- Makes it easy to add/modify account endpoints without touching main urls.py
- Can be included in main urls.py with a prefix
"""

urlpatterns = [
    # Authentication endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('forgot-password/request/', views.ForgotPasswordRequestView.as_view(), name='forgot-password-request'),
    path('forgot-password/confirm/', views.ForgotPasswordConfirmView.as_view(), name='forgot-password-confirm'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile endpoints
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/completion/', views.ProfileCompletionView.as_view(), name='profile-completion'),
    
        # Supervisor endpoints
        path('supervisors/', views.AvailableSupervisorsView.as_view(), name='available-supervisors'),
        path('supervisors/workplace/', views.AvailableSupervisorsView.as_view(), name='available-workplace-supervisors'),
        path('supervisors/academic/', views.AvailableSupervisorsView.as_view(), name='available-academic-supervisors'),
    
    # Admin endpoints
    path('admin/profiles/', views.AdminProfileListView.as_view(), name='admin-profiles'),
    path('admin/approvals/', views.AdminSupervisorApprovalListView.as_view(), name='admin-supervisor-approvals'),
    path('admin/approvals/<int:user_id>/', views.AdminSupervisorApprovalActionView.as_view(), name='admin-supervisor-approval-action'),
    path('admin/users/<int:user_id>/', views.AdminUserManagementActionView.as_view(), name='admin-user-management-action'),
]