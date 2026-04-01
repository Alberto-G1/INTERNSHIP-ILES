from django.db.models import Q
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin, IsStudent

from .models import AuditLog, Notification
from .serializers import AuditLogSerializer, NotificationSerializer, NotificationUpdateSerializer


class AdminAuditLogListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        """List audit logs with filters"""
        queryset = AuditLog.objects.all().select_related('actor')

        # Filters
        action = request.query_params.get('action')
        entity_type = request.query_params.get('entity_type')
        actor_id = request.query_params.get('actor_id')
        search = request.query_params.get('search')

        if action:
            queryset = queryset.filter(action=action)
        if entity_type:
            queryset = queryset.filter(entity_type=entity_type)
        if actor_id:
            queryset = queryset.filter(actor_id=actor_id)
        if search:
            queryset = queryset.filter(
                Q(entity_description__icontains=search)
                | Q(actor__username__icontains=search)
                | Q(actor__first_name__icontains=search)
                | Q(actor__last_name__icontains=search)
            )

        serializer = AuditLogSerializer(queryset, many=True)
        return Response(serializer.data)


class NotificationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """List notifications for current user"""
        queryset = Notification.objects.filter(recipient=request.user)

        unread_only = request.query_params.get('unread_only', 'false').lower() == 'true'
        if unread_only:
            queryset = queryset.filter(is_read=False)

        serializer = NotificationSerializer(queryset, many=True)
        return Response(serializer.data)


class NotificationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_notification(self, notification_id, user):
        try:
            return Notification.objects.get(id=notification_id, recipient=user)
        except Notification.DoesNotExist:
            return None

    def patch(self, request, notification_id):
        """Mark notification as read"""
        notification = self.get_notification(notification_id, request.user)
        if not notification:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = NotificationUpdateSerializer(notification, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(NotificationSerializer(notification).data)


class NotificationBulkMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Mark all unread notifications as read"""
        Notification.objects.filter(recipient=request.user, is_read=False).update(
            is_read=True,
        )
        return Response({'status': 'All notifications marked as read'})


class NotificationStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get notification stats for current user"""
        total = Notification.objects.filter(recipient=request.user).count()
        unread = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({
            'total': total,
            'unread': unread,
        })
