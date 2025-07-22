from celery import Celery
from celery.schedules import crontab
import os

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hire_voo_ai.settings')

app = Celery('job_scraper')
app.config_from_object('django.conf:settings', namespace='CELERY')

# Configure Celery Beat Schedule
app.conf.beat_schedule = {
    'scrape-jobs-every-hour': {
        'task': 'job_scraper.tasks.scrape_jobs_hourly',
        'schedule': crontab(minute=0, hour='*'),  # Every hour at minute 0
        'args': (),
    },
    'scrape-jobs-every-4-hours': {
        'task': 'job_scraper.tasks.scrape_jobs_hourly',
        'schedule': crontab(minute=30, hour='*/4'),  # Every 4 hours at minute 30
        'args': (),
    },
}

# Optional: Add more specific schedules for different keywords
# app.conf.beat_schedule.update({
#     'scrape-tech-jobs': {
#         'task': 'job_scraper.tasks.scrape_specific_keyword',
#         'schedule': crontab(minute=15, hour='*/2'),  # Every 2 hours
#         'args': ('software engineer',),
#     },
#     'scrape-data-jobs': {
#         'task': 'job_scraper.tasks.scrape_specific_keyword',
#         'schedule': crontab(minute=45, hour='*/3'),  # Every 3 hours
#         'args': ('data scientist',),
#     },
# })

app.autodiscover_tasks() 