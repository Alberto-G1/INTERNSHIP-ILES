from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAcademicSupervisor, IsAdmin, IsStudent

from .models import EvaluationCriterion, PlacementEvaluation
from .serializers import (
    EvaluationCriterionSerializer,
    EvaluationFinalizeSerializer,
    EvaluationSubmitSerializer,
    EvaluationUpsertSerializer,
    PlacementEvaluationSerializer,
)


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
