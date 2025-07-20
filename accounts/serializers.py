from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, UserSession, SessionActivity, SessionSettings, APIKey, APIRequestLog, SecurityEvent


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            request = self.context.get('request')
            user = authenticate(request=request, username=email, password=password)
            if not user:
                raise serializers.ValidationError("Invalid credentials")
        else:
            raise serializers.ValidationError("Both email and password are required")

        data['user'] = user
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['full_name', 'email', 'password', 'bio', 'country', 'job_stream']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            full_name=validated_data.get('full_name'),
            bio=validated_data.get('bio', ''),
            country=validated_data.get('country', ''),
            job_stream=validated_data.get('job_stream', ''),
            password=validated_data['password']
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'email',
            'bio',
            'country',
            'job_stream',
            'is_staff',
            'is_superuser',
        ]


class UserSessionSerializer(serializers.ModelSerializer):
    """Serializer for user sessions"""
    device_info = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = UserSession
        fields = [
            'id', 'user', 'ip_address', 'device_type', 'browser', 'os', 'location',
            'is_active', 'created_at', 'last_activity', 'expires_at',
            'device_info', 'duration'
        ]
        read_only_fields = ['id', 'created_at', 'last_activity', 'expires_at']
    
    def get_device_info(self, obj):
        """Return formatted device information"""
        info_parts = []
        if obj.browser:
            info_parts.append(obj.browser)
        if obj.os:
            info_parts.append(obj.os)
        if obj.device_type:
            info_parts.append(obj.device_type.title())
        return ' • '.join(info_parts) if info_parts else 'Unknown Device'
    
    def get_duration(self, obj):
        """Calculate session duration"""
        from django.utils import timezone
        if obj.is_active:
            duration = timezone.now() - obj.created_at
        else:
            duration = obj.last_activity - obj.created_at
        
        days = duration.days
        hours = duration.seconds // 3600
        minutes = (duration.seconds % 3600) // 60
        
        if days > 0:
            return f"{days}d {hours}h {minutes}m"
        elif hours > 0:
            return f"{hours}h {minutes}m"
        else:
            return f"{minutes}m"


