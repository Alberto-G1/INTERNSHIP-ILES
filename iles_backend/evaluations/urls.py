from django.urls import path

from . import views


urlpatterns = [
    path('criteria/', views.EvaluationCriteriaListCreateView.as_view(), name='evaluation-criteria-list-create'),
    path('criteria/<int:criterion_id>/', views.EvaluationCriteriaDetailView.as_view(), name='evaluation-criteria-detail'),

    path('supervisor/', views.SupervisorEvaluationListCreateView.as_view(), name='supervisor-evaluation-list-create'),
    path('supervisor/<int:evaluation_id>/', views.SupervisorEvaluationDetailView.as_view(), name='supervisor-evaluation-detail'),
    path('supervisor/<int:evaluation_id>/submit/', views.SupervisorEvaluationSubmitView.as_view(), name='supervisor-evaluation-submit'),
    path('supervisor/<int:evaluation_id>/finalize/', views.SupervisorEvaluationFinalizeView.as_view(), name='supervisor-evaluation-finalize'),

    path('student/', views.StudentEvaluationListView.as_view(), name='student-evaluation-list'),
    path('student/<int:evaluation_id>/', views.StudentEvaluationDetailView.as_view(), name='student-evaluation-detail'),

    path('final-scores/admin/compute/', views.AdminFinalScoreComputeView.as_view(), name='admin-final-score-compute'),
    path('final-scores/admin/', views.AdminFinalScoreListView.as_view(), name='admin-final-score-list'),
    path('final-scores/student/', views.StudentFinalScoreListView.as_view(), name='student-final-score-list'),
]
