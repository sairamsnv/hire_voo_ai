from django.contrib import admin
from .models import JobView, JobApplication, JobBookmark, JobSearch


@admin.register(JobView)
class JobViewAdmin(admin.ModelAdmin):
    list_display = ['job_id', 'user_id', 'ip_address', 'viewed_at']
    list_filter = ['viewed_at']
    search_fields = ['job_id', 'user_id']
    readonly_fields = ['id', 'viewed_at']
    date_hierarchy = 'viewed_at'


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['job_id', 'user_id', 'status', 'applied_at']
    list_filter = ['status', 'applied_at']
    search_fields = ['job_id', 'user_id']
    readonly_fields = ['id', 'applied_at', 'updated_at']
    date_hierarchy = 'applied_at'


@admin.register(JobBookmark)
class JobBookmarkAdmin(admin.ModelAdmin):
    list_display = ['job_id', 'user_id', 'bookmarked_at']
    list_filter = ['bookmarked_at']
    search_fields = ['job_id', 'user_id']
    readonly_fields = ['id', 'bookmarked_at']
    date_hierarchy = 'bookmarked_at'


@admin.register(JobSearch)
class JobSearchAdmin(admin.ModelAdmin):
    list_display = ['user_id', 'query', 'results_count', 'searched_at']
    list_filter = ['searched_at']
    search_fields = ['user_id', 'query']
    readonly_fields = ['id', 'searched_at']
    date_hierarchy = 'searched_at'
