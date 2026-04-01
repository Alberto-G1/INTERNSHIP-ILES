from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAcademicSupervisor, IsAdmin, IsStudent
from placements.models import Placement

from .models import EvaluationCriterion, FinalInternshipScore, PlacementEvaluation
from .serializers import (
    EvaluationCriterionSerializer,
    EvaluationFinalizeSerializer,
    EvaluationSubmitSerializer,
    EvaluationUpsertSerializer,
    FinalInternshipScoreSerializer,
    FinalScoreComputeRequestSerializer,
    PlacementEvaluationSerializer,
)
from .services import compute_final_score_for_placement


class EvaluationCriteriaListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = EvaluationCriterion.objects.all().order_by('display_order', 'name')
        serializer = EvaluationCriterionSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can create evaluation criteria.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = EvaluationCriterionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        criterion = serializer.save()
        return Response(EvaluationCriterionSerializer(criterion).data, status=status.HTTP_201_CREATED)


class EvaluationCriteriaDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def patch(self, request, criterion_id):
        criterion = get_object_or_404(EvaluationCriterion, id=criterion_id)
        serializer = EvaluationCriterionSerializer(criterion, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(EvaluationCriterionSerializer(updated).data)


class SupervisorEvaluationListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAcademicSupervisor]

    def get(self, request):
        evaluations = PlacementEvaluation.objects.filter(evaluated_by=request.user).select_related(
            'student',
            'placement',
            'placement__organization',
            'evaluated_by',
        ).prefetch_related('criteria_scores__criterion')

        serializer = PlacementEvaluationSerializer(evaluations, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = EvaluationUpsertSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        evaluation = serializer.save()
        return Response(PlacementEvaluationSerializer(evaluation).data, status=status.HTTP_201_CREATED)


class SupervisorEvaluationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAcademicSupervisor]

    def get_object(self, request, evaluation_id):
        return get_object_or_404(
            PlacementEvaluation.objects.select_related(
                'student',
                'placement',
                'placement__organization',
                'evaluated_by',
            ).prefetch_related('criteria_scores__criterion'),
            id=evaluation_id,
            evaluated_by=request.user,
        )

    def get(self, request, evaluation_id):
        evaluation = self.get_object(request, evaluation_id)
        return Response(PlacementEvaluationSerializer(evaluation).data)

    def patch(self, request, evaluation_id):
        evaluation = self.get_object(request, evaluation_id)
        serializer = EvaluationUpsertSerializer(evaluation, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(PlacementEvaluationSerializer(updated).data)


class SupervisorEvaluationSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAcademicSupervisor]

    def post(self, request, evaluation_id):
        evaluation = get_object_or_404(PlacementEvaluation, id=evaluation_id, evaluated_by=request.user)
        serializer = EvaluationSubmitSerializer(data=request.data, context={'evaluation': evaluation})
        serializer.is_valid(raise_exception=True)
        submitted = serializer.save()
        return Response(PlacementEvaluationSerializer(submitted).data)


class SupervisorEvaluationFinalizeView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAcademicSupervisor]

    def post(self, request, evaluation_id):
        evaluation = get_object_or_404(PlacementEvaluation, id=evaluation_id, evaluated_by=request.user)
        serializer = EvaluationFinalizeSerializer(data=request.data, context={'evaluation': evaluation})
        serializer.is_valid(raise_exception=True)
        finalized = serializer.save()

        # Attempt auto-computation when all dependencies are ready.
        try:
            compute_final_score_for_placement(finalized.placement, computed_by=request.user)
        except DjangoValidationError:
            pass

        return Response(PlacementEvaluationSerializer(finalized).data)


class StudentEvaluationListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request):
        queryset = PlacementEvaluation.objects.filter(student=request.user).select_related(
            'student',
            'placement',
            'placement__organization',
            'evaluated_by',
        ).prefetch_related('criteria_scores__criterion')
        serializer = PlacementEvaluationSerializer(queryset, many=True)
        return Response(serializer.data)


class StudentEvaluationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request, evaluation_id):
        evaluation = get_object_or_404(
            PlacementEvaluation.objects.select_related(
                'student',
                'placement',
                'placement__organization',
                'evaluated_by',
            ).prefetch_related('criteria_scores__criterion'),
            id=evaluation_id,
            student=request.user,
        )
        return Response(PlacementEvaluationSerializer(evaluation).data)


class AdminFinalScoreComputeView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = FinalScoreComputeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        placement = get_object_or_404(Placement.objects.select_related('student'), id=serializer.validated_data['placement_id'])

        try:
            final_score = compute_final_score_for_placement(placement, computed_by=request.user)
        except DjangoValidationError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(FinalInternshipScoreSerializer(final_score).data, status=status.HTTP_201_CREATED)


class AdminFinalScoreListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        queryset = FinalInternshipScore.objects.select_related(
            'student',
            'placement',
            'placement__organization',
            'computed_by',
        )

        search = request.query_params.get('search')
        grade = request.query_params.get('grade')
        if grade:
            queryset = queryset.filter(grade=grade)
        if search:
            queryset = queryset.filter(
                Q(student__username__icontains=search)
                | Q(student__first_name__icontains=search)
                | Q(student__last_name__icontains=search)
            )

        serializer = FinalInternshipScoreSerializer(queryset, many=True)
        return Response(serializer.data)


class StudentFinalScoreListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request):
        queryset = FinalInternshipScore.objects.filter(student=request.user).select_related(
            'student',
            'placement',
            'placement__organization',
            'computed_by',
        )
        serializer = FinalInternshipScoreSerializer(queryset, many=True)
        return Response(serializer.data)
