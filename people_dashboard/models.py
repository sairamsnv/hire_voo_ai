from django.db import models
from django.utils import timezone
import uuid


class Candidate(models.Model):
    """Candidate/Applicant information"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=100, unique=True, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True)
    
    # Professional info
    current_title = models.CharField(max_length=100, blank=True)
    current_company = models.CharField(max_length=100, blank=True)
    years_experience = models.IntegerField(null=True, blank=True)
    
    # Location
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    
    # Skills and preferences
    skills = models.JSONField(default=list)
    preferred_locations = models.JSONField(default=list)
    preferred_roles = models.JSONField(default=list)
    salary_expectation = models.CharField(max_length=100, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True, db_index=True)
    is_available = models.BooleanField(default=True, db_index=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'candidates'
        indexes = [
            models.Index(fields=['current_title']),
            models.Index(fields=['current_company']),
            models.Index(fields=['city', 'state', 'country']),
            models.Index(fields=['is_active', 'is_available']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def location_display(self):
        parts = [self.city, self.state, self.country]
        return ', '.join(filter(None, parts))


class Application(models.Model):
    """Job applications from candidates"""
    APPLICATION_STATUS = [
        ('applied', 'Applied'),
        ('reviewing', 'Reviewing'),
        ('shortlisted', 'Shortlisted'),
        ('interviewed', 'Interviewed'),
        ('offered', 'Offered'),
        ('hired', 'Hired'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='applications')
    job_id = models.CharField(max_length=100, db_index=True)
    job_title = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    
    # Application details
    status = models.CharField(max_length=20, choices=APPLICATION_STATUS, default='applied', db_index=True)
    applied_date = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_date = models.DateTimeField(auto_now=True)
    
    # Additional info
    cover_letter = models.TextField(blank=True)
    resume_url = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'applications'
        unique_together = ['candidate', 'job_id']
        indexes = [
            models.Index(fields=['job_id', 'status']),
            models.Index(fields=['applied_date']),
            models.Index(fields=['candidate', 'status']),
        ]
    
    def __str__(self):
        return f"{self.candidate.full_name} - {self.job_title}"


class CandidateSkill(models.Model):
    """Candidate skills with proficiency levels"""
    PROFICIENCY_LEVELS = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='candidate_skills')
    skill_name = models.CharField(max_length=100, db_index=True)
    proficiency = models.CharField(max_length=20, choices=PROFICIENCY_LEVELS, default='intermediate')
    years_experience = models.IntegerField(null=True, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'candidate_skills'
        unique_together = ['candidate', 'skill_name']
        indexes = [
            models.Index(fields=['skill_name', 'proficiency']),
        ]
    
    def __str__(self):
        return f"{self.candidate.full_name} - {self.skill_name} ({self.proficiency})"
