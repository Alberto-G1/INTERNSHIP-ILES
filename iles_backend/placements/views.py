from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin, IsAnySupervisor, IsStudent

from .models import Organization, Placement
from .serializers import (
    OrganizationSerializer,
    PlacementDecisionSerializer,
    PlacementSerializer,
    PlacementSubmissionSerializer,
    StudentPlacementCreateSerializer,
    StudentPlacementUpdateSerializer,
    SupervisorAssignmentSerializer,
)


class PlacementPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


def sync_student_internship_status(placement):
    profile = getattr(placement.student, 'student_profile', None)
    if not profile:
        return

    lifecycle = placement.current_lifecycle_status
    if lifecycle == 'approved':
        profile.internship_status = 'assigned'
    elif lifecycle == 'active':
        profile.internship_status = 'ongoing'
    elif lifecycle == 'completed':
        profile.internship_status = 'completed'
    elif lifecycle in ['rejected', 'cancelled']:
        profile.internship_status = 'not_assigned'

    profile.save(update_fields=['internship_status', 'updated_at'])


class StudentPlacementListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        placements = Placement.objects.filter(student=request.user).select_related(
            'organization',
            'approved_by',
            'workplace_supervisor',
            'academic_supervisor',
        )
        serializer = PlacementSerializer(placements, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = StudentPlacementCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        placement = serializer.save()
        response = PlacementSerializer(placement, context={'request': request})
        return Response(response.data, status=status.HTTP_201_CREATED)


class OrganizationListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = Organization.objects.all().order_by('name')

        verified = request.query_params.get('verified')
        if verified == 'true':
            queryset = queryset.filter(is_verified=True)
        elif verified == 'false':
            queryset = queryset.filter(is_verified=False)

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)

        serializer = OrganizationSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = OrganizationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        organization = serializer.save()

        # Non-admin users cannot self-verify organizations.
        if request.user.role != 'admin' and organization.is_verified:
            organization.is_verified = False
            organization.save(update_fields=['is_verified', 'updated_at'])

        return Response(OrganizationSerializer(organization).data, status=status.HTTP_201_CREATED)


class StudentPlacementDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self, request, placement_id):
        return get_object_or_404(Placement, id=placement_id, student=request.user)

    def get(self, request, placement_id):
        placement = self.get_object(request, placement_id)
        serializer = PlacementSerializer(placement, context={'request': request})
        return Response(serializer.data)

    def patch(self, request, placement_id):
        placement = self.get_object(request, placement_id)

        if placement.submission_status != Placement.SUBMISSION_DRAFT:
            return Response(
                {'error': 'Only draft placements can be edited by students.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = StudentPlacementUpdateSerializer(
            placement,
            data=request.data,
            partial=True,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(PlacementSerializer(updated, context={'request': request}).data)


class StudentPlacementSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request, placement_id):
        placement = get_object_or_404(Placement, id=placement_id, student=request.user)

        serializer = PlacementSubmissionSerializer(data=request.data, context={'placement': placement})
        serializer.is_valid(raise_exception=True)
        submitted = serializer.save()
        return Response(PlacementSerializer(submitted, context={'request': request}).data)


class AdminPlacementListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    pagination_class = PlacementPagination

    def get(self, request):
        queryset = Placement.objects.select_related(
            'student',
            'organization',
            'approved_by',
            'workplace_supervisor',
            'academic_supervisor',
        ).all()

        submission_status = request.query_params.get('submission_status')
        approval_status = request.query_params.get('approval_status')
        student = request.query_params.get('student')
        organization = request.query_params.get('organization')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        search = request.query_params.get('search')

        if submission_status:
            queryset = queryset.filter(submission_status=submission_status)

        if approval_status:
            queryset = queryset.filter(approval_status=approval_status)

        if student:
            queryset = queryset.filter(student_id=student)

        if organization:
            queryset = queryset.filter(organization_id=organization)

        if date_from:
            queryset = queryset.filter(start_date__gte=date_from)

        if date_to:
            queryset = queryset.filter(end_date__lte=date_to)

        if search:
            queryset = queryset.filter(
                Q(student__username__icontains=search)
                | Q(student__first_name__icontains=search)
                | Q(student__last_name__icontains=search)
                | Q(organization__name__icontains=search)
            )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = PlacementSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class AdminPlacementDecisionView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request, placement_id):
        placement = get_object_or_404(Placement, id=placement_id)

        serializer = PlacementDecisionSerializer(
            data=request.data,
            context={'placement': placement, 'request': request},
        )
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        sync_student_internship_status(updated)
        return Response(PlacementSerializer(updated, context={'request': request}).data)


class AdminPlacementSupervisorAssignView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def patch(self, request, placement_id):
        placement = get_object_or_404(Placement, id=placement_id)

        serializer = SupervisorAssignmentSerializer(
            data=request.data,
            context={'placement': placement},
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        sync_student_internship_status(updated)
        return Response(PlacementSerializer(updated, context={'request': request}).data)


class PlacementLifecycleRefreshView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request):
        # Maintenance endpoint to refresh student internship statuses from date-driven lifecycle.
        updated_count = 0
        for placement in Placement.objects.filter(approval_status=Placement.APPROVAL_APPROVED):
            before = getattr(placement.student, 'student_profile', None)
            before_status = before.internship_status if before else None
            sync_student_internship_status(placement)
            after = getattr(placement.student, 'student_profile', None)
            after_status = after.internship_status if after else None
            if before_status != after_status:
                updated_count += 1

        return Response(
            {
                'message': 'Lifecycle refresh completed.',
                'updated_students': updated_count,
                'timestamp': timezone.now(),
            }
        )


class SupervisorAssignedPlacementsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAnySupervisor]

    def get(self, request):
        if request.user.role == 'workplace_supervisor':
            queryset = Placement.objects.filter(workplace_supervisor=request.user)
        else:
            queryset = Placement.objects.filter(academic_supervisor=request.user)

        queryset = queryset.select_related(
            'student',
            'organization',
            'approved_by',
            'workplace_supervisor',
            'academic_supervisor',
        )

        serializer = PlacementSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
