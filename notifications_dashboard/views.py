from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Count
from django.utils import timezone
from .models import Notification, NotificationPreference, NotificationTemplate

# Create your views here.

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """Get user's notifications"""
    try:
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 20))
        notification_type = request.GET.get('type')
        is_read = request.GET.get('read')
        
        notifications = Notification.objects.filter(user=request.user)
        
        # Apply filters
        if notification_type:
            notifications = notifications.filter(notification_type=notification_type)
        
        if is_read is not None:
            is_read_bool = is_read.lower() == 'true'
            notifications = notifications.filter(is_read=is_read_bool)
        
        # Exclude archived notifications unless specifically requested
        if not request.GET.get('include_archived'):
            notifications = notifications.filter(is_archived=False)
        
        # Pagination
        start = (page - 1) * limit
        end = start + limit
        notifications = notifications.order_by('-created_at')[start:end]
        
        notification_data = []
        for notification in notifications:
            notification_data.append({
                'id': notification.id,
                'type': notification.notification_type,
                'title': notification.title,
                'message': notification.message,
                'priority': notification.priority,
                'is_read': notification.is_read,
                'action_url': notification.action_url,
                'action_text': notification.action_text,
                'created_at': notification.created_at.isoformat(),
                'read_at': notification.read_at.isoformat() if notification.read_at else None
            })
        
        # Get unread count
        unread_count = Notification.objects.filter(
            user=request.user,
            is_read=False,
            is_archived=False
        ).count()
        
        return Response({
            'notifications': notification_data,
            'unread_count': unread_count,
            'page': page,
            'limit': limit
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request):
    """Mark notification as read"""
    try:
        notification_id = request.data.get('notification_id')
        
        if not notification_id:
            return Response({'error': 'Notification ID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            notification = Notification.objects.get(
                id=notification_id,
                user=request.user
            )
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
        
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        
        return Response({'message': 'Notification marked as read'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all notifications as read"""
    try:
        Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True, read_at=timezone.now())
        
        return Response({'message': 'All notifications marked as read'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def archive_notification(request):
    """Archive a notification"""
    try:
        notification_id = request.data.get('notification_id')
        
        if not notification_id:
            return Response({'error': 'Notification ID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            notification = Notification.objects.get(
                id=notification_id,
                user=request.user
            )
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
        
        notification.is_archived = True
        notification.save()
        
        return Response({'message': 'Notification archived'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notification_preferences(request):
    """Get user's notification preferences"""
    try:
        preferences, created = NotificationPreference.objects.get_or_create(user=request.user)
        
        return Response({
            'email_preferences': {
                'job_matches': preferences.email_job_matches,
                'application_updates': preferences.email_application_updates,
                'interviews': preferences.email_interviews,
                'credit_alerts': preferences.email_credit_alerts,
                'system_notifications': preferences.email_system_notifications,
                'promotions': preferences.email_promotions,
            },
            'in_app_preferences': {
                'job_matches': preferences.in_app_job_matches,
                'application_updates': preferences.in_app_application_updates,
                'interviews': preferences.in_app_interviews,
                'credit_alerts': preferences.in_app_credit_alerts,
                'system_notifications': preferences.in_app_system_notifications,
                'promotions': preferences.in_app_promotions,
            },
            'digest_frequency': preferences.digest_frequency
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_notification_preferences(request):
    """Update user's notification preferences"""
    try:
        preferences, created = NotificationPreference.objects.get_or_create(user=request.user)
        
        data = request.data
        
        # Update email preferences
        if 'email_preferences' in data:
            email_prefs = data['email_preferences']
            if 'job_matches' in email_prefs:
                preferences.email_job_matches = email_prefs['job_matches']
            if 'application_updates' in email_prefs:
                preferences.email_application_updates = email_prefs['application_updates']
            if 'interviews' in email_prefs:
                preferences.email_interviews = email_prefs['interviews']
            if 'credit_alerts' in email_prefs:
                preferences.email_credit_alerts = email_prefs['credit_alerts']
            if 'system_notifications' in email_prefs:
                preferences.email_system_notifications = email_prefs['system_notifications']
            if 'promotions' in email_prefs:
                preferences.email_promotions = email_prefs['promotions']
        
        # Update in-app preferences
        if 'in_app_preferences' in data:
            in_app_prefs = data['in_app_preferences']
            if 'job_matches' in in_app_prefs:
                preferences.in_app_job_matches = in_app_prefs['job_matches']
            if 'application_updates' in in_app_prefs:
                preferences.in_app_application_updates = in_app_prefs['application_updates']
            if 'interviews' in in_app_prefs:
                preferences.in_app_interviews = in_app_prefs['interviews']
            if 'credit_alerts' in in_app_prefs:
                preferences.in_app_credit_alerts = in_app_prefs['credit_alerts']
            if 'system_notifications' in in_app_prefs:
                preferences.in_app_system_notifications = in_app_prefs['system_notifications']
            if 'promotions' in in_app_prefs:
                preferences.in_app_promotions = in_app_prefs['promotions']
        
        # Update digest frequency
        if 'digest_frequency' in data:
            preferences.digest_frequency = data['digest_frequency']
        
        preferences.save()
        
        return Response({'message': 'Notification preferences updated'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notification_stats(request):
    """Get notification statistics"""
    try:
        # Get counts by type
        stats_by_type = Notification.objects.filter(
            user=request.user
        ).values('notification_type').annotate(
            total=Count('id'),
            unread=Count('id', filter=Q(is_read=False))
        ).order_by('-total')
        
        # Get recent activity
        recent_notifications = Notification.objects.filter(
            user=request.user
        ).order_by('-created_at')[:5]
        
        recent_data = []
        for notification in recent_notifications:
            recent_data.append({
                'id': notification.id,
                'type': notification.notification_type,
                'title': notification.title,
                'is_read': notification.is_read,
                'created_at': notification.created_at.isoformat()
            })
        
        return Response({
            'stats_by_type': list(stats_by_type),
            'recent_notifications': recent_data
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
