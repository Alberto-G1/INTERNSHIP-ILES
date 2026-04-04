from django.utils import timezone
from rest_framework import serializers

from accounts.models import User

from .models import Organization, Placement


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = [
            'id',
            'name',
            'industry',
            'contact_email',
            'contact_phone',
            'region',
            'district',
            'county',
            'sub_county',
            'parish',
            'village',
            'full_address',
            'is_verified',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PlacementSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)
    organization_id = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.all(),
        source='organization',
        write_only=True,
        required=False,
        allow_null=True,
    )

    workplace_supervisor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='workplace_supervisor'),
        source='workplace_supervisor',
        write_only=True,
        required=False,
        allow_null=True,
    )
    academic_supervisor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='academic_supervisor'),
        source='academic_supervisor',
        write_only=True,
        required=False,
        allow_null=True,
    )

    student_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()
    duration_weeks = serializers.ReadOnlyField()
    current_lifecycle_status = serializers.ReadOnlyField()
    placement_letter_url = serializers.SerializerMethodField()
    workplace_supervisor_details = serializers.SerializerMethodField()
    academic_supervisor_details = serializers.SerializerMethodField()

    class Meta:
        model = Placement
        fields = [
            'id',
            'student',
            'student_name',
            'organization',
            'organization_id',
            'placement_letter',
            'placement_letter_url',
            'start_date',
            'end_date',
            'duration_weeks',
            'position_role',
            'allowance',
            'work_mode',
            'workplace_supervisor',
            'workplace_supervisor_id',
            'workplace_supervisor_details',
            'academic_supervisor',
            'academic_supervisor_id',
            'academic_supervisor_details',
            'submission_status',
            'approval_status',
            'current_lifecycle_status',
            'approved_by',
            'approved_by_name',
            'rejection_reason',
            'cancellation_reason',
            'created_at',
            'updated_at',
            'submitted_at',
            'approved_at',
            'rejected_at',
            'cancelled_at',
        ]
        read_only_fields = [
            'id',
            'student',
            'approved_by',
            'created_at',
            'updated_at',
            'submitted_at',
            'approved_at',
            'rejected_at',
            'cancelled_at',
            'duration_weeks',
            'current_lifecycle_status',
            'placement_letter_url',
        ]

    def get_student_name(self, obj):
        return obj.student.get_full_name()

    def get_approved_by_name(self, obj):
        if not obj.approved_by:
            return ''
        return obj.approved_by.get_full_name()

    def get_placement_letter_url(self, obj):
        if obj.placement_letter:
            request = self.context.get('request')
            url = obj.placement_letter.url
            return request.build_absolute_uri(url) if request else url
        return ''

    def _serialize_supervisor(self, user):
        if not user:
            return None
        return {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.get_full_name(),
            'email': user.email,
            'phone': user.phone,
            'role': user.role,
        }

    def get_workplace_supervisor_details(self, obj):
        return self._serialize_supervisor(obj.workplace_supervisor)

    def get_academic_supervisor_details(self, obj):
        return self._serialize_supervisor(obj.academic_supervisor)


class StudentPlacementCreateSerializer(PlacementSerializer):
    class Meta(PlacementSerializer.Meta):
        read_only_fields = PlacementSerializer.Meta.read_only_fields + [
            'submission_status',
            'approval_status',
            'workplace_supervisor',
            'academic_supervisor',
            'rejection_reason',
            'cancellation_reason',
        ]

    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        validated_data['submission_status'] = Placement.SUBMISSION_DRAFT
        validated_data['approval_status'] = Placement.APPROVAL_PENDING
        return super().create(validated_data)


class StudentPlacementUpdateSerializer(PlacementSerializer):
    class Meta(PlacementSerializer.Meta):
        read_only_fields = PlacementSerializer.Meta.read_only_fields + [
            'submission_status',
            'approval_status',
            'workplace_supervisor',
            'academic_supervisor',
            'rejection_reason',
            'cancellation_reason',
        ]


class PlacementSubmissionSerializer(serializers.Serializer):
    def validate(self, attrs):
        placement = self.context['placement']

        placement.submission_status = Placement.SUBMISSION_SUBMITTED
        placement.approval_status = Placement.APPROVAL_PENDING
        placement.submitted_at = timezone.now()

        placement.full_clean()
        return attrs

    def save(self, **kwargs):
        placement = self.context['placement']
        placement.submission_status = Placement.SUBMISSION_SUBMITTED
        placement.approval_status = Placement.APPROVAL_PENDING
        placement.submitted_at = timezone.now()
        placement.save(
            update_fields=[
                'submission_status',
                'approval_status',
                'submitted_at',
                'updated_at',
            ]
        )
        return placement


class PlacementDecisionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['approve', 'reject', 'cancel'])
    reason = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        placement = self.context['placement']
        action = attrs['action']
        reason = attrs.get('reason', '').strip()

        if placement.submission_status != Placement.SUBMISSION_SUBMITTED:
            raise serializers.ValidationError('Only submitted placements can be reviewed.')

        if action == 'approve':
            if placement.approval_status == Placement.APPROVAL_APPROVED:
                raise serializers.ValidationError('Placement is already approved.')

        if action == 'reject' and not reason:
            raise serializers.ValidationError({'reason': 'Reason is required when rejecting a placement.'})

        if action == 'cancel' and not reason:
            raise serializers.ValidationError({'reason': 'Reason is required when cancelling a placement.'})

        return attrs

    def save(self, **kwargs):
        placement = self.context['placement']
        admin_user = self.context['request'].user
        action = self.validated_data['action']
        reason = self.validated_data.get('reason', '').strip()

        placement.approved_by = admin_user

        if action == 'approve':
            placement.approval_status = Placement.APPROVAL_APPROVED
            placement.approved_at = timezone.now()
            placement.rejected_at = None
            placement.cancelled_at = None
            placement.rejection_reason = ''
            placement.cancellation_reason = ''
        elif action == 'reject':
            placement.approval_status = Placement.APPROVAL_REJECTED
            placement.rejected_at = timezone.now()
            placement.approved_at = None
            placement.cancelled_at = None
            placement.rejection_reason = reason
            placement.cancellation_reason = ''
            placement.workplace_supervisor = None
            placement.academic_supervisor = None
        else:
            placement.approval_status = Placement.APPROVAL_CANCELLED
            placement.cancelled_at = timezone.now()
            placement.approved_at = None
            placement.rejected_at = None
            placement.cancellation_reason = reason
            placement.rejection_reason = ''
            placement.workplace_supervisor = None
            placement.academic_supervisor = None

        placement.save()
        return placement


class SupervisorAssignmentSerializer(serializers.Serializer):
    workplace_supervisor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='workplace_supervisor'),
        required=False,
        allow_null=True,
    )
    academic_supervisor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='academic_supervisor'),
        required=False,
        allow_null=True,
    )

    def validate(self, attrs):
        placement = self.context['placement']
        if placement.approval_status != Placement.APPROVAL_APPROVED:
            raise serializers.ValidationError(
                'Supervisors can only be assigned for approved placements.'
            )
        return attrs

    def save(self, **kwargs):
        placement = self.context['placement']

        if 'workplace_supervisor_id' in self.validated_data:
            placement.workplace_supervisor = self.validated_data['workplace_supervisor_id']

        if 'academic_supervisor_id' in self.validated_data:
            placement.academic_supervisor = self.validated_data['academic_supervisor_id']

        placement.save()
        return placement
