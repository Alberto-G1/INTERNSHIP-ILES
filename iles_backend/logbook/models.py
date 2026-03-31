from datetime import timedelta

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from placements.models import Placement


def validate_log_attachment(value):
    if not value:
        return

    max_size = 10 * 1024 * 1024
    if value.size > max_size:
        raise ValidationError('Attachment cannot exceed 10MB.')


class WeeklyLog(models.Model):
    SUBMISSION_DRAFT = 'draft'
    SUBMISSION_SUBMITTED = 'submitted'
    SUBMISSION_STATUS_CHOICES = (
        (SUBMISSION_DRAFT, 'Draft'),
        (SUBMISSION_SUBMITTED, 'Submitted'),
    )

    REVIEW_PENDING = 'pending'
    REVIEW_UNDER_REVIEW = 'under_review'
    REVIEW_REVIEWED = 'reviewed'
    REVIEW_APPROVED = 'approved'
    REVIEW_NEEDS_REVISION = 'needs_revision'
    REVIEW_REJECTED = 'rejected'
    REVIEW_STATUS_CHOICES = (
        (REVIEW_PENDING, 'Pending'),
        (REVIEW_UNDER_REVIEW, 'Under Review'),
        (REVIEW_REVIEWED, 'Reviewed'),
        (REVIEW_APPROVED, 'Approved'),
        (REVIEW_NEEDS_REVISION, 'Needs Revision'),
        (REVIEW_REJECTED, 'Rejected'),
    )

    ACTION_SUBMITTED = 'submitted'
    ACTION_REVIEW_STARTED = 'review_started'
    ACTION_APPROVED = 'approved'
    ACTION_NEEDS_REVISION = 'needs_revision'
    ACTION_REJECTED = 'rejected'
    ACTION_RESUBMITTED = 'resubmitted'

    WORKFLOW_DRAFT = 'draft'
    WORKFLOW_SUBMITTED = 'submitted'
    WORKFLOW_UNDER_REVIEW = 'under_review'
    WORKFLOW_APPROVED = 'approved'
    WORKFLOW_NEEDS_REVISION = 'needs_revision'
    WORKFLOW_REJECTED = 'rejected'

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='weekly_logs',
    )
    placement = models.ForeignKey(
        Placement,
        on_delete=models.CASCADE,
        related_name='weekly_logs',
    )

    week_number = models.PositiveIntegerField(default=1)
    week_ending_date = models.DateField()

    tasks_completed = models.TextField()
    tasks_in_progress = models.TextField()
    next_week_tasks = models.TextField()
    challenges = models.TextField()

    hours_worked = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    skills_gained = models.TextField(blank=True)
    attachment = models.FileField(
        upload_to='logbook/attachments/',
        null=True,
        blank=True,
        validators=[validate_log_attachment],
    )

    supervisor_comments = models.TextField(blank=True)
    supervisor_decision = models.CharField(
        max_length=20,
        choices=(
            (REVIEW_APPROVED, 'Approved'),
            (REVIEW_NEEDS_REVISION, 'Needs Revision'),
            (REVIEW_REJECTED, 'Rejected'),
        ),
        blank=True,
    )
    supervisor_rating = models.PositiveIntegerField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_weekly_logs',
    )

    submission_status = models.CharField(
        max_length=20,
        choices=SUBMISSION_STATUS_CHOICES,
        default=SUBMISSION_DRAFT,
    )
    review_status = models.CharField(
        max_length=20,
        choices=REVIEW_STATUS_CHOICES,
        default=REVIEW_PENDING,
    )
    review_round = models.PositiveIntegerField(default=0)
    is_late = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'weekly_logs'
        ordering = ['-week_ending_date', '-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'week_ending_date'],
                name='unique_weekly_log_student_week',
            )
        ]
        indexes = [
            models.Index(fields=['student', 'week_ending_date']),
            models.Index(fields=['placement', 'week_ending_date']),
            models.Index(fields=['submission_status', 'review_status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.student.username} - Week ending {self.week_ending_date}"

    @property
    def attachment_url(self):
        if self.attachment:
            return self.attachment.url
        return ''

    @property
    def workflow_state(self):
        if self.submission_status == self.SUBMISSION_DRAFT and self.review_status == self.REVIEW_PENDING:
            return self.WORKFLOW_DRAFT
        if self.submission_status == self.SUBMISSION_SUBMITTED and self.review_status == self.REVIEW_PENDING:
            return self.WORKFLOW_SUBMITTED
        if self.submission_status == self.SUBMISSION_SUBMITTED and self.review_status == self.REVIEW_UNDER_REVIEW:
            return self.WORKFLOW_UNDER_REVIEW
        if self.submission_status == self.SUBMISSION_SUBMITTED and self.review_status == self.REVIEW_APPROVED:
            return self.WORKFLOW_APPROVED
        if self.submission_status == self.SUBMISSION_DRAFT and self.review_status == self.REVIEW_NEEDS_REVISION:
            return self.WORKFLOW_NEEDS_REVISION
        if self.submission_status == self.SUBMISSION_DRAFT and self.review_status == self.REVIEW_REJECTED:
            return self.WORKFLOW_REJECTED

        return self.WORKFLOW_SUBMITTED

    def _allowed_transitions(self):
        return {
            self.WORKFLOW_DRAFT: {self.WORKFLOW_SUBMITTED},
            self.WORKFLOW_SUBMITTED: {self.WORKFLOW_UNDER_REVIEW},
            self.WORKFLOW_UNDER_REVIEW: {
                self.WORKFLOW_APPROVED,
                self.WORKFLOW_NEEDS_REVISION,
                self.WORKFLOW_REJECTED,
            },
            self.WORKFLOW_NEEDS_REVISION: {self.WORKFLOW_SUBMITTED},
            self.WORKFLOW_REJECTED: {self.WORKFLOW_SUBMITTED},
            self.WORKFLOW_APPROVED: set(),
        }

    def can_transition_to(self, target_state):
        return target_state in self._allowed_transitions().get(self.workflow_state, set())

    def _apply_state(self, target_state):
        if target_state == self.WORKFLOW_SUBMITTED:
            self.submission_status = self.SUBMISSION_SUBMITTED
            self.review_status = self.REVIEW_PENDING
        elif target_state == self.WORKFLOW_UNDER_REVIEW:
            self.submission_status = self.SUBMISSION_SUBMITTED
            self.review_status = self.REVIEW_UNDER_REVIEW
        elif target_state == self.WORKFLOW_APPROVED:
            self.submission_status = self.SUBMISSION_SUBMITTED
            self.review_status = self.REVIEW_APPROVED
        elif target_state == self.WORKFLOW_NEEDS_REVISION:
            self.submission_status = self.SUBMISSION_DRAFT
            self.review_status = self.REVIEW_NEEDS_REVISION
        elif target_state == self.WORKFLOW_REJECTED:
            self.submission_status = self.SUBMISSION_DRAFT
            self.review_status = self.REVIEW_REJECTED
        elif target_state == self.WORKFLOW_DRAFT:
            self.submission_status = self.SUBMISSION_DRAFT
            self.review_status = self.REVIEW_PENDING

    def transition_to(self, target_state, actor=None, action_type='', notes=''):
        previous_state = self.workflow_state
        if not self.can_transition_to(target_state):
            raise ValidationError(
                {
                    'state': f'Invalid transition: {previous_state} -> {target_state}'
                }
            )

        self._apply_state(target_state)

        now = timezone.now()
        if target_state == self.WORKFLOW_SUBMITTED:
            self.submitted_at = now
        if target_state in [self.WORKFLOW_APPROVED, self.WORKFLOW_NEEDS_REVISION, self.WORKFLOW_REJECTED]:
            self.reviewed_at = now

        self.save()

        WeeklyLogAuditTrail.objects.create(
            weekly_log=self,
            actor=actor,
            action_type=action_type,
            previous_state=previous_state,
            new_state=target_state,
            notes=notes or '',
        )

    def _validate_friday(self):
        if self.week_ending_date.weekday() != 4:
            raise ValidationError({'week_ending_date': 'Week ending date must be a Friday.'})

    def _validate_not_future(self):
        today = timezone.now().date()
        if self.week_ending_date > today:
            raise ValidationError({'week_ending_date': 'Week ending date cannot be in the future.'})

    def _validate_placement_range(self):
        if not self.placement.start_date or not self.placement.end_date:
            raise ValidationError({'placement': 'Placement dates are incomplete.'})

        if not (self.placement.start_date <= self.week_ending_date <= self.placement.end_date):
            raise ValidationError(
                {'week_ending_date': 'Week ending date must fall within the placement duration.'}
            )

    def _validate_placement_active(self):
        if self.placement.student_id != self.student_id:
            raise ValidationError({'placement': 'Selected placement does not belong to this student.'})

        if self.placement.approval_status != Placement.APPROVAL_APPROVED:
            raise ValidationError({'placement': 'Placement must be approved to log weekly activity.'})

        lifecycle = self.placement.current_lifecycle_status
        if lifecycle != 'active':
            raise ValidationError({'placement': 'Placement is not active for weekly logging.'})

    def _validate_required_content(self):
        required_fields = {
            'tasks_completed': self.tasks_completed,
            'tasks_in_progress': self.tasks_in_progress,
            'next_week_tasks': self.next_week_tasks,
            'challenges': self.challenges,
        }

        for field_name, field_value in required_fields.items():
            if not field_value or not field_value.strip():
                raise ValidationError({field_name: 'This field is required.'})

    def _validate_submission_rules(self):
        if self.submission_status != self.SUBMISSION_SUBMITTED:
            return
        self._validate_required_content()

    def _validate_rating(self):
        if self.supervisor_rating is None:
            return

        if self.supervisor_rating < 1 or self.supervisor_rating > 5:
            raise ValidationError({'supervisor_rating': 'Supervisor rating must be between 1 and 5.'})

    def _set_week_number(self):
        if not self.placement.start_date:
            self.week_number = 1
            return

        days_since_start = (self.week_ending_date - self.placement.start_date).days
        if days_since_start < 0:
            self.week_number = 1
            return

        self.week_number = (days_since_start // 7) + 1

    def _compute_late_flag(self):
        due_date = self.week_ending_date + timedelta(days=2)
        if self.submission_status == self.SUBMISSION_SUBMITTED and self.submitted_at:
            self.is_late = self.submitted_at.date() > due_date
            return

        today = timezone.now().date()
        self.is_late = today > due_date and self.submission_status == self.SUBMISSION_DRAFT

    def clean(self):
        if self.student and self.student.role != 'student':
            raise ValidationError({'student': 'Weekly log owner must be a student.'})

        self._validate_friday()
        self._validate_not_future()
        self._validate_placement_active()
        self._validate_placement_range()
        self._validate_submission_rules()
        self._validate_rating()

        state = self.workflow_state
        valid_states = {
            self.WORKFLOW_DRAFT,
            self.WORKFLOW_SUBMITTED,
            self.WORKFLOW_UNDER_REVIEW,
            self.WORKFLOW_APPROVED,
            self.WORKFLOW_NEEDS_REVISION,
            self.WORKFLOW_REJECTED,
        }
        if state not in valid_states:
            raise ValidationError({'state': 'Log is in an invalid workflow state.'})

        if state == self.WORKFLOW_APPROVED and self.submission_status != self.SUBMISSION_SUBMITTED:
            raise ValidationError({'submission_status': 'Approved logs cannot be edited back to draft.'})

    def save(self, *args, **kwargs):
        self._set_week_number()
        self._compute_late_flag()
        self.full_clean()
        super().save(*args, **kwargs)


class SupervisorReview(models.Model):
    DECISION_APPROVED = 'approved'
    DECISION_NEEDS_REVISION = 'needs_revision'
    DECISION_REJECTED = 'rejected'
    DECISION_CHOICES = (
        (DECISION_APPROVED, 'Approved'),
        (DECISION_NEEDS_REVISION, 'Needs Revision'),
        (DECISION_REJECTED, 'Rejected'),
    )

    weekly_log = models.ForeignKey(
        WeeklyLog,
        on_delete=models.CASCADE,
        related_name='reviews',
    )
    supervisor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='supervisor_reviews',
    )
    comments = models.TextField()
    decision = models.CharField(max_length=20, choices=DECISION_CHOICES)
    rating = models.PositiveIntegerField(null=True, blank=True)
    review_round = models.PositiveIntegerField()
    reviewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'weekly_log_reviews'
        ordering = ['-reviewed_at']
        indexes = [
            models.Index(fields=['weekly_log', 'review_round']),
            models.Index(fields=['supervisor', 'reviewed_at']),
        ]

    def __str__(self):
        return f"Review #{self.review_round} for log {self.weekly_log_id}"

    def clean(self):
        if self.supervisor.role not in ['workplace_supervisor', 'academic_supervisor']:
            raise ValidationError({'supervisor': 'Only supervisors can review logs.'})

        if not self.comments or not self.comments.strip():
            raise ValidationError({'comments': 'Review comments are required.'})

        if self.rating is not None and (self.rating < 1 or self.rating > 5):
            raise ValidationError({'rating': 'Rating must be between 1 and 5.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class WeeklyLogAuditTrail(models.Model):
    ACTION_SUBMITTED = 'submitted'
    ACTION_REVIEW_STARTED = 'review_started'
    ACTION_APPROVED = 'approved'
    ACTION_NEEDS_REVISION = 'needs_revision'
    ACTION_REJECTED = 'rejected'
    ACTION_RESUBMITTED = 'resubmitted'

    ACTION_TYPE_CHOICES = (
        (ACTION_SUBMITTED, 'Submitted'),
        (ACTION_REVIEW_STARTED, 'Review Started'),
        (ACTION_APPROVED, 'Approved'),
        (ACTION_NEEDS_REVISION, 'Needs Revision'),
        (ACTION_REJECTED, 'Rejected'),
        (ACTION_RESUBMITTED, 'Resubmitted'),
    )

    weekly_log = models.ForeignKey(
        WeeklyLog,
        on_delete=models.CASCADE,
        related_name='audit_trail',
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='weekly_log_actions',
    )
    action_type = models.CharField(max_length=30, choices=ACTION_TYPE_CHOICES)
    previous_state = models.CharField(max_length=30)
    new_state = models.CharField(max_length=30)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'weekly_log_audit_trail'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['weekly_log', 'created_at']),
            models.Index(fields=['actor', 'created_at']),
            models.Index(fields=['action_type']),
        ]

    def __str__(self):
        return f"{self.action_type} on log {self.weekly_log_id}"
