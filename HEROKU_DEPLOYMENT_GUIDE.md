# 🚀 Heroku Deployment Guide for Job Scraping System

## 📋 Prerequisites

1. **Heroku Account** - Sign up at heroku.com
2. **Heroku CLI** - Install from heroku.com/cli
3. **Git** - For version control
4. **PostgreSQL** - We'll use Heroku Postgres

## 🛠️ Setup Steps

### 1. Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from heroku.com/cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### 2. Login to Heroku
```bash
heroku login
```

### 3. Create Heroku App
```bash
# Create new app
heroku create your-app-name

# Or use existing app
heroku git:remote -a your-app-name
```

### 4. Add PostgreSQL Database
```bash
# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Check database URL
heroku config:get DATABASE_URL
```

### 5. Add Redis for Celery
```bash
# Add Redis addon
heroku addons:create heroku-redis:mini

# Check Redis URL
heroku config:get REDIS_URL
```

### 6. Set Environment Variables
```bash
# Set Django settings
heroku config:set DJANGO_SETTINGS_MODULE=hire_voo_ai.settings
heroku config:set DEBUG=False
heroku config:set SECRET_KEY=your-secret-key-here

# Set Celery settings
heroku config:set CELERY_BROKER_URL=$REDIS_URL
heroku config:set CELERY_RESULT_BACKEND=$REDIS_URL
```

### 7. Update Django Settings for Production
```python
# hire_voo_ai/settings.py
import os
import dj_database_url

# Database
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL')
    )
}

# Celery
CELERY_BROKER_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

# Security
SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = ['your-app-name.herokuapp.com', 'localhost', '127.0.0.1']
```

### 8. Deploy to Heroku
```bash
# Add all files
git add .

# Commit changes
git commit -m "Deploy job scraping system to Heroku"

# Push to Heroku
git push heroku main

# Run migrations
heroku run python manage.py migrate

# Create superuser (optional)
heroku run python manage.py createsuperuser
```

### 9. Scale Dynos
```bash
# Start web dyno
heroku ps:scale web=1

# Start worker dyno (for Celery tasks)
heroku ps:scale worker=1

# Start beat dyno (for scheduling)
heroku ps:scale beat=1

# Check dyno status
heroku ps
```

## 🔧 Configuration Files

### Procfile
```
web: gunicorn hire_voo_ai.wsgi:application --bind 0.0.0.0:$PORT
worker: celery -A job_scraper worker --loglevel=info --concurrency=1
beat: celery -A job_scraper beat --loglevel=info --scheduler=django_celery_beat.schedulers:DatabaseScheduler
```

### requirements.txt
```
Django>=5.2.4
djangorestframework>=3.16.0
django-cors-headers>=4.7.0
django-filter>=23.5
psycopg2-binary>=2.9.9
whitenoise>=6.9.0
gunicorn>=21.2.0
celery>=5.5.3
redis>=6.2.0
django-celery-beat>=2.8.1
django-celery-results>=2.6.0
beautifulsoup4>=4.12.0
requests>=2.31.0
pandas>=2.0.0
numpy>=1.24.0
python-dateutil>=2.8.2
backoff>=2.2.1
dj-database-url>=2.0.0
```

### runtime.txt
```
python-3.12.0
```

## 📊 Monitoring

### Check Logs
```bash
# View all logs
heroku logs --tail

# View specific dyno logs
heroku logs --tail --dyno worker
heroku logs --tail --dyno beat
heroku logs --tail --dyno web
```

### Check Dyno Status
```bash
# Check running dynos
heroku ps

# Check dyno usage
heroku ps:scale
```

### Monitor Celery
```bash
# Check Celery worker status
heroku run celery -A job_scraper inspect active

# Check scheduled tasks
heroku run celery -A job_scraper inspect scheduled
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Check build logs
   heroku logs --tail
   
   # Check requirements
   pip freeze > requirements.txt
   ```

2. **Database Connection**
   ```bash
   # Check database URL
   heroku config:get DATABASE_URL
   
   # Run migrations
   heroku run python manage.py migrate
   ```

3. **Celery Not Working**
   ```bash
   # Check worker logs
   heroku logs --tail --dyno worker
   
   # Restart worker
   heroku restart worker
   ```

4. **Redis Connection**
   ```bash
   # Check Redis URL
   heroku config:get REDIS_URL
   
   # Test Redis connection
   heroku run python -c "import redis; r=redis.from_url('$REDIS_URL'); print(r.ping())"
   ```

## 💰 Cost Optimization

### Free Tier (No longer available)
- Use hobby dynos ($7/month each)
- Mini PostgreSQL ($5/month)
- Mini Redis ($5/month)

### Total Monthly Cost: ~$24

### Cost Breakdown:
- Web Dyno: $7/month
- Worker Dyno: $7/month
- Beat Dyno: $7/month
- PostgreSQL Mini: $5/month
- Redis Mini: $5/month

## 🎯 Production Checklist

- [ ] Heroku app created
- [ ] PostgreSQL database added
- [ ] Redis addon added
- [ ] Environment variables set
- [ ] Code deployed
- [ ] Migrations run
- [ ] Dynos scaled
- [ ] Logs monitored
- [ ] Celery tasks working
- [ ] Database connected

## 🚀 Quick Deploy Script

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Deploying to Heroku..."

# Create app if not exists
heroku create your-app-name

# Add addons
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini

# Set config
heroku config:set DJANGO_SETTINGS_MODULE=hire_voo_ai.settings
heroku config:set DEBUG=False
heroku config:set SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(50))')

# Deploy
git add .
git commit -m "Deploy job scraping system"
git push heroku main

# Setup
heroku run python manage.py migrate
heroku ps:scale web=1 worker=1 beat=1

echo "✅ Deployment complete!"
echo "🌐 App URL: https://your-app-name.herokuapp.com"
```

## 📞 Support

If you encounter issues:
1. Check Heroku logs: `heroku logs --tail`
2. Verify addons: `heroku addons`
3. Check config: `heroku config`
4. Test locally: `heroku local`

---

**Happy Deploying! 🚀** 