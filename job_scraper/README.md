# 🚀 Job Scraper - Celery Background System

## Overview
This module handles automated job scraping from LinkedIn using Celery for background task processing. The system scrapes jobs every hour with rotating keywords and stores them in the database.

## 📁 File Structure
```
job_scraper/
├── celery.py              # Celery configuration
├── tasks.py               # Task definitions
├── scheduler.py           # Beat scheduler configuration
├── utils.py               # Utility functions
├── start_celery.py        # Startup script
├── README.md              # This file
├── management/
│   └── commands/
│       └── start_scraping.py  # Django management command
└── models.py              # Database models
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install celery redis django-celery-beat django-celery-results
```

### 2. Start Redis
```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# Windows
redis-server
```

### 3. Start the System
```bash
# Option 1: Automatic startup
python job_scraper/start_celery.py

# Option 2: Manual startup
celery -A job_scraper worker --loglevel=info
celery -A job_scraper beat --loglevel=info
```

### 4. Test the Setup
```bash
python job_scraper/utils.py test
```

## 🎯 Features

### Hourly Scraping
- **Every hour**: Scrapes jobs with rotating keywords
- **Every 4 hours**: Additional scraping for redundancy
- **20 keywords**: Software engineer, data scientist, product manager, etc.

### Task Management
- **Automatic retry**: With exponential backoff
- **Proxy rotation**: For better success rates
- **Error handling**: Comprehensive logging
- **Database integration**: Stores in write database

### Manual Commands
```bash
# Scrape specific keyword
python manage.py start_scraping --keyword "python developer"

# Check status
python manage.py start_scraping --status

# Start hourly scraping
python manage.py start_scraping --hourly
```

## 📊 Monitoring

### Check Task Status
```bash
celery -A job_scraper inspect active
celery -A job_scraper inspect scheduled
```

### View Logs
```bash
tail -f celery.log
tail -f logs/django.log
```

## 🔧 Configuration

### Celery Settings (hire_voo_ai/settings.py)
```python
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
```

### Schedule (job_scraper/scheduler.py)
```python
app.conf.beat_schedule = {
    'scrape-jobs-every-hour': {
        'task': 'job_scraper.tasks.scrape_jobs_hourly',
        'schedule': crontab(minute=0, hour='*'),
    },
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Redis Connection Error**
   ```bash
   redis-cli ping  # Should return: PONG
   ```

2. **Celery Worker Not Starting**
   ```bash
   python manage.py check
   celery -A job_scraper inspect ping
   ```

3. **Tasks Not Executing**
   ```bash
   celery -A job_scraper worker --loglevel=debug
   celery -A job_scraper beat --loglevel=debug
   ```

## 📈 Performance

### Scaling
```bash
# Multiple workers
celery -A job_scraper worker --concurrency=4

# Memory optimization
celery -A job_scraper worker --max-memory-per-child=200000
```

## 🔒 Security

- **Proxy rotation**: Avoids rate limiting
- **Error handling**: Comprehensive retry logic
- **Database separation**: Read/write separation
- **Logging**: Detailed monitoring

## 📞 Support

If you encounter issues:
1. Check logs in `logs/django.log`
2. Verify Redis is running
3. Test with `python job_scraper/utils.py test`
4. Check Celery worker status

---

**Happy Scraping! 🚀** 