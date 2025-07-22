web: gunicorn hire_voo_ai.wsgi:application --bind 0.0.0.0:$PORT
worker: celery -A job_scraper worker --loglevel=info --concurrency=1
beat: celery -A job_scraper beat --loglevel=info --scheduler=django_celery_beat.schedulers:DatabaseScheduler 