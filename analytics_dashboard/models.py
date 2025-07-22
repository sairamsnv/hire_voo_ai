from django.db import models
from django.utils import timezone
import uuid


class AnalyticsEvent(models.Model):
    """Analytics events tracking"""
    EVENT_TYPES = [
        ('job_view', 'Job View'),
        ('job_apply', 'Job Application'),
        ('job_bookmark', 'Job Bookmark'),
        ('search', 'Search'),
        ('filter', 'Filter'),
        ('user_signup', 'User Signup'),
        ('user_login', 'User Login'),
        ('page_view', 'Page View'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES, db_index=True)
    user_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    session_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    
    # Event data
    event_data = models.JSONField(default=dict)
    page_url = models.URLField(blank=True)
    referrer = models.URLField(blank=True)
    
    # User context
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    device_type = models.CharField(max_length=20, blank=True)  # mobile, desktop, tablet
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'analytics_events'
        indexes = [
            models.Index(fields=['event_type', 'created_at']),
            models.Index(fields=['user_id', 'created_at']),
            models.Index(fields=['session_id', 'created_at']),
        ]


class DailyMetrics(models.Model):
    """Daily aggregated metrics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField(unique=True, db_index=True)
    
    # Job metrics
    total_jobs = models.IntegerField(default=0)
    new_jobs = models.IntegerField(default=0)
    active_jobs = models.IntegerField(default=0)
    
    # User metrics
    total_users = models.IntegerField(default=0)
    new_users = models.IntegerField(default=0)
    active_users = models.IntegerField(default=0)
    
    # Application metrics
    total_applications = models.IntegerField(default=0)
    new_applications = models.IntegerField(default=0)
    
    # Engagement metrics
    job_views = models.IntegerField(default=0)
    job_bookmarks = models.IntegerField(default=0)
    searches = models.IntegerField(default=0)
    
    # Top data
    top_keywords = models.JSONField(default=list)
    top_locations = models.JSONField(default=list)
    top_companies = models.JSONField(default=list)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'daily_metrics'
        indexes = [
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"Metrics for {self.date}"


class UserActivity(models.Model):
    """User activity tracking"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=100, db_index=True)
    date = models.DateField(db_index=True)
    
    # Activity counts
    job_views = models.IntegerField(default=0)
    job_applications = models.IntegerField(default=0)
    job_bookmarks = models.IntegerField(default=0)
    searches = models.IntegerField(default=0)
    
    # Session data
    sessions_count = models.IntegerField(default=0)
    total_session_time = models.IntegerField(default=0)  # in seconds
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_activity'
        unique_together = ['user_id', 'date']
        indexes = [
            models.Index(fields=['user_id', 'date']),
        ]
    
    def __str__(self):
        return f"Activity for user {self.user_id} on {self.date}"


class SearchAnalytics(models.Model):
    """Search analytics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    query = models.CharField(max_length=255, db_index=True)
    date = models.DateField(db_index=True)
    
    # Search metrics
    search_count = models.IntegerField(default=0)
    results_count = models.IntegerField(default=0)
    click_count = models.IntegerField(default=0)
    
    # User metrics
    unique_users = models.IntegerField(default=0)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'search_analytics'
        unique_together = ['query', 'date']
        indexes = [
            models.Index(fields=['query', 'date']),
        ]
    
    def __str__(self):
        return f"Search analytics for '{self.query}' on {self.date}"
