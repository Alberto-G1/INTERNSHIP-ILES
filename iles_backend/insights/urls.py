from django.urls import path

from . import views


urlpatterns = [
    path('dashboard/', views.InsightDashboardView.as_view(), name='insight-dashboard'),
    path('reports/admin/', views.AdminReportSummaryView.as_view(), name='admin-report-summary'),
    path('reports/admin/export/', views.AdminReportExportView.as_view(), name='admin-report-export'),
]