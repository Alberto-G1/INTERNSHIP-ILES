from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers

from placements.models import Placement

from .models import WeeklyLog


class WeeklyLogSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    placement_summary = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = WeeklyLog
        fields = [
            'id',
            'student',
            'student_name',
            'placement',
            'placement_summary',
            'week_number',
            'week_ending_date',
            'tasks_completed',
            'tasks_in_progress',
            'next_week_tasks',
            'challenges',
            'hours_worked',
            'skills_gained',
            'attachment',
            'attachment_url',
            'supervisor_comments',
            'supervisor_decision',
            'supervisor_rating',
            'reviewed_by',
            'reviewed_by_name',
            'submission_status',
            'review_status',
            'is_late',
            'created_at',
            'updated_at',
            'submitted_at',
            'reviewed_at',
        ]
        read_only_fields = [
            'id',
            'student',
            'week_number',
            'reviewed_by',
            'reviewed_by_name',
            'submission_status',
            'review_status',
            'is_late',
            'created_at',
            'updated_at',
            'submitted_at',
            'reviewed_at',
            'student_name',
            'placement_summary',
            'attachment_url',
        ]

    def get_student_name(self, obj):
        return obj.student.get_full_name()

    def get_reviewed_by_name(self, obj):
        if not obj.reviewed_by:
            return ''
        return obj.reviewed_by.get_full_name()

    def get_attachment_url(self, obj):
        if not obj.attachment:
            return ''
        request = self.context.get('request')
        url = obj.attachment.url
        return request.build_absolute_uri(url) if request else url

    def get_placement_summary(self, obj):
        organization = obj.placement.organization.name if obj.placement.organization else 'Unknown Organization'
        return f"{organization} ({obj.placement.start_date} to {obj.placement.end_date})"


class StudentWeeklyLogCreateSerializer(WeeklyLogSerializer):
    class Meta(WeeklyLogSerializer.Meta):
        read_only_fields = WeeklyLogSerializer.Meta.read_only_fields + [
            'supervisor_comments',
            'supervisor_decision',
            'supervisor_rating',
            'reviewed_by',
        ]

    def validate_placement(self, placement):
        request = self.context['request']
        if placement.student_id != request.user.id:
            raise serializers.ValidationError('You can only create logs against your own placement.')

        if placement.approval_status != Placement.APPROVAL_APPROVED:
            raise serializers.ValidationError('Placement must be approved.')

        if placement.current_lifecycle_status != 'active':
            raise serializers.ValidationError('Placement must be active.')

        return placement

    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        validated_data['submission_status'] = WeeklyLog.SUBMISSION_DRAFT
        validated_data['review_status'] = WeeklyLog.REVIEW_PENDING
        return super().create(validated_data)


class StudentWeeklyLogUpdateSerializer(WeeklyLogSerializer):
    class Meta(WeeklyLogSerializer.Meta):
        read_only_fields = WeeklyLogSerializer.Meta.read_only_fields + [
            'supervisor_comments',
            'supervisor_decision',
            'supervisor_rating',
            'reviewed_by',
        ]


class WeeklyLogSubmitSerializer(serializers.Serializer):
    def validate(self, attrs):
        weekly_log = self.context['weekly_log']

        weekly_log.submission_status = WeeklyLog.SUBMISSION_SUBMITTED
        weekly_log.review_status = WeeklyLog.REVIEW_PENDING
        weekly_log.submitted_at = timezone.now()
        weekly_log.full_clean()
        return attrs

    def save(self, **kwargs):
        weekly_log = self.context['weekly_log']
        weekly_log.submission_status = WeeklyLog.SUBMISSION_SUBMITTED
        weekly_log.review_status = WeeklyLog.REVIEW_PENDING
        weekly_log.submitted_at = timezone.now()
        weekly_log.save(update_fields=['submission_status', 'review_status', 'submitted_at', 'updated_at', 'is_late'])
        return weekly_log


class WeeklyLogReviewSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=['approve', 'needs_revision', 'reject'])
    comments = serializers.CharField(required=False, allow_blank=True)
    rating = serializers.IntegerField(required=False, min_value=1, max_value=5)

    def validate(self, attrs):
        weekly_log = self.context['weekly_log']
        decision = attrs.get('decision')
        comments = (attrs.get('comments') or '').strip()

        if weekly_log.submission_status != WeeklyLog.SUBMISSION_SUBMITTED:
            raise serializers.ValidationError('Only submitted logs can be reviewed.')

        if decision in ['needs_revision', 'reject'] and not comments:
            raise serializers.ValidationError({'comments': 'Comments are required for revision or rejection.'})

        return attrs

    def save(self, **kwargs):
        weekly_log = self.context['weekly_log']
        request_user = self.context['request'].user
        decision = self.validated_data['decision']
        comments = (self.validated_data.get('comments') or '').strip()
        rating = self.validated_data.get('rating')

        weekly_log.supervisor_comments = comments
        weekly_log.supervisor_rating = rating
        weekly_log.reviewed_by = request_user
        weekly_log.reviewed_at = timezone.now()

        if decision == 'approve':
            weekly_log.supervisor_decision = WeeklyLog.REVIEW_APPROVED
            weekly_log.review_status = WeeklyLog.REVIEW_APPROVED
            weekly_log.submission_status = WeeklyLog.SUBMISSION_SUBMITTED
        elif decision == 'needs_revision':
            weekly_log.supervisor_decision = WeeklyLog.REVIEW_NEEDS_REVISION
            weekly_log.review_status = WeeklyLog.REVIEW_NEEDS_REVISION
            weekly_log.submission_status = WeeklyLog.SUBMISSION_DRAFT
        else:
            weekly_log.supervisor_decision = WeeklyLog.REVIEW_REJECTED
            weekly_log.review_status = WeeklyLog.REVIEW_REVIEWED
            weekly_log.submission_status = WeeklyLog.SUBMISSION_SUBMITTED

        weekly_log.save()
        return weekly_log


class StudentLogProgressSerializer(serializers.Serializer):
    placement_id = serializers.IntegerField()
    placement_range = serializers.CharField()
    total_expected_weeks = serializers.IntegerField()
    total_logs_submitted = serializers.IntegerField()
    approved_logs = serializers.IntegerField()
    missing_weeks = serializers.ListField(child=serializers.DateField())


def compute_missing_weeks(placement, submitted_week_end_dates):
    if not placement.start_date or not placement.end_date:
        return []

    first_friday = placement.start_date
    while first_friday.weekday() != 4:
        first_friday += timedelta(days=1)

    today = timezone.now().date()
    last_date = min(placement.end_date, today)

    expected = []
    current = first_friday
    while current <= last_date:
        expected.append(current)
        current += timedelta(days=7)

    return [d for d in expected if d not in submitted_week_end_dates]
