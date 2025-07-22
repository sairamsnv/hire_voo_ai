from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Notification(models.Model):
    """User notifications"""
    NOTIFICATION_TYPES = [
        ('job_match', 'Job Match'),
        ('application_update', 'Application Update'),
        ('interview', 'Interview'),
        ('credit_low', 'Credit Low'),
        ('system', 'System'),
        ('promotion', 'Promotion'),
        ('reminder', 'Reminder'),
    ]

    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    is_read = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    action_url = models.URLField(blank=True)  # URL to navigate to when clicked
    action_text = models.CharField(max_length=100, blank=True)  # Text for action button
    metadata = models.JSONField(default=dict, blank=True)  # Store additional notification data
    scheduled_at = models.DateTimeField(null=True, blank=True)  # For scheduled notifications
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.title}"

class NotificationTemplate(models.Model):
    """Templates for different types of notifications"""
    name = models.CharField(max_length=100)
    notification_type = models.CharField(max_length=20, choices=Notification.NOTIFICATION_TYPES)
    title_template = models.CharField(max_length=255)
    message_template = models.TextField()
    priority = models.CharField(max_length=10, choices=Notification.PRIORITY_LEVELS, default='medium')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.notification_type})"

class NotificationPreference(models.Model):
    """User's notification preferences"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Email preferences
    email_job_matches = models.BooleanField(default=True)
    email_application_updates = models.BooleanField(default=True)
    email_interviews = models.BooleanField(default=True)
    email_credit_alerts = models.BooleanField(default=True)
    email_system_notifications = models.BooleanField(default=True)
    email_promotions = models.BooleanField(default=True)
    
    # In-app preferences
    in_app_job_matches = models.BooleanField(default=True)
    in_app_application_updates = models.BooleanField(default=True)
    in_app_interviews = models.BooleanField(default=True)
    in_app_credit_alerts = models.BooleanField(default=True)
    in_app_system_notifications = models.BooleanField(default=True)
    in_app_promotions = models.BooleanField(default=True)
    
    # Frequency preferences
    digest_frequency = models.CharField(
        max_length=20,
        choices=[
            ('immediate', 'Immediate'),
            ('hourly', 'Hourly'),
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
        ],
        default='immediate'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} notification preferences"

class NotificationLog(models.Model):
    """Log of notification delivery attempts"""
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='delivery_logs')
    delivery_method = models.CharField(max_length=20, choices=[
        ('email', 'Email'),
        ('in_app', 'In-App'),
        ('push', 'Push'),
    ])
    status = models.CharField(max_length=20, choices=[
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
        ('bounced', 'Bounced'),
    ])
    error_message = models.TextField(blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.notification.title} - {self.delivery_method} ({self.status})"
