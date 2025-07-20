from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.contrib.sessions.models import Session
import uuid
import secrets


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    pending_email = models.EmailField(null=True, blank=True)
    full_name = models.CharField(max_length=255)
    bio = models.TextField(blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    job_stream = models.CharField(max_length=100, blank=True, null=True)

    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)  # Add premium status


    groups = models.ManyToManyField(
        'auth.Group',
        related_name='user_groups',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='user_permissions_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions'
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return self.email


class APIKey(models.Model):
    """API Key model for external integrations"""
    KEY_TYPES = [
        ('read', 'Read Only'),
        ('write', 'Read/Write'),
        ('admin', 'Admin'),
        ('webhook', 'Webhook'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_keys')
    name = models.CharField(max_length=100, help_text="Name for this API key")
    key = models.CharField(max_length=64, unique=True, db_index=True)
    key_type = models.CharField(max_length=20, choices=KEY_TYPES, default='read')
    is_active = models.BooleanField(default=True)
    last_used = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Permissions
    can_read_sessions = models.BooleanField(default=False)
    can_write_sessions = models.BooleanField(default=False)
    can_read_analytics = models.BooleanField(default=False)
    can_write_analytics = models.BooleanField(default=False)
    can_admin_users = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['key']),
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.name} ({self.key_type})"

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self._generate_key()
        super().save(*args, **kwargs)

    def _generate_key(self):
        """Generate a secure API key"""
        return secrets.token_urlsafe(32)

    @property
    def is_expired(self):
        if not self.expires_at:
            return False
        return timezone.now() > self.expires_at

    def update_last_used(self):
        """Update last used timestamp"""
        self.last_used = timezone.now()
        self.save(update_fields=['last_used'])

    def get_permissions(self):
        """Get list of permissions for this key"""
        permissions = []
        if self.can_read_sessions:
            permissions.append('read_sessions')
        if self.can_write_sessions:
            permissions.append('write_sessions')
        if self.can_read_analytics:
            permissions.append('read_analytics')
        if self.can_write_analytics:
            permissions.append('write_analytics')
        if self.can_admin_users:
            permissions.append('admin_users')
        return permissions


class APIRequestLog(models.Model):
    """Log of API requests for monitoring and analytics"""
    REQUEST_METHODS = [
        ('GET', 'GET'),
        ('POST', 'POST'),
        ('PUT', 'PUT'),
        ('PATCH', 'PATCH'),
        ('DELETE', 'DELETE'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    api_key = models.ForeignKey(APIKey, on_delete=models.SET_NULL, null=True, blank=True, related_name='requests')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='api_requests')
    endpoint = models.CharField(max_length=200)
    method = models.CharField(max_length=10, choices=REQUEST_METHODS)
    status_code = models.IntegerField()
    response_time = models.FloatField(help_text="Response time in seconds")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    request_size = models.IntegerField(default=0, help_text="Request size in bytes")
    response_size = models.IntegerField(default=0, help_text="Response size in bytes")
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['api_key', 'created_at']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['status_code']),
            models.Index(fields=['endpoint']),
        ]

    def __str__(self):
        return f"{self.method} {self.endpoint} - {self.status_code}"


class SecurityEvent(models.Model):
    """Security events and threats detected"""
    EVENT_TYPES = [
        ('rate_limit_exceeded', 'Rate Limit Exceeded'),
        ('suspicious_activity', 'Suspicious Activity'),
        ('sql_injection', 'SQL Injection Attempt'),
        ('xss_attempt', 'XSS Attempt'),
        ('path_traversal', 'Path Traversal Attempt'),
        ('invalid_api_key', 'Invalid API Key'),
        ('unauthorized_access', 'Unauthorized Access'),
        ('malicious_user_agent', 'Malicious User Agent'),
        ('large_request', 'Large Request'),
        ('multiple_failures', 'Multiple Failures'),
    ]
    
    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS, default='medium')
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='security_events')
    api_key = models.ForeignKey(APIKey, on_delete=models.SET_NULL, null=True, blank=True, related_name='security_events')
    request_data = models.JSONField(default=dict, blank=True)
    resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_events')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event_type', 'created_at']),
            models.Index(fields=['severity', 'created_at']),
            models.Index(fields=['ip_address', 'created_at']),
            models.Index(fields=['resolved']),
        ]

    def __str__(self):
        return f"{self.event_type} - {self.severity} - {self.ip_address}"

    def resolve(self, resolved_by_user=None):
        """Mark event as resolved"""
        self.resolved = True
        self.resolved_at = timezone.now()
        if resolved_by_user:
            self.resolved_by = resolved_by_user
        self.save()


class UserSession(models.Model):
    """Extended session model for tracking user sessions with device info"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=40, unique=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    device_type = models.CharField(max_length=20, blank=True)  # mobile, desktop, tablet
    browser = models.CharField(max_length=50, blank=True)
    os = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['last_activity']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.ip_address} ({self.device_type})"

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    def refresh_activity(self):
        """Update last activity timestamp"""
        self.last_activity = timezone.now()
        self.save(update_fields=['last_activity'])


class SessionActivity(models.Model):
    """Track individual session activities for analytics"""
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('page_view', 'Page View'),
        ('api_call', 'API Call'),
        ('password_change', 'Password Change'),
        ('email_change', 'Email Change'),
        ('profile_update', 'Profile Update'),
        ('session_expired', 'Session Expired'),
        ('forced_logout', 'Forced Logout'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_session = models.ForeignKey(UserSession, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)  # Store additional data
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user_session', 'activity_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user_session.user.email} - {self.activity_type}"


class SessionSettings(models.Model):
    """User-specific session settings"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='session_settings')
    max_concurrent_sessions = models.PositiveIntegerField(default=5)
    session_timeout_hours = models.PositiveIntegerField(default=336)  # 2 weeks default
    require_reauth_for_sensitive_actions = models.BooleanField(default=True)
    notify_on_new_login = models.BooleanField(default=True)
    auto_logout_on_inactivity = models.BooleanField(default=True)
    inactivity_timeout_minutes = models.PositiveIntegerField(default=30)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Session settings"

    def __str__(self):
        return f"Session settings for {self.user.email}"
