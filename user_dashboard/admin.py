from django.contrib import admin
from .models import UserProfile, UserSkill, UserExperience, UserEducation, UserNotification


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'current_title', 'current_company', 'location_display', 'is_active', 'is_verified']
    list_filter = ['is_active', 'is_verified', 'years_experience', 'country']
    search_fields = ['first_name', 'last_name', 'email', 'current_title', 'current_company']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_login']
    fieldsets = (
        ('Personal Information', {
            'fields': ('user_id', 'first_name', 'last_name', 'email', 'phone', 'profile_picture')
        }),
        ('Professional Information', {
            'fields': ('current_title', 'current_company', 'years_experience')
        }),
        ('Location', {
            'fields': ('city', 'state', 'country')
        }),
        ('Preferences', {
            'fields': ('job_preferences', 'notification_settings', 'privacy_settings')
        }),
        ('Status', {
            'fields': ('is_active', 'is_verified')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_login'),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    list_display = ['user', 'skill_name', 'proficiency', 'years_experience', 'is_verified']
    list_filter = ['proficiency', 'is_verified', 'years_experience']
    search_fields = ['user__first_name', 'user__last_name', 'skill_name']
    readonly_fields = ['id', 'added_at']


@admin.register(UserExperience)
class UserExperienceAdmin(admin.ModelAdmin):
    list_display = ['user', 'job_title', 'company_name', 'start_date', 'end_date', 'is_current']
    list_filter = ['is_current', 'start_date', 'end_date']
    search_fields = ['user__first_name', 'user__last_name', 'job_title', 'company_name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(UserEducation)
class UserEducationAdmin(admin.ModelAdmin):
    list_display = ['user', 'degree', 'field_of_study', 'institution_name', 'start_date', 'end_date', 'is_current']
    list_filter = ['is_current', 'start_date', 'end_date']
    search_fields = ['user__first_name', 'user__last_name', 'degree', 'field_of_study', 'institution_name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(UserNotification)
class UserNotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification_type', 'title', 'is_read', 'is_sent', 'created_at']
    list_filter = ['notification_type', 'is_read', 'is_sent', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'title', 'message']
    readonly_fields = ['id', 'created_at', 'read_at']
    date_hierarchy = 'created_at'
