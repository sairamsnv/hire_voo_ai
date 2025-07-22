from django.db import models
from django.utils import timezone
import uuid


class JobView(models.Model):
    """Job view tracking for analytics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_id = models.CharField(max_length=100, db_index=True)
    user_id = models.CharField(max_length=100, blank=True, null=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'job_views'
        indexes = [
            models.Index(fields=['job_id', 'viewed_at']),
            models.Index(fields=['user_id', 'viewed_at']),
        ]


class JobApplication(models.Model):
    """Job application tracking"""
    APPLICATION_STATUS = [
        ('applied', 'Applied'),
        ('viewed', 'Viewed'),
        ('shortlisted', 'Shortlisted'),
        ('interviewed', 'Interviewed'),
        ('hired', 'Hired'),
        ('rejected', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_id = models.CharField(max_length=100, db_index=True)
    user_id = models.CharField(max_length=100, db_index=True)
    status = models.CharField(max_length=20, choices=APPLICATION_STATUS, default='applied')
    applied_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'job_applications'
        unique_together = ['job_id', 'user_id']
        indexes = [
            models.Index(fields=['job_id', 'status']),
            models.Index(fields=['user_id', 'status']),
            models.Index(fields=['applied_at']),
        ]


class JobBookmark(models.Model):
    """Job bookmarks for users"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_id = models.CharField(max_length=100, db_index=True)
    user_id = models.CharField(max_length=100, db_index=True)
    bookmarked_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'job_bookmarks'
        unique_together = ['job_id', 'user_id']
        indexes = [
            models.Index(fields=['job_id', 'user_id']),
            models.Index(fields=['bookmarked_at']),
        ]


class JobSearch(models.Model):
    """Job search history"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=100, db_index=True)
    query = models.CharField(max_length=255, db_index=True)
    filters = models.JSONField(default=dict)
    results_count = models.IntegerField(default=0)
    searched_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'job_searches'
        indexes = [
            models.Index(fields=['user_id', 'searched_at']),
            models.Index(fields=['query']),
        ]
