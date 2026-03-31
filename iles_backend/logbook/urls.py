from django.urls import path

from . import views


urlpatterns = [
    # Student endpoints
    path('student/', views.StudentWeeklyLogListCreateView.as_view(), name='student-log-list-create'),
    path('student/<int:log_id>/', views.StudentWeeklyLogDetailView.as_view(), name='student-log-detail'),
    path('student/<int:log_id>/submit/', views.StudentWeeklyLogSubmitView.as_view(), name='student-log-submit'),
    path('student/<int:log_id>/resubmit/', views.StudentWeeklyLogResubmitView.as_view(), name='student-log-resubmit'),
    path('student/progress/', views.StudentLogProgressView.as_view(), name='student-log-progress'),

    # Supervisor endpoints
    path('supervisor/', views.SupervisorAssignedLogListView.as_view(), name='supervisor-log-list'),
    path('supervisor/<int:log_id>/start-review/', views.SupervisorWeeklyLogStartReviewView.as_view(), name='supervisor-log-start-review'),
    path('supervisor/<int:log_id>/review/', views.SupervisorWeeklyLogReviewView.as_view(), name='supervisor-log-review'),

    # Audit trail
    path('audit/<int:log_id>/', views.WeeklyLogAuditTrailView.as_view(), name='log-audit-trail'),

    # Admin endpoints
    path('admin/overview/', views.AdminLogbookOverviewView.as_view(), name='admin-logbook-overview'),
]
