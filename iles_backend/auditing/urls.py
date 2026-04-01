from django.urls import path

from . import views

urlpatterns = [
    path('admin/logs/', views.AdminAuditLogListView.as_view(), name='admin-audit-logs'),
    
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:notification_id>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('notifications/bulk-mark-read/', views.NotificationBulkMarkReadView.as_view(), name='notification-bulk-mark-read'),
    path('notifications/stats/', views.NotificationStatsView.as_view(), name='notification-stats'),
]
