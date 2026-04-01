from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from placements.models import Placement

from .models import EvaluationCriterion, EvaluationScore, PlacementEvaluation


class EvaluationCriterionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationCriterion
        fields = [
            'id',
            'name',
            'description',
            'max_score',
            'weight',
            'display_order',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EvaluationScoreSerializer(serializers.ModelSerializer):
    criterion_name = serializers.ReadOnlyField(source='criterion.name')
    criterion_max_score = serializers.ReadOnlyField(source='criterion.max_score')

    class Meta:
        model = EvaluationScore
        fields = [
            'id',
            'criterion',
            'criterion_name',
            'criterion_max_score',
            'score',
        ]
        read_only_fields = ['id', 'criterion_name', 'criterion_max_score']


class PlacementEvaluationSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    evaluated_by_name = serializers.SerializerMethodField()
    placement_summary = serializers.SerializerMethodField()
    criteria_scores = EvaluationScoreSerializer(many=True, read_only=True)
    max_possible_score = serializers.ReadOnlyField()

    class Meta:
        model = PlacementEvaluation
        fields = [
            'id',
            'student',
            'student_name',
            'placement',
            'placement_summary',
            'evaluated_by',
            'evaluated_by_name',
            'status',
            'evaluation_date',
            'total_score',
            'max_possible_score',
            'grade',
            'general_feedback',
            'criteria_scores',
            'submitted_at',
            'finalized_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'student_name',
            'placement_summary',
            'evaluated_by_name',
            'total_score',
            'max_possible_score',
            'grade',
            'submitted_at',
            'finalized_at',
            'created_at',
            'updated_at',
        ]

    def get_student_name(self, obj):
        return obj.student.get_full_name()

    def get_evaluated_by_name(self, obj):
        return obj.evaluated_by.get_full_name()

    def get_placement_summary(self, obj):
        org = obj.placement.organization.name if obj.placement.organization else 'Unknown Organization'
        return f"{org} ({obj.placement.start_date} to {obj.placement.end_date})"


class EvaluationScoreInputSerializer(serializers.Serializer):
    criterion_id = serializers.IntegerField()
    score = serializers.DecimalField(max_digits=6, decimal_places=2)


class EvaluationUpsertSerializer(serializers.Serializer):
    placement_id = serializers.IntegerField(required=False)
    general_feedback = serializers.CharField(required=False, allow_blank=True)
    scores = EvaluationScoreInputSerializer(many=True, required=False)

    def validate(self, attrs):
        request = self.context['request']
        instance = getattr(self, 'instance', None)

        if instance is None and 'placement_id' not in attrs:
            raise serializers.ValidationError({'placement_id': 'This field is required.'})

        placement_id = attrs.get('placement_id')
        if placement_id is not None:
            placement = Placement.objects.filter(id=placement_id).select_related('student').first()
            if not placement:
                raise serializers.ValidationError({'placement_id': 'Placement not found.'})

            if placement.academic_supervisor_id != request.user.id:
                raise serializers.ValidationError({'placement_id': 'You can only evaluate your assigned placements.'})

            if PlacementEvaluation.objects.filter(placement=placement).exists() and instance is None:
                raise serializers.ValidationError({'placement_id': 'An evaluation already exists for this placement.'})

            attrs['placement_obj'] = placement

        scores = attrs.get('scores', [])
        criterion_ids = [item['criterion_id'] for item in scores]
        if len(criterion_ids) != len(set(criterion_ids)):
            raise serializers.ValidationError({'scores': 'Duplicate criterion ids are not allowed.'})

        return attrs

    def _upsert_scores(self, evaluation, scores_data):
        criterion_map = {
            c.id: c for c in EvaluationCriterion.objects.filter(id__in=[s['criterion_id'] for s in scores_data], is_active=True)
        }

        for item in scores_data:
            criterion = criterion_map.get(item['criterion_id'])
            if not criterion:
                raise serializers.ValidationError({'scores': f"Invalid or inactive criterion id {item['criterion_id']}"})

            score_obj, _ = EvaluationScore.objects.get_or_create(
                evaluation=evaluation,
                criterion=criterion,
                defaults={'score': item['score']},
            )
            score_obj.score = item['score']
            score_obj.save()

    @transaction.atomic
    def create(self, validated_data):
        request = self.context['request']
        placement = validated_data['placement_obj']

        evaluation = PlacementEvaluation.objects.create(
            student=placement.student,
            placement=placement,
            evaluated_by=request.user,
            status=PlacementEvaluation.STATUS_DRAFT,
            evaluation_date=timezone.now().date(),
            general_feedback=validated_data.get('general_feedback', ''),
        )

        self._upsert_scores(evaluation, validated_data.get('scores', []))

        # recompute aggregate after scores upsert
        evaluation.total_score = evaluation.calculate_total_score()
        evaluation.grade = evaluation.calculate_grade(evaluation.total_score)
        evaluation.save()
        return evaluation

    @transaction.atomic
    def update(self, instance, validated_data):
        if instance.status == PlacementEvaluation.STATUS_FINALIZED:
            raise serializers.ValidationError('Finalized evaluations cannot be edited.')

        if 'general_feedback' in validated_data:
            instance.general_feedback = validated_data['general_feedback']

        if 'scores' in validated_data:
            self._upsert_scores(instance, validated_data['scores'])

        instance.total_score = instance.calculate_total_score()
        instance.grade = instance.calculate_grade(instance.total_score)
        instance.save()
        return instance


class EvaluationSubmitSerializer(serializers.Serializer):
    def validate(self, attrs):
        evaluation = self.context['evaluation']
        if evaluation.status == PlacementEvaluation.STATUS_FINALIZED:
            raise serializers.ValidationError('Finalized evaluations cannot be submitted again.')

        evaluation.status = PlacementEvaluation.STATUS_SUBMITTED
        evaluation.submitted_at = timezone.now()
        evaluation.full_clean()
        return attrs

    def save(self, **kwargs):
        evaluation = self.context['evaluation']
        evaluation.status = PlacementEvaluation.STATUS_SUBMITTED
        if not evaluation.submitted_at:
            evaluation.submitted_at = timezone.now()
        evaluation.save(update_fields=['status', 'submitted_at', 'total_score', 'grade', 'updated_at'])
        return evaluation


class EvaluationFinalizeSerializer(serializers.Serializer):
    def validate(self, attrs):
        evaluation = self.context['evaluation']
        if evaluation.status == PlacementEvaluation.STATUS_FINALIZED:
            raise serializers.ValidationError('Evaluation is already finalized.')

        if evaluation.status != PlacementEvaluation.STATUS_SUBMITTED:
            raise serializers.ValidationError('Evaluation must be submitted before finalization.')

        evaluation.status = PlacementEvaluation.STATUS_FINALIZED
        evaluation.finalized_at = timezone.now()
        evaluation.full_clean()
        return attrs

    def save(self, **kwargs):
        evaluation = self.context['evaluation']
        evaluation.status = PlacementEvaluation.STATUS_FINALIZED
        if not evaluation.finalized_at:
            evaluation.finalized_at = timezone.now()
        evaluation.save(update_fields=['status', 'finalized_at', 'total_score', 'grade', 'updated_at'])
        return evaluation
