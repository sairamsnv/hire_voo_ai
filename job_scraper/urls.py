from django.urls import path
from . import read_views

app_name = 'job_scraper'

urlpatterns = [
    # Read-only API endpoints (for other apps to consume data)
    path('api/jobs/', read_views.get_jobs_api, name='get_jobs'),
    path('api/jobs/<str:job_id>/', read_views.get_job_details_api, name='get_job_details'),
    path('api/jobs/stats/', read_views.get_job_stats_api, name='get_job_stats'),
    path('api/jobs/search/', read_views.search_jobs_api, name='search_jobs'),
] 