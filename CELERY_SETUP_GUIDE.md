# 🚀 Celery Job Scraping System Setup Guide

## Overview
This system automatically scrapes job listings from LinkedIn every hour using rotating keywords. It uses Celery for background task processing and Redis as the message broker.

## 📋 Prerequisites

1. **Redis Server** - Message broker for Celery
2. **Python 3.8+** - For running the application
3. **Django** - Web framework
4. **PostgreSQL** - Database (already configured)

## 🛠️ Installation

### 1. Install Dependencies
```bash
pip install celery redis django-celery-beat django-celery-results
```

### 2. Start Redis Server
```bash
# On macOS (if installed via Homebrew)
brew services start redis

# On Linux
sudo systemctl start redis

# On Windows
redis-server
```

### 3. Run Database Migrations
```bash
python manage.py migrate
```

## 🚀 Starting the System

### Option 1: Automatic Startup (Recommended)
```bash
python start_celery_background.py
```

### Option 2: Manual Startup
```bash
# Terminal 1: Start Celery Worker
celery -A hire_voo_ai worker --loglevel=info

# Terminal 2: Start Celery Beat Scheduler
celery -A hire_voo_ai beat --loglevel=info --scheduler=django_celery_beat.schedulers:DatabaseScheduler
```

## 🧪 Testing the Setup

```bash
python test_celery_setup.py
```

## 📊 How It Works

### Hourly Scraping Schedule
- **Every hour at minute 0**: Scrapes jobs with rotating keywords
- **Every 4 hours at minute 30**: Additional scraping for redundancy

### Keyword Rotation
The system rotates through these keywords:
1. software engineer
2. data scientist
3. product manager
4. full stack developer
5. machine learning engineer
6. devops engineer
7. cloud architect
8. cybersecurity analyst
9. business analyst
10. project manager
11. sales manager
12. marketing manager
13. financial analyst
14. operations manager
15. ui ux designer
16. qa engineer
17. system administrator
18. network engineer
19. database administrator
20. frontend developer

### Data Flow
1. **Scraping**: LinkedIn job listings are scraped using proxies
2. **Processing**: Data is cleaned and transformed
3. **Storage**: Jobs are saved to the write database
4. **Notification**: Success/failure notifications are sent

## 🎛️ Manual Commands

### Start Scraping for Specific Keyword
```bash
python manage.py start_scraping --keyword "python developer"
```

### Check Scraping Status
```bash
python manage.py start_scraping --status
```

### Start Hourly Scraping Manually
```bash
python manage.py start_scraping --hourly
```

## 📈 Monitoring

### Check Task Status
```bash
# Check Celery worker status
celery -A hire_voo_ai inspect active

# Check scheduled tasks
celery -A hire_voo_ai inspect scheduled
```

### View Logs
```bash
# Worker logs
tail -f celery.log

# Django logs
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

### Schedule Configuration (celery_beat_schedule.py)
```python
app.conf.beat_schedule = {
    'scrape-jobs-every-hour': {
        'task': 'job_scraper_tasks.scrape_jobs_hourly',
        'schedule': crontab(minute=0, hour='*'),
    },
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Redis Connection Error**
   ```bash
   # Check if Redis is running
   redis-cli ping
   # Should return: PONG
   ```

2. **Celery Worker Not Starting**
   ```bash
   # Check Django settings
   python manage.py check
   
   # Check Celery configuration
   celery -A hire_voo_ai inspect ping
   ```

3. **Tasks Not Executing**
   ```bash
   # Check beat scheduler
   celery -A hire_voo_ai beat --loglevel=debug
   
   # Check worker
   celery -A hire_voo_ai worker --loglevel=debug
   ```

### Debug Mode
```bash
# Start with debug logging
celery -A hire_voo_ai worker --loglevel=debug
celery -A hire_voo_ai beat --loglevel=debug
```

## 📊 Performance Optimization

### Scaling Workers
```bash
# Start multiple workers
celery -A hire_voo_ai worker --loglevel=info --concurrency=4
```

### Memory Optimization
```bash
# Limit memory usage
celery -A hire_voo_ai worker --loglevel=info --max-memory-per-child=200000
```

## 🔒 Security Considerations

1. **Proxy Rotation**: System uses rotating proxies to avoid rate limiting
2. **Error Handling**: Comprehensive error handling with retries
3. **Database Separation**: Read/write database separation for performance
4. **Logging**: Detailed logging for monitoring and debugging

## 📞 Support

If you encounter issues:
1. Check the logs in `logs/django.log`
2. Verify Redis is running
3. Test with `python test_celery_setup.py`
4. Check Celery worker status

## 🎯 Next Steps

1. **Monitor Performance**: Watch task execution times
2. **Add More Keywords**: Extend the keyword list
3. **Optimize Scraping**: Adjust batch sizes and delays
4. **Add Notifications**: Integrate with email/Slack notifications
5. **Scale Up**: Add more workers for higher throughput

---

**Happy Scraping! 🚀** 