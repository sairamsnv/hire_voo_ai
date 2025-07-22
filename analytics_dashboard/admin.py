from django.contrib import admin
from .models import AnalyticsEvent, DailyMetrics, UserActivity, SearchAnalytics


@admin.register(AnalyticsEvent)
class AnalyticsEventAdmin(admin.ModelAdmin):
    list_display = ['event_type', 'user_id', 'ip_address', 'created_at']
    list_filter = ['event_type', 'created_at', 'device_type']
    search_fields = ['user_id', 'session_id', 'page_url']
    readonly_fields = ['id', 'created_at']
    date_hierarchy = 'created_at'


@admin.register(DailyMetrics)
class DailyMetricsAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_jobs', 'new_jobs', 'total_users', 'new_users', 'total_applications']
    list_filter = ['date']
    readonly_fields = ['id', 'created_at', 'updated_at']
    date_hierarchy = 'date'


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ['user_id', 'date', 'job_views', 'job_applications', 'searches', 'sessions_count']
    list_filter = ['date']
    search_fields = ['user_id']
    readonly_fields = ['id', 'created_at', 'updated_at']
    date_hierarchy = 'date'


@admin.register(SearchAnalytics)
class SearchAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['query', 'date', 'search_count', 'results_count', 'click_count', 'unique_users']
    list_filter = ['date']
    search_fields = ['query']
    readonly_fields = ['id', 'created_at', 'updated_at']
    date_hierarchy = 'date'