class SessionActivitySerializer(serializers.ModelSerializer):
    """Serializer for session activities"""
    activity_type_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = SessionActivity
        fields = [
            'id', 'activity_type', 'activity_type_display', 'description',
            'ip_address', 'created_at', 'time_ago', 'metadata'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_time_ago(self, obj):
        """Return human-readable time ago"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days != 1 else ''} ago"
        elif diff.seconds >= 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        elif diff.seconds >= 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        else:
            return "Just now"


class SessionSettingsSerializer(serializers.ModelSerializer):
    """Serializer for user session settings"""
    class Meta:
        model = SessionSettings
        fields = [
            'max_concurrent_sessions', 'session_timeout_hours',
            'require_reauth_for_sensitive_actions', 'notify_on_new_login',
            'auto_logout_on_inactivity', 'inactivity_timeout_minutes'
        ]
    
    def validate_max_concurrent_sessions(self, value):
        """Validate max concurrent sessions"""
        if value < 1:
            raise serializers.ValidationError("Must allow at least 1 concurrent session")
        if value > 20:
            raise serializers.ValidationError("Cannot exceed 20 concurrent sessions")
        return value
    
    def validate_session_timeout_hours(self, value):
        """Validate session timeout"""
        if value < 1:
            raise serializers.ValidationError("Session timeout must be at least 1 hour")
        if value > 8760:  # 1 year
            raise serializers.ValidationError("Session timeout cannot exceed 1 year")
        return value
    
    def validate_inactivity_timeout_minutes(self, value):
        """Validate inactivity timeout"""
        if value < 5:
            raise serializers.ValidationError("Inactivity timeout must be at least 5 minutes")
        if value > 1440:  # 24 hours
            raise serializers.ValidationError("Inactivity timeout cannot exceed 24 hours")
        return value


class SessionAnalyticsSerializer(serializers.Serializer):
    """Serializer for session analytics data"""
    total_sessions = serializers.IntegerField()
    active_sessions = serializers.IntegerField()
    total_logins = serializers.IntegerField()
    avg_session_duration = serializers.FloatField()
    device_distribution = serializers.DictField()
    browser_distribution = serializers.DictField()
    recent_activities = SessionActivitySerializer(many=True)
    session_timeline = serializers.ListField()


class APIKeySerializer(serializers.ModelSerializer):
    """Serializer for API Key management"""
    permissions = serializers.SerializerMethodField()
    is_expired = serializers.ReadOnlyField()
    
    class Meta:
        model = APIKey
        fields = [
            'id', 'name', 'key', 'key_type', 'is_active', 'last_used', 
            'created_at', 'expires_at', 'permissions', 'is_expired',
            'can_read_sessions', 'can_write_sessions', 'can_read_analytics',
            'can_write_analytics', 'can_admin_users'
        ]
        read_only_fields = ['id', 'key', 'last_used', 'created_at', 'is_expired']
    
    def get_permissions(self, obj):
        return obj.get_permissions()
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class APIKeyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new API keys"""
    
    class Meta:
        model = APIKey
        fields = [
            'name', 'key_type', 'expires_at', 'can_read_sessions', 
            'can_write_sessions', 'can_read_analytics', 'can_write_analytics', 
            'can_admin_users'
        ]
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class APIRequestLogSerializer(serializers.ModelSerializer):
    """Serializer for API request logs"""
    api_key_name = serializers.CharField(source='api_key.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = APIRequestLog
        fields = [
            'id', 'api_key', 'api_key_name', 'user', 'user_email', 'endpoint',
            'method', 'status_code', 'response_time', 'ip_address', 'user_agent',
            'request_size', 'response_size', 'error_message', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SecurityEventSerializer(serializers.ModelSerializer):
    """Serializer for security events"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    api_key_name = serializers.CharField(source='api_key.name', read_only=True)
    resolved_by_email = serializers.CharField(source='resolved_by.email', read_only=True)
    
    class Meta:
        model = SecurityEvent
        fields = [
            'id', 'event_type', 'severity', 'description', 'ip_address',
            'user_agent', 'user', 'user_email', 'api_key', 'api_key_name',
            'request_data', 'resolved', 'resolved_at', 'resolved_by',
            'resolved_by_email', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'resolved_at', 'resolved_by_email']


class SecurityEventResolveSerializer(serializers.Serializer):
    """Serializer for resolving security events"""
    resolved = serializers.BooleanField(default=True)
    resolution_notes = serializers.CharField(required=False, allow_blank=True)


class APIKeyUsageSerializer(serializers.Serializer):
    """Serializer for API key usage statistics"""
    api_key_id = serializers.UUIDField()
    api_key_name = serializers.CharField()
    total_requests = serializers.IntegerField()
    successful_requests = serializers.IntegerField()
    failed_requests = serializers.IntegerField()
    avg_response_time = serializers.FloatField()
    last_used = serializers.DateTimeField()
    top_endpoints = serializers.ListField(child=serializers.DictField())


class SecurityDashboardSerializer(serializers.Serializer):
    """Serializer for security dashboard data"""
    total_events = serializers.IntegerField()
    events_by_severity = serializers.DictField()
    events_by_type = serializers.DictField()
    recent_events = SecurityEventSerializer(many=True)
    top_threat_ips = serializers.ListField(child=serializers.DictField())
    api_key_usage = APIKeyUsageSerializer(many=True)


class UserManagementSerializer(serializers.ModelSerializer):
    """Serializer for user management - admin view of users"""
    total_sessions = serializers.SerializerMethodField()
    active_sessions = serializers.SerializerMethodField()
    last_login = serializers.SerializerMethodField()
    account_age = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'is_active', 'is_staff', 'is_superuser',
            'last_login', 'total_sessions', 'active_sessions',
            'account_age', 'status', 'bio', 'country', 'job_stream'
        ]
        read_only_fields = ['id', 'last_login']
    
    def get_total_sessions(self, obj):
        """Get total number of sessions for user"""
        from .models import UserSession
        return UserSession.objects.filter(user=obj).count()
    
    def get_active_sessions(self, obj):
        """Get number of active sessions for user"""
        from .models import UserSession
        from django.utils import timezone
        return UserSession.objects.filter(
            user=obj, 
            is_active=True, 
            expires_at__gt=timezone.now()
        ).count()
    
    def get_last_login(self, obj):
        """Get formatted last login time"""
        if obj.last_login:
            from django.utils import timezone
            now = timezone.now()
            diff = now - obj.last_login
            
            if diff.days > 0:
                return f"{diff.days} day{'s' if diff.days != 1 else ''} ago"
            elif diff.seconds >= 3600:
                hours = diff.seconds // 3600
                return f"{hours} hour{'s' if hours != 1 else ''} ago"
            elif diff.seconds >= 60:
                minutes = diff.seconds // 60
                return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
            else:
                return "Just now"
        return "Never"
    
    def get_account_age(self, obj):
        """Get account age in days"""
        # Since we don't have date_joined, we'll use a placeholder
        # In a real implementation, you'd want to add date_joined field to User model
        return "N/A"  # Placeholder - would need date_joined field for accurate data
    
    def get_status(self, obj):
        """Get user status"""
        if not obj.is_active:
            return "Inactive"
        elif obj.is_superuser:
            return "Super Admin"
        elif obj.is_staff:
            return "Admin"
        else:
            return "Active"


class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for individual user management"""
    sessions = UserSessionSerializer(many=True, read_only=True)
    security_events = SecurityEventSerializer(many=True, read_only=True)
    api_keys = APIKeySerializer(many=True, read_only=True)
    recent_activities = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'is_active', 'is_staff', 'is_superuser',
            'last_login', 'bio', 'country', 'job_stream',
            'sessions', 'security_events', 'api_keys', 'recent_activities'
        ]
        read_only_fields = ['id', 'last_login']
    
    def get_recent_activities(self, obj):
        """Get recent activities for user"""
        from .models import SessionActivity
        activities = SessionActivity.objects.filter(
            user_session__user=obj
        ).order_by('-created_at')[:10]
        return SessionActivitySerializer(activities, many=True).data



