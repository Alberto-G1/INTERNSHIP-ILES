# backend/accounts/urls.py

from django.urls import path
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
    
    # Profile endpoints
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
]