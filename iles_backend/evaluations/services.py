from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from logbook.models import WeeklyLog
from placements.models import Placement

from .models import FinalInternshipScore, PlacementEvaluation


def _quantize_2(value):
    return Decimal(value).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def _fridays_in_range(start_date, end_date):
    if not start_date or not end_date:
        return []

    cursor = start_date
    while cursor.weekday() != 4:
        cursor += timedelta(days=1)

    fridays = []
    while cursor <= end_date:
        fridays.append(cursor)
        cursor += timedelta(days=7)

    return fridays


def _grade_and_remarks(score):
    if score >= Decimal('80.00'):
        return FinalInternshipScore.GRADE_A, 'Excellent'
    if score >= Decimal('70.00'):
        return FinalInternshipScore.GRADE_B, 'Good'
    if score >= Decimal('60.00'):
        return FinalInternshipScore.GRADE_C, 'Fair'
    if score >= Decimal('50.00'):
        return FinalInternshipScore.GRADE_D, 'Poor'
    return FinalInternshipScore.GRADE_F, 'Very Poor'


def _compute_components(placement):
    lifecycle = placement.current_lifecycle_status
    if lifecycle not in ['active', 'completed']:
        raise ValidationError('Placement must be active or completed before final score computation.')

    evaluation = PlacementEvaluation.objects.filter(
        placement=placement,
        status=PlacementEvaluation.STATUS_FINALIZED,
    ).first()
    if not evaluation:
        raise ValidationError('Academic evaluation must be finalized before final score computation.')

    if evaluation.max_possible_score <= 0:
        raise ValidationError('Academic evaluation has invalid max possible score.')

    academic_score = _quantize_2((evaluation.total_score / evaluation.max_possible_score) * Decimal('100'))

    rated_approved_logs = WeeklyLog.objects.filter(
        placement=placement,
        review_status=WeeklyLog.REVIEW_APPROVED,
        supervisor_rating__isnull=False,
    )
    if not rated_approved_logs.exists():
        raise ValidationError('Supervisor score is missing. At least one approved log with rating is required.')

    avg_rating = sum(
        [Decimal(log.supervisor_rating) for log in rated_approved_logs],
        Decimal('0.00'),
    ) / Decimal(rated_approved_logs.count())
    supervisor_score = _quantize_2((avg_rating / Decimal('5')) * Decimal('100'))

    today = timezone.now().date()
    range_end = min(placement.end_date, today) if placement.end_date else today
    expected_fridays = _fridays_in_range(placement.start_date, range_end)
    expected_weeks = len(expected_fridays)
    if expected_weeks <= 0:
        raise ValidationError('Cannot compute logbook score because expected internship weeks could not be determined.')

    submitted_weeks = set(
        WeeklyLog.objects.filter(placement=placement).values_list('week_ending_date', flat=True)
    )
    missing_expected_weeks = [week for week in expected_fridays if week not in submitted_weeks]
    if missing_expected_weeks:
        raise ValidationError('Logbook is incomplete. Submit all expected weekly logs before computing final score.')

    approved_logs = WeeklyLog.objects.filter(
        placement=placement,
        review_status=WeeklyLog.REVIEW_APPROVED,
    ).count()
    logbook_score = _quantize_2((Decimal(approved_logs) / Decimal(expected_weeks)) * Decimal('100'))

    return {
        'academic_score': academic_score,
        'supervisor_score': supervisor_score,
        'logbook_score': logbook_score,
    }


@transaction.atomic
def compute_final_score_for_placement(placement, computed_by=None, force=False):
    if not isinstance(placement, Placement):
        raise ValidationError('Invalid placement provided for final score computation.')

    existing = FinalInternshipScore.objects.filter(placement=placement).first()
    if existing and not force:
        raise ValidationError('Final score already exists for this placement.')

    components = _compute_components(placement)

    academic_weight = Decimal('0.40')
    supervisor_weight = Decimal('0.30')
    logbook_weight = Decimal('0.30')

    final_score = _quantize_2(
        (components['academic_score'] * academic_weight)
        + (components['supervisor_score'] * supervisor_weight)
        + (components['logbook_score'] * logbook_weight)
    )
    grade, remarks = _grade_and_remarks(final_score)

    payload = {
        'student': placement.student,
        'academic_score': components['academic_score'],
        'supervisor_score': components['supervisor_score'],
        'logbook_score': components['logbook_score'],
        'academic_weight': academic_weight,
        'supervisor_weight': supervisor_weight,
        'logbook_weight': logbook_weight,
        'final_score': final_score,
        'grade': grade,
        'remarks': remarks,
        'computed_by': computed_by,
        'is_locked': True,
    }

    if existing:
        if existing.is_locked:
            raise ValidationError('Final score is locked and cannot be recomputed.')
        for key, value in payload.items():
            setattr(existing, key, value)
        existing.save()
        return existing

    return FinalInternshipScore.objects.create(placement=placement, **payload)
