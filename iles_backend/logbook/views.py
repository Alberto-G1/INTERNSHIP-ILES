from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin, IsAnySupervisor, IsStudent
from placements.models import Placement

from .models import WeeklyLog
from .serializers import (
    SupervisorReviewSerializer,
    StudentLogProgressSerializer,
    StudentWeeklyLogCreateSerializer,
    StudentWeeklyLogUpdateSerializer,
    WeeklyLogAuditTrailSerializer,
    WeeklyLogReviewSerializer,
    WeeklyLogStartReviewSerializer,
    WeeklyLogSerializer,
    WeeklyLogSubmitSerializer,
    compute_missing_weeks,
)


class WeeklyLogPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class StudentWeeklyLogListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        logs = WeeklyLog.objects.filter(student=request.user).select_related(
            'placement',
            'placement__organization',
            'reviewed_by',
        )
        serializer = WeeklyLogSerializer(logs, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = StudentWeeklyLogCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        weekly_log = serializer.save()
        response = WeeklyLogSerializer(weekly_log, context={'request': request})
        return Response(response.data, status=status.HTTP_201_CREATED)


class StudentWeeklyLogDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self, request, log_id):
        return get_object_or_404(WeeklyLog, id=log_id, student=request.user)

    def get(self, request, log_id):
        weekly_log = self.get_object(request, log_id)
        serializer = WeeklyLogSerializer(weekly_log, context={'request': request})
        return Response(serializer.data)

    def patch(self, request, log_id):
        weekly_log = self.get_object(request, log_id)

        editable = weekly_log.workflow_state in [
            WeeklyLog.WORKFLOW_DRAFT,
            WeeklyLog.WORKFLOW_NEEDS_REVISION,
            WeeklyLog.WORKFLOW_REJECTED,
        ]
        if not editable:
            return Response(
                {'error': 'Only draft or revision-requested logs can be edited.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = StudentWeeklyLogUpdateSerializer(
            weekly_log,
            data=request.data,
            partial=True,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(WeeklyLogSerializer(updated, context={'request': request}).data)


class StudentWeeklyLogSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request, log_id):
        weekly_log = get_object_or_404(WeeklyLog, id=log_id, student=request.user)

        serializer = WeeklyLogSubmitSerializer(
            data=request.data,
            context={'weekly_log': weekly_log, 'request': request},
        )
        serializer.is_valid(raise_exception=True)
        submitted = serializer.save()

        return Response(WeeklyLogSerializer(submitted, context={'request': request}).data)


class StudentWeeklyLogResubmitView(StudentWeeklyLogSubmitView):
    pass


class StudentLogProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request):
        today = timezone.now().date()
        active_placements = Placement.objects.filter(
            student=request.user,
            approval_status=Placement.APPROVAL_APPROVED,
            start_date__lte=today,
            end_date__gte=today,
        ).select_related('organization')

        payload = []
        for placement in active_placements:
            logs = WeeklyLog.objects.filter(student=request.user, placement=placement)
            week_dates = set(logs.values_list('week_ending_date', flat=True))
            missing = compute_missing_weeks(placement, week_dates)

            payload.append(
                {
                    'placement_id': placement.id,
                    'placement_range': f"{placement.start_date} to {placement.end_date}",
                    'total_expected_weeks': len(week_dates) + len(missing),
                    'total_logs_submitted': logs.filter(submission_status=WeeklyLog.SUBMISSION_SUBMITTED).count(),
                    'approved_logs': logs.filter(review_status=WeeklyLog.REVIEW_APPROVED).count(),
                    'pending_logs': logs.filter(review_status=WeeklyLog.REVIEW_PENDING).count(),
                    'revisions_count': logs.filter(review_status=WeeklyLog.REVIEW_NEEDS_REVISION).count(),
                    'completion_percentage': round(
                        (
                            logs.filter(review_status=WeeklyLog.REVIEW_APPROVED).count()
                            / max(1, (len(week_dates) + len(missing)))
                        )
                        * 100,
                        2,
                    ),
                    'missing_weeks': missing,
                }
            )

        serializer = StudentLogProgressSerializer(payload, many=True)
        return Response(serializer.data)


class SupervisorAssignedLogListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAnySupervisor]
    pagination_class = WeeklyLogPagination

    def get(self, request):
        role = request.user.role
        if role == 'workplace_supervisor':
            queryset = WeeklyLog.objects.filter(placement__workplace_supervisor=request.user)
        else:
            queryset = WeeklyLog.objects.filter(placement__academic_supervisor=request.user)

        status_filter = request.query_params.get('status')
        search = request.query_params.get('search')

        if status_filter:
            if status_filter in [WeeklyLog.SUBMISSION_DRAFT, WeeklyLog.SUBMISSION_SUBMITTED]:
                queryset = queryset.filter(submission_status=status_filter)
            else:
                queryset = queryset.filter(review_status=status_filter)

        if search:
            queryset = queryset.filter(
                Q(student__username__icontains=search)
                | Q(student__first_name__icontains=search)
                | Q(student__last_name__icontains=search)
                | Q(placement__organization__name__icontains=search)
            )

        queryset = queryset.select_related(
            'student',
            'placement',
            'placement__organization',
            'reviewed_by',
        )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = WeeklyLogSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class SupervisorWeeklyLogReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAnySupervisor]

    def get_object(self, request, log_id):
        base = WeeklyLog.objects.select_related('placement')
        if request.user.role == 'workplace_supervisor':
            return get_object_or_404(base, id=log_id, placement__workplace_supervisor=request.user)
        return get_object_or_404(base, id=log_id, placement__academic_supervisor=request.user)

    def post(self, request, log_id):
        weekly_log = self.get_object(request, log_id)

        if not weekly_log.placement.workplace_supervisor_id and not weekly_log.placement.academic_supervisor_id:
            return Response(
                {'error': 'No supervisor assigned to this placement.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = WeeklyLogReviewSerializer(
            data=request.data,
            context={'weekly_log': weekly_log, 'request': request},
        )
        serializer.is_valid(raise_exception=True)
        reviewed = serializer.save()
        return Response(WeeklyLogSerializer(reviewed, context={'request': request}).data)


class SupervisorWeeklyLogStartReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAnySupervisor]

    def get_object(self, request, log_id):
        base = WeeklyLog.objects.select_related('placement')
        if request.user.role == 'workplace_supervisor':
            return get_object_or_404(base, id=log_id, placement__workplace_supervisor=request.user)
        return get_object_or_404(base, id=log_id, placement__academic_supervisor=request.user)

    def post(self, request, log_id):
        weekly_log = self.get_object(request, log_id)

        serializer = WeeklyLogStartReviewSerializer(
            data=request.data,
            context={'weekly_log': weekly_log, 'request': request},
        )
        serializer.is_valid(raise_exception=True)
        started = serializer.save()
        return Response(WeeklyLogSerializer(started, context={'request': request}).data)


class WeeklyLogAuditTrailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _can_access(self, request, weekly_log):
        if request.user.role == 'admin':
            return True

        if request.user.role == 'student':
            return weekly_log.student_id == request.user.id

        if request.user.role == 'workplace_supervisor':
            return weekly_log.placement.workplace_supervisor_id == request.user.id

        if request.user.role == 'academic_supervisor':
            return weekly_log.placement.academic_supervisor_id == request.user.id

        return False

    def get(self, request, log_id):
        weekly_log = get_object_or_404(
            WeeklyLog.objects.select_related('placement'),
            id=log_id,
        )

        if not self._can_access(request, weekly_log):
            return Response({'error': 'You do not have access to this audit trail.'}, status=status.HTTP_403_FORBIDDEN)

        audits = weekly_log.audit_trail.select_related('actor').all()
        reviews = weekly_log.reviews.select_related('supervisor').all()

        return Response(
            {
                'log': WeeklyLogSerializer(weekly_log, context={'request': request}).data,
                'audit_trail': WeeklyLogAuditTrailSerializer(audits, many=True).data,
                'reviews': SupervisorReviewSerializer(reviews, many=True).data,
            }
        )


class AdminLogbookOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        total_logs = WeeklyLog.objects.count()
        pending_review = WeeklyLog.objects.filter(
            review_status__in=[WeeklyLog.REVIEW_PENDING, WeeklyLog.REVIEW_UNDER_REVIEW]
        ).count()
        approved = WeeklyLog.objects.filter(review_status=WeeklyLog.REVIEW_APPROVED).count()
        revisions = WeeklyLog.objects.filter(review_status=WeeklyLog.REVIEW_NEEDS_REVISION).count()
        late_submissions = WeeklyLog.objects.filter(is_late=True).count()

        approval_rate = 0
        if total_logs:
            approval_rate = round((approved / total_logs) * 100, 2)

        return Response(
            {
                'total_logs': total_logs,
                'pending_review': pending_review,
                'approved': approved,
                'revisions': revisions,
                'late_submissions': late_submissions,
                'approval_rate': approval_rate,
            }
        )
