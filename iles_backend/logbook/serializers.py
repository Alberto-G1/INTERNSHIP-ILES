from datetime import timedelta

from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers

from placements.models import Placement

from .models import SupervisorReview, WeeklyLog, WeeklyLogAuditTrail


class WeeklyLogSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    placement_summary = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()
    workflow_state = serializers.ReadOnlyField()
    can_student_edit = serializers.SerializerMethodField()
    can_student_submit = serializers.SerializerMethodField()

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
            'workflow_state',
            'review_round',
            'is_late',
            'can_student_edit',
            'can_student_submit',
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
            'workflow_state',
            'can_student_edit',
            'can_student_submit',
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

    def get_can_student_edit(self, obj):
        return obj.workflow_state in [WeeklyLog.WORKFLOW_DRAFT, WeeklyLog.WORKFLOW_NEEDS_REVISION, WeeklyLog.WORKFLOW_REJECTED]

    def get_can_student_submit(self, obj):
        return obj.workflow_state in [WeeklyLog.WORKFLOW_DRAFT, WeeklyLog.WORKFLOW_NEEDS_REVISION, WeeklyLog.WORKFLOW_REJECTED]


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

        return placement

    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        validated_data['submission_status'] = WeeklyLog.SUBMISSION_DRAFT
        validated_data['review_status'] = WeeklyLog.REVIEW_PENDING
        try:
            return super().create(validated_data)
        except DjangoValidationError as exc:
            if hasattr(exc, 'message_dict'):
                raise serializers.ValidationError(exc.message_dict)
            raise serializers.ValidationError(exc.messages)


class StudentWeeklyLogUpdateSerializer(WeeklyLogSerializer):
    class Meta(WeeklyLogSerializer.Meta):
        read_only_fields = WeeklyLogSerializer.Meta.read_only_fields + [
            'supervisor_comments',
            'supervisor_decision',
            'supervisor_rating',
            'reviewed_by',
        ]

    def update(self, instance, validated_data):
        try:
            return super().update(instance, validated_data)
        except DjangoValidationError as exc:
            if hasattr(exc, 'message_dict'):
                raise serializers.ValidationError(exc.message_dict)
            raise serializers.ValidationError(exc.messages)


class WeeklyLogSubmitSerializer(serializers.Serializer):
    def validate(self, attrs):
        weekly_log = self.context['weekly_log']
        state = weekly_log.workflow_state

        if state == WeeklyLog.WORKFLOW_APPROVED:
            raise serializers.ValidationError('Approved logs are final and cannot be resubmitted.')

        if state not in [
            WeeklyLog.WORKFLOW_DRAFT,
            WeeklyLog.WORKFLOW_NEEDS_REVISION,
            WeeklyLog.WORKFLOW_REJECTED,
        ]:
            raise serializers.ValidationError('Only draft or returned logs can be submitted.')

        return attrs

    def save(self, **kwargs):
        weekly_log = self.context['weekly_log']
        action = WeeklyLog.ACTION_SUBMITTED
        notes = 'Initial submission.'
        if weekly_log.workflow_state in [WeeklyLog.WORKFLOW_NEEDS_REVISION, WeeklyLog.WORKFLOW_REJECTED]:
            action = WeeklyLog.ACTION_RESUBMITTED
            notes = 'Resubmitted after supervisor feedback.'

        weekly_log.transition_to(
            WeeklyLog.WORKFLOW_SUBMITTED,
            actor=self.context['request'].user,
            action_type=action,
            notes=notes,
        )
        return weekly_log


class WeeklyLogStartReviewSerializer(serializers.Serializer):
    def validate(self, attrs):
        weekly_log = self.context['weekly_log']
        if weekly_log.workflow_state != WeeklyLog.WORKFLOW_SUBMITTED:
            raise serializers.ValidationError('Only submitted logs can be moved into review.')
        return attrs

    def save(self, **kwargs):
        weekly_log = self.context['weekly_log']
        weekly_log.review_round += 1
        weekly_log.save(update_fields=['review_round', 'updated_at'])
        weekly_log.transition_to(
            WeeklyLog.WORKFLOW_UNDER_REVIEW,
            actor=self.context['request'].user,
            action_type=WeeklyLog.ACTION_REVIEW_STARTED,
            notes=f'Review round {weekly_log.review_round} started.',
        )
        return weekly_log


class WeeklyLogReviewSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=['approve', 'needs_revision', 'reject'])
    comments = serializers.CharField(required=True, allow_blank=False)
    rating = serializers.IntegerField(required=False, min_value=1, max_value=5)

    def validate(self, attrs):
        weekly_log = self.context['weekly_log']
        decision = attrs.get('decision')
        comments = (attrs.get('comments') or '').strip()

        if weekly_log.workflow_state != WeeklyLog.WORKFLOW_UNDER_REVIEW:
            raise serializers.ValidationError('Log must be in Under Review state before decision.')

        if not comments:
            raise serializers.ValidationError({'comments': 'Comments are required for all review decisions.'})

        if decision == 'approve' and attrs.get('rating') is None:
            raise serializers.ValidationError({'rating': 'Rating is required when approving logs.'})

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

        review = SupervisorReview.objects.create(
            weekly_log=weekly_log,
            supervisor=request_user,
            comments=comments,
            decision={
                'approve': SupervisorReview.DECISION_APPROVED,
                'needs_revision': SupervisorReview.DECISION_NEEDS_REVISION,
                'reject': SupervisorReview.DECISION_REJECTED,
            }[decision],
            rating=rating,
            review_round=weekly_log.review_round,
        )

        if decision == 'approve':
            weekly_log.supervisor_decision = WeeklyLog.REVIEW_APPROVED
            weekly_log.save(update_fields=['supervisor_comments', 'supervisor_rating', 'reviewed_by', 'reviewed_at', 'supervisor_decision', 'updated_at'])
            weekly_log.transition_to(
                WeeklyLog.WORKFLOW_APPROVED,
                actor=request_user,
                action_type=WeeklyLog.ACTION_APPROVED,
                notes=f'Round {review.review_round}: {comments}',
            )
        elif decision == 'needs_revision':
            weekly_log.supervisor_decision = WeeklyLog.REVIEW_NEEDS_REVISION
            weekly_log.save(update_fields=['supervisor_comments', 'supervisor_rating', 'reviewed_by', 'reviewed_at', 'supervisor_decision', 'updated_at'])
            weekly_log.transition_to(
                WeeklyLog.WORKFLOW_NEEDS_REVISION,
                actor=request_user,
                action_type=WeeklyLog.ACTION_NEEDS_REVISION,
                notes=f'Round {review.review_round}: {comments}',
            )
        else:
            weekly_log.supervisor_decision = WeeklyLog.REVIEW_REJECTED
            weekly_log.save(update_fields=['supervisor_comments', 'supervisor_rating', 'reviewed_by', 'reviewed_at', 'supervisor_decision', 'updated_at'])
            weekly_log.transition_to(
                WeeklyLog.WORKFLOW_REJECTED,
                actor=request_user,
                action_type=WeeklyLog.ACTION_REJECTED,
                notes=f'Round {review.review_round}: {comments}',
            )

        return weekly_log


class StudentLogProgressSerializer(serializers.Serializer):
    placement_id = serializers.IntegerField()
    placement_range = serializers.CharField()
    total_expected_weeks = serializers.IntegerField()
    total_logs_submitted = serializers.IntegerField()
    approved_logs = serializers.IntegerField()
    pending_logs = serializers.IntegerField()
    revisions_count = serializers.IntegerField()
    completion_percentage = serializers.FloatField()
    missing_weeks = serializers.ListField(child=serializers.DateField())


class SupervisorReviewSerializer(serializers.ModelSerializer):
    supervisor_name = serializers.SerializerMethodField()

    class Meta:
        model = SupervisorReview
        fields = [
            'id',
            'weekly_log',
            'supervisor',
            'supervisor_name',
            'comments',
            'decision',
            'rating',
            'review_round',
            'reviewed_at',
        ]

    def get_supervisor_name(self, obj):
        return obj.supervisor.get_full_name()


class WeeklyLogAuditTrailSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = WeeklyLogAuditTrail
        fields = [
            'id',
            'weekly_log',
            'actor',
            'actor_name',
            'action_type',
            'previous_state',
            'new_state',
            'notes',
            'created_at',
        ]

    def get_actor_name(self, obj):
        if not obj.actor:
            return 'System'
        return obj.actor.get_full_name()


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
