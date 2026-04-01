from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from logbook.models import WeeklyLog
from placements.models import Placement


class EvaluationCriterion(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    max_score = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('10.00'))
    weight = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('1.00'))
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'evaluation_criteria'
        ordering = ['display_order', 'name']
        indexes = [
            models.Index(fields=['is_active', 'display_order']),
        ]

    def __str__(self):
        return self.name

    def clean(self):
        if self.max_score <= 0:
            raise ValidationError({'max_score': 'Max score must be greater than 0.'})
        if self.weight <= 0:
            raise ValidationError({'weight': 'Weight must be greater than 0.'})


class PlacementEvaluation(models.Model):
    STATUS_DRAFT = 'draft'
    STATUS_SUBMITTED = 'submitted'
    STATUS_FINALIZED = 'finalized'
    STATUS_CHOICES = (
        (STATUS_DRAFT, 'Draft'),
        (STATUS_SUBMITTED, 'Submitted'),
        (STATUS_FINALIZED, 'Finalized'),
    )

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='evaluations',
    )
    placement = models.OneToOneField(
        Placement,
        on_delete=models.CASCADE,
        related_name='evaluation',
    )
    evaluated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='submitted_evaluations',
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    evaluation_date = models.DateField(default=timezone.now)
    total_score = models.DecimalField(max_digits=7, decimal_places=2, default=Decimal('0.00'))
    grade = models.CharField(max_length=2, blank=True)
    general_feedback = models.TextField(blank=True)

    submitted_at = models.DateTimeField(null=True, blank=True)
    finalized_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'placement_evaluations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['student', 'status']),
            models.Index(fields=['evaluated_by', 'status']),
        ]

    def __str__(self):
        return f"Evaluation for placement #{self.placement_id}"

    @property
    def max_possible_score(self):
        active_criteria = EvaluationCriterion.objects.filter(is_active=True)
        return sum((c.max_score for c in active_criteria), Decimal('0.00'))

    def calculate_total_score(self):
        return sum((score.score for score in self.criteria_scores.select_related('criterion').all()), Decimal('0.00'))

    def calculate_grade(self, total_score):
        max_score = self.max_possible_score
        if max_score <= 0:
            return ''

        percentage = (total_score / max_score) * Decimal('100')
        if percentage >= 80:
            return 'A'
        if percentage >= 70:
            return 'B'
        if percentage >= 60:
            return 'C'
        if percentage >= 50:
            return 'D'
        return 'F'

    def validate_dependencies(self):
        lifecycle = self.placement.current_lifecycle_status
        if lifecycle not in ['active', 'completed']:
            raise ValidationError({'placement': 'Evaluation is allowed only for active or completed placements.'})

        if self.placement.student_id != self.student_id:
            raise ValidationError({'student': 'Evaluation student must match placement student.'})

        if self.evaluated_by.role != 'academic_supervisor':
            raise ValidationError({'evaluated_by': 'Only academic supervisors can evaluate students.'})

        if self.placement.academic_supervisor_id != self.evaluated_by_id:
            raise ValidationError({'evaluated_by': 'You can only evaluate placements assigned to you.'})

    def validate_logs_dependency(self):
        logs_exist = WeeklyLog.objects.filter(placement=self.placement).exists()
        if not logs_exist:
            raise ValidationError({'placement': 'At least one weekly log must exist before evaluation.'})

        reviewed_count = WeeklyLog.objects.filter(
            placement=self.placement,
            review_status__in=[WeeklyLog.REVIEW_APPROVED, WeeklyLog.REVIEW_REVIEWED],
        ).count()
        if reviewed_count == 0:
            raise ValidationError({'placement': 'At least one reviewed or approved weekly log is required.'})

    def validate_completeness(self):
        active_criteria_ids = set(EvaluationCriterion.objects.filter(is_active=True).values_list('id', flat=True))
        scored_criteria_ids = set(self.criteria_scores.values_list('criterion_id', flat=True))

        missing = active_criteria_ids - scored_criteria_ids
        if missing:
            raise ValidationError({'criteria': 'All active criteria must be scored before submission.'})

        if not self.general_feedback or not self.general_feedback.strip():
            raise ValidationError({'general_feedback': 'General feedback is required before submission.'})

    def clean(self):
        self.validate_dependencies()

        if self.status in [self.STATUS_SUBMITTED, self.STATUS_FINALIZED]:
            self.validate_logs_dependency()
            self.validate_completeness()

        if self.status == self.STATUS_FINALIZED and not self.submitted_at:
            raise ValidationError({'status': 'Evaluation must be submitted before finalization.'})

    def save(self, *args, **kwargs):
        if self.pk:
            previous = PlacementEvaluation.objects.filter(pk=self.pk).values('status').first()
            if previous and previous['status'] == self.STATUS_FINALIZED and self.status != self.STATUS_FINALIZED:
                raise ValidationError('Finalized evaluations cannot be reverted.')

        self.total_score = self.calculate_total_score()
        self.grade = self.calculate_grade(self.total_score)
        self.full_clean()
        super().save(*args, **kwargs)


class EvaluationScore(models.Model):
    evaluation = models.ForeignKey(
        PlacementEvaluation,
        on_delete=models.CASCADE,
        related_name='criteria_scores',
    )
    criterion = models.ForeignKey(
        EvaluationCriterion,
        on_delete=models.PROTECT,
        related_name='scores',
    )
    score = models.DecimalField(max_digits=6, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'evaluation_scores'
        ordering = ['criterion__display_order', 'criterion__name']
        constraints = [
            models.UniqueConstraint(fields=['evaluation', 'criterion'], name='unique_score_per_criterion'),
        ]

    def __str__(self):
        return f"{self.evaluation_id} - {self.criterion.name}: {self.score}"

    def clean(self):
        if self.score < 0:
            raise ValidationError({'score': 'Score cannot be negative.'})

        if self.score > self.criterion.max_score:
            raise ValidationError({'score': f'Score cannot exceed max score ({self.criterion.max_score}).'})

        if self.evaluation.status == PlacementEvaluation.STATUS_FINALIZED:
            raise ValidationError({'evaluation': 'Cannot modify scores for finalized evaluations.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

        # Keep aggregate values in sync.
        evaluation = self.evaluation
        evaluation.total_score = evaluation.calculate_total_score()
        evaluation.grade = evaluation.calculate_grade(evaluation.total_score)
        evaluation.save(update_fields=['total_score', 'grade', 'updated_at'])
