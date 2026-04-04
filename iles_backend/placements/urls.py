from django.urls import path

from . import views


urlpatterns = [
    path('organizations/', views.OrganizationListCreateView.as_view(), name='organizations'),

    # Student actions
    path('student/', views.StudentPlacementListCreateView.as_view(), name='student-placements'),
    path('student/<int:placement_id>/', views.StudentPlacementDetailView.as_view(), name='student-placement-detail'),
    path('student/<int:placement_id>/submit/', views.StudentPlacementSubmitView.as_view(), name='student-placement-submit'),
    path('student/<int:placement_id>/workplace-supervisor/', views.StudentWorkplaceSupervisorAssignView.as_view(), name='student-placement-workplace-supervisor'),

    # Admin actions
    path('admin/', views.AdminPlacementListView.as_view(), name='admin-placements'),
    path('admin/<int:placement_id>/decision/', views.AdminPlacementDecisionView.as_view(), name='admin-placement-decision'),
    path('admin/<int:placement_id>/supervisors/', views.AdminPlacementSupervisorAssignView.as_view(), name='admin-placement-supervisors'),
    path('admin/lifecycle/refresh/', views.PlacementLifecycleRefreshView.as_view(), name='admin-placement-lifecycle-refresh'),

    # Supervisor actions
    path('supervisor/assigned/', views.SupervisorAssignedPlacementsView.as_view(), name='supervisor-assigned-placements'),
]
