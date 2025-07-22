from django.db import models
from django.utils import timezone
import uuid


class Company(models.Model):
    """Company information"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, db_index=True)
    industry = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'companies'
        verbose_name_plural = 'Companies'
    
    def __str__(self):
        return self.name


class Job(models.Model):
    """Job posting information"""
    EMPLOYMENT_TYPES = [
        ('full_time', 'Full-time'),
        ('part_time', 'Part-time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('temporary', 'Temporary'),
        ('freelance', 'Freelance'),
    ]
    
    SENIORITY_LEVELS = [
        ('entry', 'Entry Level'),
        ('associate', 'Associate'),
        ('mid_senior', 'Mid-Senior Level'),
        ('senior', 'Senior Level'),
        ('lead', 'Lead'),
        ('executive', 'Executive'),
        ('director', 'Director'),
        ('vp', 'VP'),
        ('c_level', 'C-Level'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic job information
    title = models.CharField(max_length=255, db_index=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs')
    
    # Location
    city = models.CharField(max_length=100, blank=True, db_index=True)
    state = models.CharField(max_length=100, blank=True, db_index=True)
    country = models.CharField(max_length=100, blank=True, db_index=True)
    
    # Job details
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPES, blank=True)
    seniority_level = models.CharField(max_length=20, choices=SENIORITY_LEVELS, blank=True)
    job_function = models.CharField(max_length=100, blank=True, db_index=True)
    
    # Compensation
    salary_display = models.CharField(max_length=255, blank=True, null=True, help_text="Original salary text")
    
    # Timing
    posted_date = models.DateTimeField(null=True, blank=True, db_index=True)
    
    # URLs and external IDs
    job_url = models.URLField(unique=True, db_index=True)
    source_job_id = models.CharField(max_length=100, blank=True, db_index=True)
    
    # Job description
    description = models.TextField(blank=True)
    
    # Status
    is_active = models.BooleanField(default=True, db_index=True)
    is_remote = models.BooleanField(default=False, db_index=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'jobs'
        indexes = [
            models.Index(fields=['title', 'company']),
            models.Index(fields=['city', 'state', 'country']),
            models.Index(fields=['employment_type', 'seniority_level']),
            models.Index(fields=['job_function']),
            models.Index(fields=['posted_date']),
            models.Index(fields=['is_active', 'is_remote']),
        ]
        ordering = ['-posted_date', '-created_at']
    
    def __str__(self):
        return f"{self.title} at {self.company.name}"
    
    @property
    def location_display(self):
        parts = [self.city, self.state, self.country]
        return ', '.join(filter(None, parts))
    
    @property
    def salary_range(self):
        return self.salary_display if self.salary_display else "Not specified" 