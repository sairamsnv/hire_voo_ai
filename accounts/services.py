import re
from django.utils import timezone
from django.contrib.sessions.models import Session
from django.db.models import Count, Avg, Q
from datetime import timedelta
from .models import UserSession, SessionActivity, SessionSettings

try:
    import user_agents
    USER_AGENTS_AVAILABLE = True
except ImportError:
    USER_AGENTS_AVAILABLE = False


class SessionManagementService:
    """Service class for managing user sessions"""
    
    @staticmethod
    def get_client_ip(request):
        """Extract client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    @staticmethod
    def parse_user_agent(user_agent_string):
        """Parse user agent string to extract device information"""
        if not user_agent_string:
            return {
                'device_type': 'unknown',
                'browser': 'unknown',
                'os': 'unknown'
            }
        
        if not USER_AGENTS_AVAILABLE:
            # Fallback parsing without user-agents library
            user_agent_lower = user_agent_string.lower()
            
            # Determine device type
            if 'mobile' in user_agent_lower or 'android' in user_agent_lower or 'iphone' in user_agent_lower:
                device_type = 'mobile'
            elif 'tablet' in user_agent_lower or 'ipad' in user_agent_lower:
                device_type = 'tablet'
            else:
                device_type = 'desktop'
            
            # Simple browser detection
            if 'chrome' in user_agent_lower:
                browser = 'Chrome'
            elif 'firefox' in user_agent_lower:
                browser = 'Firefox'
            elif 'safari' in user_agent_lower:
                browser = 'Safari'
            elif 'edge' in user_agent_lower:
                browser = 'Edge'
            else:
                browser = 'Unknown Browser'
            
            # Simple OS detection
            if 'windows' in user_agent_lower:
                os = 'Windows'
            elif 'mac' in user_agent_lower:
                os = 'macOS'
            elif 'linux' in user_agent_lower:
                os = 'Linux'
            elif 'android' in user_agent_lower:
                os = 'Android'
            elif 'iphone' in user_agent_lower or 'ipad' in user_agent_lower:
                os = 'iOS'
            else:
                os = 'Unknown OS'
            
            return {
                'device_type': device_type,
                'browser': browser,
                'os': os
            }
        
        try:
            ua = user_agents.parse(user_agent_string)
            
            # Determine device type
            if ua.is_mobile:
                device_type = 'mobile'
            elif ua.is_tablet:
                device_type = 'tablet'
            else:
                device_type = 'desktop'
            
            # Get browser info
            browser = f"{ua.browser.family} {ua.browser.version_string}" if ua.browser.family else 'unknown'
            
            # Get OS info
            os = f"{ua.os.family} {ua.os.version_string}" if ua.os.family else 'unknown'
            
            return {
                'device_type': device_type,
                'browser': browser,
                'os': os
            }
        except Exception:
            return {
                'device_type': 'unknown',
                'browser': 'unknown',
                'os': 'unknown'
            }
    
    @staticmethod
    def create_user_session(request, user, session_key):
        """Create a new user session with device tracking"""
        # Get or create session settings
        settings, created = SessionSettings.objects.get_or_create(user=user)
        
        # Check concurrent session limit
        active_sessions = UserSession.objects.filter(
            user=user, 
            is_active=True
        ).count()
        
        if active_sessions >= settings.max_concurrent_sessions:
            # Terminate oldest session
            oldest_session = UserSession.objects.filter(
                user=user, 
                is_active=True
            ).order_by('created_at').first()
            if oldest_session:
                SessionManagementService.terminate_session(oldest_session, 'concurrent_limit')
        
        # Parse device information
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        device_info = SessionManagementService.parse_user_agent(user_agent)
        
        # Calculate expiry time
        expires_at = timezone.now() + timedelta(hours=settings.session_timeout_hours)
        
        # Create session
        user_session = UserSession.objects.create(
            user=user,
            session_key=session_key,
            ip_address=SessionManagementService.get_client_ip(request),
            user_agent=user_agent,
            device_type=device_info['device_type'],
            browser=device_info['browser'],
            os=device_info['os'],
            expires_at=expires_at
        )
        
        # Log activity
        SessionActivity.objects.create(
            user_session=user_session,
            activity_type='login',
            description=f'Login from {device_info["device_type"]} device',
            ip_address=SessionManagementService.get_client_ip(request),
            user_agent=user_agent,
            metadata={'device_info': device_info}
        )
        
        return user_session
    
    @staticmethod
    def terminate_session(user_session, reason='logout'):
        """Terminate a user session"""
        user_session.is_active = False
        user_session.save()
        
        # Log activity
        SessionActivity.objects.create(
            user_session=user_session,
            activity_type='logout',
            description=f'Session terminated: {reason}',
            ip_address=user_session.ip_address,
            user_agent=user_session.user_agent,
            metadata={'reason': reason}
        )
    
    @staticmethod
    def refresh_session_activity(user_session):
        """Refresh session activity timestamp"""
        user_session.refresh_activity()
        
        # Log activity if it's been more than 5 minutes
        last_activity = SessionActivity.objects.filter(
            user_session=user_session,
            activity_type='api_call'
        ).order_by('-created_at').first()
        
        if not last_activity or (timezone.now() - last_activity.created_at).seconds > 300:
            SessionActivity.objects.create(
                user_session=user_session,
                activity_type='api_call',
                description='API activity',
                ip_address=user_session.ip_address,
                user_agent=user_session.user_agent
            )
    
    @staticmethod
    def cleanup_expired_sessions():
        """Clean up expired sessions"""
        expired_sessions = UserSession.objects.filter(
            is_active=True,
            expires_at__lt=timezone.now()
        )
        
        for session in expired_sessions:
            SessionManagementService.terminate_session(session, 'expired')
    
    @staticmethod
    def get_user_sessions(user, include_inactive=False):
        """Get all sessions for a user"""
        queryset = UserSession.objects.filter(user=user)
        if not include_inactive:
            queryset = queryset.filter(is_active=True)
        return queryset.order_by('-last_activity')
    
    @staticmethod
    def get_session_analytics(user, days=30):
        """Get session analytics for a user"""
        start_date = timezone.now() - timedelta(days=days)
        
        # Get sessions in date range
        sessions = UserSession.objects.filter(
            user=user,
            created_at__gte=start_date
        )
        
        # Get activities in date range
        activities = SessionActivity.objects.filter(
            user_session__user=user,
            created_at__gte=start_date
        )
        
        # Calculate analytics
        total_sessions = sessions.count()
        active_sessions = sessions.filter(is_active=True).count()
        total_logins = activities.filter(activity_type='login').count()
        
        # Average session duration
        completed_sessions = sessions.filter(is_active=False)
        if completed_sessions.exists():
            # Calculate average duration manually
            total_duration = timedelta()
            count = 0
            for session in completed_sessions:
                duration = session.last_activity - session.created_at
                total_duration += duration
                count += 1
            avg_duration_hours = total_duration.total_seconds() / 3600 / count if count > 0 else 0
        else:
            avg_duration_hours = 0
        
        # Device distribution
        device_distribution = sessions.values('device_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Browser distribution
        browser_distribution = sessions.values('browser').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Recent activities
        recent_activities = activities.order_by('-created_at')[:10]
        
        # Session timeline (daily counts)
        session_timeline = []
        for i in range(days):
            date = start_date + timedelta(days=i)
            count = sessions.filter(
                created_at__date=date.date()
            ).count()
            session_timeline.append({
                'date': date.strftime('%Y-%m-%d'),
                'count': count
            })
        
        return {
            'total_sessions': total_sessions,
            'active_sessions': active_sessions,
            'total_logins': total_logins,
            'avg_session_duration': avg_duration_hours,
            'device_distribution': {item['device_type']: item['count'] for item in device_distribution},
            'browser_distribution': {item['browser']: item['count'] for item in browser_distribution},
            'recent_activities': recent_activities,
            'session_timeline': session_timeline
        }
    
    @staticmethod
    def force_logout_all_sessions(user, reason='admin_action'):
        """Force logout all sessions for a user"""
        active_sessions = UserSession.objects.filter(user=user, is_active=True)
        
        for session in active_sessions:
            SessionManagementService.terminate_session(session, reason)
        
        return active_sessions.count()
    
    @staticmethod
    def force_logout_session_by_id(session_id, reason='admin_action'):
        """Force logout a specific session"""
        try:
            session = UserSession.objects.get(id=session_id)
            SessionManagementService.terminate_session(session, reason)
            return True
        except UserSession.DoesNotExist:
            return False
    
    @staticmethod
    def get_session_by_key(session_key):
        """Get user session by session key"""
        try:
            return UserSession.objects.get(session_key=session_key)
        except UserSession.DoesNotExist:
            return None
    
    @staticmethod
    def log_activity(user_session, activity_type, description='', metadata=None):
        """Log a session activity"""
        return SessionActivity.objects.create(
            user_session=user_session,
            activity_type=activity_type,
            description=description,
            ip_address=user_session.ip_address,
            user_agent=user_session.user_agent,
            metadata=metadata or {}
        ) 