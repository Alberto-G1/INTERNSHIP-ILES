from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils.crypto import get_random_string
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin, IsAnySupervisor, IsStudent
from accounts.models import SupervisorProfile, User
from auditing.services import notify_user

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
        if student_has_submitted_placement(request.user):
            return Response(
                {
                    'error': (
                        'You have already submitted a placement. '
                        'New drafts are not allowed after submission.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = StudentPlacementCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        placement = serializer.save()
        response = PlacementSerializer(placement, context={'request': request})
        return Response(response.data, status=status.HTTP_201_CREATED)


def student_has_submitted_placement(student, exclude_placement_id=None):
    queryset = Placement.objects.filter(
        student=student,
        submission_status=Placement.SUBMISSION_SUBMITTED,
    )
    if exclude_placement_id is not None:
        queryset = queryset.exclude(id=exclude_placement_id)
    return queryset.exists()


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

        if student_has_submitted_placement(request.user):
            return Response(
                {
                    'error': (
                        'You already submitted a placement. '
                        'Remaining drafts can only be deleted.'
                    )
                },
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

    def delete(self, request, placement_id):
        placement = self.get_object(request, placement_id)

        if placement.submission_status != Placement.SUBMISSION_DRAFT:
            return Response(
                {'error': 'Only draft placements can be deleted by students.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        placement.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class StudentPlacementSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request, placement_id):
        placement = get_object_or_404(Placement, id=placement_id, student=request.user)

        if placement.submission_status != Placement.SUBMISSION_DRAFT:
            return Response(
                {'error': 'Only draft placements can be submitted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if student_has_submitted_placement(request.user, exclude_placement_id=placement.id):
            return Response(
                {
                    'error': (
                        'You can only submit one placement. '
                        'Other placements must remain drafts or be deleted.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = PlacementSubmissionSerializer(data=request.data, context={'placement': placement})
        serializer.is_valid(raise_exception=True)
        submitted = serializer.save()
        return Response(PlacementSerializer(submitted, context={'request': request}).data)

class StudentWorkplaceSupervisorAssignView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def patch(self, request, placement_id):
        placement = get_object_or_404(Placement, id=placement_id, student=request.user)

        if placement.submission_status != Placement.SUBMISSION_SUBMITTED:
            return Response(
                {'error': 'Only submitted placements can be assigned a workplace supervisor.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if placement.approval_status != Placement.APPROVAL_APPROVED:
            return Response(
                {'error': 'Placement must be approved before assigning a workplace supervisor.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_supervisor = request.data.get('new_supervisor')
        if new_supervisor:
            required_fields = ['first_name', 'last_name', 'email', 'organization_name', 'department', 'position', 'location']
            missing = [field for field in required_fields if not str(new_supervisor.get(field, '')).strip()]
            if missing:
                return Response(
                    {'error': f'Missing required new supervisor fields: {", ".join(missing)}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            email = str(new_supervisor.get('email', '')).strip().lower()
            phone = str(new_supervisor.get('phone', '')).strip()
            first_name = str(new_supervisor.get('first_name', '')).strip()
            last_name = str(new_supervisor.get('last_name', '')).strip()

            # Reuse existing workplace supervisor account by email when possible.
            existing_user = User.objects.filter(
                role='workplace_supervisor',
                email__iexact=email,
            ).first()

            if existing_user:
                placement.workplace_supervisor = existing_user
                placement.save(update_fields=['workplace_supervisor', 'updated_at'])
                return Response(PlacementSerializer(placement, context={'request': request}).data)

            username_seed = email.split('@')[0] if '@' in email else f'workplace_{placement.id}'
            username = username_seed
            while User.objects.filter(username=username).exists():
                username = f"{username_seed}_{get_random_string(4).lower()}"

            password = get_random_string(12)
            created_user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                phone=phone,
                role='workplace_supervisor',
                admin_approved=True,
                first_login_completed=True,
                password=password,
            )

            SupervisorProfile.objects.create(
                user=created_user,
                supervisor_type='workplace',
                organization_name=str(new_supervisor.get('organization_name')).strip(),
                department=str(new_supervisor.get('department')).strip(),
                position=str(new_supervisor.get('position')).strip(),
                location=str(new_supervisor.get('location')).strip(),
                work_email=email,
                work_phone=phone,
            )

            placement.workplace_supervisor = created_user
            placement.save(update_fields=['workplace_supervisor', 'updated_at'])
            return Response(PlacementSerializer(placement, context={'request': request}).data)

        serializer = SupervisorAssignmentSerializer(
            data=request.data,
            context={'placement': placement},
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(PlacementSerializer(updated, context={'request': request}).data)



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

        # Admins can only see submitted placements, not student drafts
        queryset = queryset.filter(submission_status=Placement.SUBMISSION_SUBMITTED)

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
        
        # Send notifications based on decision
        if updated.approval_status == Placement.APPROVAL_APPROVED:
            notify_user(
                recipient_id=updated.student_id,
                title='Placement Approved ✅',
                message=f'Your placement at {updated.organization.name} has been approved!',
                notification_type='success',
                reference_type='Placement',
                reference_id=updated.id,
                send_email=True,
            )
        elif updated.approval_status == Placement.APPROVAL_REJECTED:
            notify_user(
                recipient_id=updated.student_id,
                title='Placement Rejected',
                message=f'Your placement at {updated.organization.name} was rejected.',
                notification_type='warning',
                reference_type='Placement',
                reference_id=updated.id,
                send_email=True,
            )
        
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
