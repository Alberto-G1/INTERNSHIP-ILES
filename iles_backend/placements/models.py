from datetime import timedelta

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


def validate_pdf_file(value):
    if not value:
        return

    file_name = value.name.lower()
    if not file_name.endswith('.pdf'):
        raise ValidationError('Placement letter must be a PDF file.')

    max_size = 5 * 1024 * 1024
    if value.size > max_size:
        raise ValidationError('Placement letter cannot exceed 5MB.')


class Organization(models.Model):
    name = models.CharField(max_length=255)
    industry = models.CharField(max_length=120, blank=True)

    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=30, blank=True)

    region = models.CharField(max_length=120)
    district = models.CharField(max_length=120)
    county = models.CharField(max_length=120, blank=True)
    sub_county = models.CharField(max_length=120, blank=True)
    parish = models.CharField(max_length=120, blank=True)
    village = models.CharField(max_length=120, blank=True)
    full_address = models.TextField()

    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'organizations'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['region', 'district']),
            models.Index(fields=['is_verified']),
        ]

    def __str__(self):
        return self.name


class Placement(models.Model):
    SUBMISSION_DRAFT = 'draft'
    SUBMISSION_SUBMITTED = 'submitted'
    SUBMISSION_STATUS_CHOICES = (
        (SUBMISSION_DRAFT, 'Draft'),
        (SUBMISSION_SUBMITTED, 'Submitted'),
    )

    APPROVAL_PENDING = 'pending'
    APPROVAL_APPROVED = 'approved'
    APPROVAL_REJECTED = 'rejected'
    APPROVAL_CANCELLED = 'cancelled'
    APPROVAL_STATUS_CHOICES = (
        (APPROVAL_PENDING, 'Pending'),
        (APPROVAL_APPROVED, 'Approved'),
        (APPROVAL_REJECTED, 'Rejected'),
        (APPROVAL_CANCELLED, 'Cancelled'),
    )

    WORK_MODE_ONSITE = 'on-site'
    WORK_MODE_REMOTE = 'remote'
    WORK_MODE_HYBRID = 'hybrid'
    WORK_MODE_CHOICES = (
        (WORK_MODE_ONSITE, 'On-site'),
        (WORK_MODE_REMOTE, 'Remote'),
        (WORK_MODE_HYBRID, 'Hybrid'),
    )

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='placements',
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        related_name='placements',
        null=True,
        blank=True,
    )

    placement_letter = models.FileField(
        upload_to='placements/letters/',
        validators=[validate_pdf_file],
        null=True,
        blank=True,
    )

    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    position_role = models.CharField(max_length=140, blank=True)
    allowance = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    work_mode = models.CharField(max_length=20, choices=WORK_MODE_CHOICES, default=WORK_MODE_ONSITE)

    workplace_supervisor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='workplace_supervised_placements',
    )
    academic_supervisor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='academic_supervised_placements',
    )

    submission_status = models.CharField(
        max_length=20,
        choices=SUBMISSION_STATUS_CHOICES,
        default=SUBMISSION_DRAFT,
    )
    approval_status = models.CharField(
        max_length=20,
        choices=APPROVAL_STATUS_CHOICES,
        default=APPROVAL_PENDING,
    )

    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_student_placements',
    )
    rejection_reason = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'placements'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', 'submission_status']),
            models.Index(fields=['student', 'approval_status']),
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        org_name = self.organization.name if self.organization else 'Unknown Organization'
        return f"{self.student.username} @ {org_name}"

    @property
    def duration_days(self):
        if not self.start_date or not self.end_date:
            return None
        return (self.end_date - self.start_date).days

    @property
    def duration_weeks(self):
        if self.duration_days is None:
            return None
        return round(self.duration_days / 7, 2)

    @property
    def current_lifecycle_status(self):
        if self.submission_status == self.SUBMISSION_DRAFT:
            return 'draft'

        if self.approval_status == self.APPROVAL_REJECTED:
            return 'rejected'

        if self.approval_status == self.APPROVAL_CANCELLED:
            return 'cancelled'

        if self.approval_status == self.APPROVAL_PENDING:
            return 'pending'

        if self.approval_status == self.APPROVAL_APPROVED:
            today = timezone.now().date()
            if self.start_date and self.end_date:
                if today < self.start_date:
                    return 'approved'
                if self.start_date <= today <= self.end_date:
                    return 'active'
                if today > self.end_date:
                    return 'completed'
            return 'approved'

        return 'pending'

    def _validate_overlap(self):
        if not self.start_date or not self.end_date:
            return

        overlapping = Placement.objects.filter(
            student=self.student,
            approval_status=self.APPROVAL_APPROVED,
            start_date__lte=self.end_date,
            end_date__gte=self.start_date,
        )

        if self.pk:
            overlapping = overlapping.exclude(pk=self.pk)

        if overlapping.exists():
            raise ValidationError(
                'This placement overlaps with another approved placement for the same student.'
            )

    def _validate_supervisors(self):
        if self.workplace_supervisor and self.workplace_supervisor.role != 'workplace_supervisor':
            raise ValidationError({'workplace_supervisor': 'Selected user is not a workplace supervisor.'})

        if self.academic_supervisor and self.academic_supervisor.role != 'academic_supervisor':
            raise ValidationError({'academic_supervisor': 'Selected user is not an academic supervisor.'})

        if (
            self.approval_status != self.APPROVAL_APPROVED
            and (self.workplace_supervisor_id or self.academic_supervisor_id)
        ):
            raise ValidationError(
                'Supervisors can only be assigned after placement approval.'
            )

    def _validate_submission_requirements(self):
        if self.submission_status != self.SUBMISSION_SUBMITTED:
            return

        missing = []
        required_map = {
            'organization': self.organization,
            'placement_letter': self.placement_letter,
            'start_date': self.start_date,
            'end_date': self.end_date,
        }
        for field_name, field_value in required_map.items():
            if not field_value:
                missing.append(field_name)

        if missing:
            raise ValidationError(
                {field: 'This field is required before submission.' for field in missing}
            )

        if self.start_date >= self.end_date:
            raise ValidationError({'end_date': 'End date must be after the start date.'})

        if self.start_date < timezone.now().date():
            raise ValidationError({'start_date': 'Start date cannot be in the past at submission time.'})

        min_duration = timedelta(weeks=8)
        if (self.end_date - self.start_date) < min_duration:
            raise ValidationError('Internship duration must be at least 8 weeks.')

        student_profile = getattr(self.student, 'student_profile', None)
        if not student_profile or not student_profile.profile_completed:
            raise ValidationError(
                'Student profile must be complete before submitting placement.'
            )

    def clean(self):
        if self.student and self.student.role != 'student':
            raise ValidationError({'student': 'Placement owner must be a student account.'})

        if self.start_date and self.end_date and self.start_date >= self.end_date:
            raise ValidationError({'end_date': 'End date must be after the start date.'})

        self._validate_submission_requirements()
        self._validate_supervisors()

        if self.approval_status == self.APPROVAL_APPROVED:
            self._validate_overlap()

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
