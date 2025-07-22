from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.contrib.sessions.models import Session
import uuid
import secrets
import os
import base64
import qrcode
from io import BytesIO
from django.core.files.base import ContentFile


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        # Explicitly use default database for accounts
        user.save(using='default')
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


class UserSettings(models.Model):
    """User preferences and settings"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user_settings')
    
    # Appearance settings
    dark_mode = models.BooleanField(default=False)
    font_size = models.CharField(max_length=10, default='medium', choices=[
        ('small', 'Small'),
        ('medium', 'Medium'),
        ('large', 'Large'),
    ])
    
    # Notification settings
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    job_alerts = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=False)
    
    # Privacy & Security settings
    sound_enabled = models.BooleanField(default=True)
    auto_save = models.BooleanField(default=True)
    
    # Regional settings
    language = models.CharField(max_length=20, default='english', choices=[
        ('english', 'English'),
        ('spanish', 'Spanish'),
        ('french', 'French'),
        ('german', 'German'),
    ])
    currency = models.CharField(max_length=10, default='usd', choices=[
        ('usd', 'USD ($)'),
        ('eur', 'EUR (€)'),
        ('gbp', 'GBP (£)'),
        ('cad', 'CAD (C$)'),
    ])
    timezone = models.CharField(max_length=20, default='pst', choices=[
        ('pst', 'Pacific Time (PST)'),
        ('est', 'Eastern Time (EST)'),
        ('utc', 'UTC'),
        ('cet', 'Central European Time'),
    ])
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "User settings"

    def __str__(self):
        return f"Settings for {self.user.email}"


class UserPhoto(models.Model):
    """User profile photo upload model"""
    PHOTO_TYPES = [
        ('profile', 'Profile Photo'),
        ('cover', 'Cover Photo'),
        ('gallery', 'Gallery Photo'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='photos')
    photo_type = models.CharField(max_length=20, choices=PHOTO_TYPES, default='profile')
    image = models.ImageField(upload_to='user_photos/%Y/%m/%d/')
    caption = models.CharField(max_length=255, blank=True, null=True)
    is_primary = models.BooleanField(default=False, help_text="Primary photo for this type")
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    file_type = models.CharField(max_length=50, help_text="MIME type of the image")
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['user', 'photo_type']),
            models.Index(fields=['is_primary']),
            models.Index(fields=['uploaded_at']),
        ]
        unique_together = [['user', 'photo_type', 'is_primary']]

    def __str__(self):
        return f"{self.user.email} - {self.photo_type} photo"

    def save(self, *args, **kwargs):
        # If this photo is set as primary, unset other primary photos of the same type
        if self.is_primary:
            UserPhoto.objects.filter(
                user=self.user, 
                photo_type=self.photo_type, 
                is_primary=True
            ).exclude(id=self.id).update(is_primary=False)
        super().save(*args, **kwargs)

    @property
    def file_size_mb(self):
        """Return file size in MB"""
        return round(self.file_size / (1024 * 1024), 2)

    @property
    def image_url(self):
        """Return the URL of the image"""
        if self.image:
            return self.image.url
        return None
    
    def get_admin_image_preview(self):
        """Return HTML for admin image preview"""
        if self.image:
            return f'<img src="{self.image.url}" style="max-width: 100px; max-height: 100px;" />'
        return "No image"
    get_admin_image_preview.short_description = 'Image Preview'
    get_admin_image_preview.allow_tags = True

    def delete(self, *args, **kwargs):
        """Delete the image file from filesystem when deleting the record"""
        if self.image:
            # Delete the image file from storage
            if os.path.exists(self.image.path):
                os.remove(self.image.path)
        super().delete(*args, **kwargs)


class TwoFactorAuth(models.Model):
    """Two-Factor Authentication model for TOTP"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='two_factor_auth')
    secret_key = models.CharField(max_length=32, unique=True, help_text="TOTP secret key")
    is_enabled = models.BooleanField(default=False, help_text="Whether 2FA is enabled")
    backup_codes = models.JSONField(default=list, help_text="Backup codes for account recovery")
    qr_code = models.ImageField(upload_to='2fa_qr_codes/', null=True, blank=True, help_text="QR code for authenticator app")
    created_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Two-Factor Authentication"
        verbose_name_plural = "Two-Factor Authentication"

    def __str__(self):
        return f"2FA for {self.user.email}"

    def generate_secret_key(self):
        """Generate a new TOTP secret key"""
        return base64.b32encode(os.urandom(10)).decode('utf-8')

    def generate_backup_codes(self, count=8):
        """Generate backup codes for account recovery"""
        codes = []
        for _ in range(count):
            code = secrets.token_hex(4).upper()[:8]  # 8-character hex code
            codes.append(code)
        return codes

    def generate_qr_code(self):
        """Generate QR code for authenticator app"""
        if not self.secret_key:
            return None
        
        # Create TOTP URI
        totp_uri = f"otpauth://totp/HireVooAI:{self.user.email}?secret={self.secret_key}&issuer=HireVooAI"
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to Django ImageField
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        # Save to model
        filename = f"2fa_qr_{self.user.id}_{self.secret_key[:8]}.png"
        self.qr_code.save(filename, ContentFile(buffer.getvalue()), save=False)
        
        return self.qr_code

    def verify_totp(self, token):
        """Verify TOTP token"""
        try:
            import pyotp
            totp = pyotp.TOTP(self.secret_key)
            return totp.verify(token)
        except Exception:
            return False

    def verify_backup_code(self, code):
        """Verify backup code and remove it if valid"""
        if code in self.backup_codes:
            self.backup_codes.remove(code)
            self.save()
            return True
        return False

    def setup_2fa(self):
        """Setup 2FA for user"""
        if not self.secret_key:
            self.secret_key = self.generate_secret_key()
        
        if not self.backup_codes:
            self.backup_codes = self.generate_backup_codes()
        
        self.generate_qr_code()
        self.save()

    def enable_2fa(self):
        """Enable 2FA"""
        self.is_enabled = True
        self.save()

    def disable_2fa(self):
        """Disable 2FA"""
        self.is_enabled = False
        self.save()

    def get_totp_uri(self):
        """Get TOTP URI for authenticator apps"""
        if not self.secret_key:
            return None
        return f"otpauth://totp/HireVooAI:{self.user.email}?secret={self.secret_key}&issuer=HireVooAI"


class TwoFactorBackupCode(models.Model):
    """Backup codes for 2FA recovery"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='backup_codes')
    code = models.CharField(max_length=8, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Backup code for {self.user.email}"

    def use_code(self):
        """Mark backup code as used"""
        self.is_used = True
        self.used_at = timezone.now()
        self.save()
