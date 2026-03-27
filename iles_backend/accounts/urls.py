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
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile endpoints
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/completion/', views.ProfileCompletionView.as_view(), name='profile-completion'),
    
    # Admin endpoints
    path('admin/profiles/', views.AdminProfileListView.as_view(), name='admin-profiles'),
]