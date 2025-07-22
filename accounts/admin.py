from django.contrib import admin
from .models import User, UserSession, SessionActivity, SessionSettings, APIKey, APIRequestLog, SecurityEvent, UserPhoto


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'full_name', 'is_active', 'is_staff']
    list_filter = ['is_active', 'is_staff']
    search_fields = ['email', 'full_name']
    ordering = ['email']
    readonly_fields = ['last_login']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('email', 'full_name', 'bio', 'country', 'job_stream')
        }),
        ('Status', {
            'fields': ('is_active', 'is_staff', 'is_superuser')
        }),
        ('Important Dates', {
            'fields': ('last_login',),
            'classes': ('collapse',)
        }),
        ('Permissions', {
            'fields': ('groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
    )


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'key_type', 'is_active', 'last_used', 'created_at', 'is_expired']
    list_filter = ['key_type', 'is_active', 'created_at', 'last_used']
    search_fields = ['name', 'user__email', 'key']
    ordering = ['-created_at']
    readonly_fields = ['id', 'key', 'created_at', 'last_used', 'is_expired']
    
    fieldsets = (
        ('Key Information', {
            'fields': ('id', 'name', 'key', 'key_type', 'is_active')
        }),
        ('User', {
            'fields': ('user',)
        }),
        ('Permissions', {
            'fields': ('can_read_sessions', 'can_write_sessions', 'can_read_analytics', 
                      'can_write_analytics', 'can_admin_users'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'last_used', 'expires_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
    
    def has_add_permission(self, request):
        return False  # API keys should be created through the application


@admin.register(APIRequestLog)
class APIRequestLogAdmin(admin.ModelAdmin):
    list_display = ['endpoint', 'method', 'status_code', 'user', 'api_key', 'response_time', 'created_at']
    list_filter = ['method', 'status_code', 'created_at']
    search_fields = ['endpoint', 'user__email', 'api_key__name', 'ip_address']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at']
    
    fieldsets = (
        ('Request Information', {
            'fields': ('id', 'endpoint', 'method', 'status_code', 'response_time')
        }),
        ('User & API Key', {
            'fields': ('user', 'api_key')
        }),
        ('Request Details', {
            'fields': ('ip_address', 'user_agent', 'request_size', 'response_size')
        }),
        ('Error Information', {
            'fields': ('error_message',),
            'classes': ('collapse',)
        }),
        ('Timestamp', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'api_key')
    
    def has_add_permission(self, request):
        return False  # Logs should only be created through the application


@admin.register(SecurityEvent)
class SecurityEventAdmin(admin.ModelAdmin):
    list_display = ['event_type', 'severity', 'ip_address', 'user', 'resolved', 'created_at']
    list_filter = ['event_type', 'severity', 'resolved', 'created_at']
    search_fields = ['description', 'ip_address', 'user__email', 'api_key__name']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'resolved_at']
    
    fieldsets = (
        ('Event Information', {
            'fields': ('id', 'event_type', 'severity', 'description', 'resolved')
        }),
        ('User & API Key', {
            'fields': ('user', 'api_key')
        }),
        ('Request Details', {
            'fields': ('ip_address', 'user_agent', 'request_data')
        }),
        ('Resolution', {
            'fields': ('resolved_at', 'resolved_by'),
            'classes': ('collapse',)
        }),
        ('Timestamp', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'api_key', 'resolved_by')
    
    def has_add_permission(self, request):
        return False  # Events should only be created through the application


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'ip_address', 'device_type', 'browser', 'is_active', 'created_at', 'last_activity']
    list_filter = ['is_active', 'device_type', 'created_at', 'last_activity']
    search_fields = ['user__email', 'user__full_name', 'ip_address']
    ordering = ['-last_activity']
    readonly_fields = ['id', 'created_at', 'last_activity', 'expires_at']
    
    fieldsets = (
        ('Session Information', {
            'fields': ('id', 'user', 'session_key', 'is_active')
        }),
        ('Device Information', {
            'fields': ('ip_address', 'user_agent', 'device_type', 'browser', 'os', 'location')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'last_activity', 'expires_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
    
    def has_add_permission(self, request):
        return False  # Sessions should only be created through the application


@admin.register(SessionActivity)
class SessionActivityAdmin(admin.ModelAdmin):
    list_display = ['user_session', 'activity_type', 'ip_address', 'created_at', 'time_ago_display']
    list_filter = ['activity_type', 'created_at']
    search_fields = ['user_session__user__email', 'description', 'ip_address']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at']
    
    fieldsets = (
        ('Activity Information', {
            'fields': ('id', 'user_session', 'activity_type', 'description')
        }),
        ('Request Information', {
            'fields': ('ip_address', 'user_agent', 'metadata')
        }),
        ('Timestamp', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user_session__user')
    
    def time_ago_display(self, obj):
        return obj.time_ago
    time_ago_display.short_description = 'Time Ago'
    
    def has_add_permission(self, request):
        return False  # Activities should only be created through the application


@admin.register(SessionSettings)
class SessionSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'max_concurrent_sessions', 'session_timeout_hours', 'auto_logout_on_inactivity']
    list_filter = ['auto_logout_on_inactivity', 'notify_on_new_login', 'require_reauth_for_sensitive_actions']
    search_fields = ['user__email', 'user__full_name']
    ordering = ['user__email']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Session Limits', {
            'fields': ('max_concurrent_sessions', 'session_timeout_hours')
        }),
        ('Security Settings', {
            'fields': ('require_reauth_for_sensitive_actions', 'notify_on_new_login')
        }),
        ('Auto Logout', {
            'fields': ('auto_logout_on_inactivity', 'inactivity_timeout_minutes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(UserPhoto)
class UserPhotoAdmin(admin.ModelAdmin):
    list_display = ['user', 'photo_type', 'is_primary', 'file_size_mb', 'uploaded_at', 'admin_image_preview']
    list_filter = ['photo_type', 'is_primary', 'uploaded_at']
    search_fields = ['user__email', 'user__full_name', 'caption']
    ordering = ['-uploaded_at']
    readonly_fields = ['id', 'file_size_mb', 'uploaded_at', 'updated_at', 'admin_image_preview']
    
    fieldsets = (
        ('Photo Information', {
            'fields': ('id', 'user', 'photo_type', 'image', 'admin_image_preview', 'caption', 'is_primary')
        }),
        ('File Details', {
            'fields': ('file_size', 'file_size_mb', 'file_type', 'width', 'height')
        }),
        ('Timestamps', {
            'fields': ('uploaded_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
    
    def has_add_permission(self, request):
        return False  # Photos should be uploaded through the application
    
    def admin_image_preview(self, obj):
        return obj.get_admin_image_preview()
    admin_image_preview.short_description = 'Preview'
    admin_image_preview.allow_tags = True
