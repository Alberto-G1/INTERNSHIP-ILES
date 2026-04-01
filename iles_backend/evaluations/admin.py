from django.contrib import admin

from .models import EvaluationCriterion, EvaluationScore, FinalInternshipScore, PlacementEvaluation


@admin.register(EvaluationCriterion)
class EvaluationCriterionAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'max_score', 'weight', 'display_order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'description']


class EvaluationScoreInline(admin.TabularInline):
    model = EvaluationScore
    extra = 0


@admin.register(PlacementEvaluation)
class PlacementEvaluationAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'student',
        'placement',
        'evaluated_by',
        'status',
        'total_score',
        'grade',
        'evaluation_date',
    ]
    list_filter = ['status', 'grade', 'evaluation_date']
    search_fields = ['student__username', 'student__first_name', 'student__last_name']
    readonly_fields = ['total_score', 'grade', 'submitted_at', 'finalized_at', 'created_at', 'updated_at']
    inlines = [EvaluationScoreInline]


@admin.register(EvaluationScore)
class EvaluationScoreAdmin(admin.ModelAdmin):
    list_display = ['id', 'evaluation', 'criterion', 'score', 'updated_at']
    list_filter = ['criterion']
    search_fields = ['evaluation__student__username', 'criterion__name']


@admin.register(FinalInternshipScore)
class FinalInternshipScoreAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'student',
        'placement',
        'academic_score',
        'supervisor_score',
        'logbook_score',
        'final_score',
        'grade',
        'remarks',
        'computed_at',
        'is_locked',
    ]
    list_filter = ['grade', 'is_locked', 'computed_at']
    search_fields = ['student__username', 'student__first_name', 'student__last_name']
    readonly_fields = ['computed_at', 'created_at', 'updated_at']
