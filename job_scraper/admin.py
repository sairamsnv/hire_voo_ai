from django.contrib import admin
from .models import Job, Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'industry', 'website', 'created_at']
    list_filter = ['industry', 'created_at']
    search_fields = ['name', 'industry']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'location_display', 'employment_type', 'seniority_level', 'is_active', 'created_at']
    list_filter = ['employment_type', 'seniority_level', 'is_active', 'is_remote', 'created_at', 'posted_date']
    search_fields = ['title', 'company__name', 'city', 'state', 'country', 'job_function']
    readonly_fields = ['id', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'company', 'job_url', 'source_job_id')
        }),
        ('Location', {
            'fields': ('city', 'state', 'country')
        }),
        ('Job Details', {
            'fields': ('employment_type', 'seniority_level', 'job_function', 'description')
        }),
        ('Compensation & Timing', {
            'fields': ('salary_display', 'posted_date')
        }),
        ('Status', {
            'fields': ('is_active', 'is_remote')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    ) 