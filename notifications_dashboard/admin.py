from django.contrib import admin
from .models import Notification, NotificationTemplate, NotificationPreference, NotificationLog

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification_type', 'title', 'priority', 'is_read', 'created_at']
    list_filter = ['notification_type', 'priority', 'is_read', 'is_archived', 'created_at']
    search_fields = ['user__email', 'title', 'message']
    readonly_fields = ['created_at', 'read_at']
    ordering = ['-created_at']
    actions = ['mark_as_read', 'mark_as_unread', 'archive_notifications']

    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = "Mark selected notifications as read"

    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False)
    mark_as_unread.short_description = "Mark selected notifications as unread"

    def archive_notifications(self, request, queryset):
        queryset.update(is_archived=True)
    archive_notifications.short_description = "Archive selected notifications"

@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'notification_type', 'priority', 'is_active', 'created_at']
    list_filter = ['notification_type', 'priority', 'is_active', 'created_at']
    search_fields = ['name', 'title_template', 'message_template']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'digest_frequency', 'created_at']
    list_filter = ['digest_frequency', 'created_at']
    search_fields = ['user__email']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Email Preferences', {
            'fields': (
                'email_job_matches', 'email_application_updates', 'email_interviews',
                'email_credit_alerts', 'email_system_notifications', 'email_promotions'
            )
        }),
        ('In-App Preferences', {
            'fields': (
                'in_app_job_matches', 'in_app_application_updates', 'in_app_interviews',
                'in_app_credit_alerts', 'in_app_system_notifications', 'in_app_promotions'
            )
        }),
        ('Frequency', {
            'fields': ('digest_frequency',)
        }),
    )

@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ['notification', 'delivery_method', 'status', 'delivered_at', 'created_at']
    list_filter = ['delivery_method', 'status', 'created_at']
    search_fields = ['notification__title', 'notification__user__email']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
