import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hire_voo_ai.settings')

app = Celery('hire_voo_ai')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Import tasks from job_scraper
from job_scraper.tasks import scrape_jobs_hourly, scrape_specific_keyword, get_scraping_status

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}') 