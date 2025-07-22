from django.contrib import admin
from .models import Candidate, Application, CandidateSkill


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'current_title', 'current_company', 'location_display', 'is_active', 'is_available']
    list_filter = ['is_active', 'is_available', 'years_experience', 'country']
    search_fields = ['first_name', 'last_name', 'email', 'current_title', 'current_company']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Personal Information', {
            'fields': ('user_id', 'first_name', 'last_name', 'email', 'phone')
        }),
        ('Professional Information', {
            'fields': ('current_title', 'current_company', 'years_experience')
        }),
        ('Location', {
            'fields': ('city', 'state', 'country')
        }),
        ('Skills & Preferences', {
            'fields': ('skills', 'preferred_locations', 'preferred_roles', 'salary_expectation')
        }),
        ('Status', {
            'fields': ('is_active', 'is_available')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'job_title', 'company_name', 'status', 'applied_date']
    list_filter = ['status', 'applied_date']
    search_fields = ['candidate__first_name', 'candidate__last_name', 'job_title', 'company_name']
    readonly_fields = ['id', 'applied_date', 'updated_date']
    date_hierarchy = 'applied_date'


@admin.register(CandidateSkill)
class CandidateSkillAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'skill_name', 'proficiency', 'years_experience']
    list_filter = ['proficiency', 'years_experience']
    search_fields = ['candidate__first_name', 'candidate__last_name', 'skill_name']
    readonly_fields = ['id', 'added_at']
