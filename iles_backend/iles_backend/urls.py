"""
URL configuration for iles_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

"""
Main URL Configuration.

Routes requests to appropriate apps.
Each app has its own urls.py file for better organization.
"""

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/auth/', include('accounts.urls')),  # All auth endpoints under /api/auth/
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Add this
    path('api/placements/', include('placements.urls')),
    path('api/logbook/', include('logbook.urls')),
    path('api/evaluations/', include('evaluations.urls')),

    # Future apps will be added here:
    # path('api/logs/', include('logs.urls')),
    # path('api/evaluations/', include('evaluations.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)