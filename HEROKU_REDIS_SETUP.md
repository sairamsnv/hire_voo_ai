# 🔴 Heroku Redis Setup - Complete Guide

## 🎯 **Why Redis on Heroku?**

### **Local vs Heroku:**
- **Local**: Redis runs on your computer (`localhost:6379`)
- **Heroku**: Redis runs on Heroku's servers (cloud)

### **What Redis Does on Heroku:**
1. **Celery Message Queue** - For job scraping tasks
2. **Caching** - Fast data access
3. **Session Storage** - User sessions
4. **Job Data Cache** - Scraped job listings

## 🚀 **Step-by-Step Setup:**

### **1. Login to Heroku:**
```bash
heroku login
```

### **2. Create Heroku App (if not exists):**
```bash
# Create new app
heroku create your-app-name

# Or use existing app
heroku git:remote -a your-app-name
```

### **3. Add PostgreSQL Database:**
```bash
# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Check database URL
heroku config:get DATABASE_URL
```

### **4. Add Redis Addon (This is what you need!):**
```bash
# Add Redis addon for Celery and caching
heroku addons:create heroku-redis:mini

# Check Redis URL
heroku config:get REDIS_URL
```

### **5. Set Environment Variables:**
```bash
# Set Django settings
heroku config:set DJANGO_SETTINGS_MODULE=hire_voo_ai.settings
heroku config:set DEBUG=False
heroku config:set SECRET_KEY=your-secret-key-here

# Set Redis URLs for different purposes
heroku config:set CELERY_BROKER_URL=$REDIS_URL
heroku config:set CELERY_RESULT_BACKEND=$REDIS_URL
heroku config:set REDIS_CACHE_URL=$REDIS_URL
```

## 🔧 **Update Django Settings for Heroku:**

### **hire_voo_ai/settings.py:**
```python
import os
import dj_database_url

# Database
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL')
    )
}

# Redis Configuration for Heroku
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

# Celery Configuration
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL

# Cache Configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL + '/1',  # Database 1 for caching
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'hire_voo_ai',
        'TIMEOUT': 300,
    },
    'sessions': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL + '/2',  # Database 2 for sessions
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'session',
    },
    'jobs': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL + '/3',  # Database 3 for job data
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'jobs',
        'TIMEOUT': 3600,
    }
}

# Session Configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'sessions'
```

## 📊 **Redis Addon Plans:**

### **Free Tier (No longer available):**
- Use paid plans

### **Paid Plans:**
- **Mini**: $5/month (25MB, 20 connections)
- **Basic**: $15/month (100MB, 40 connections)
- **Standard**: $30/month (500MB, 100 connections)
- **Premium**: $60/month (1GB, 200 connections)

### **For Your Project:**
- **Recommended**: Mini plan ($5/month)
- **Good for**: Up to 1000 users
- **Includes**: 25MB storage, 20 connections

## 🚀 **Deploy to Heroku:**

### **1. Deploy Code:**
```bash
# Add all files
git add .

# Commit changes
git commit -m "Add Redis caching and Celery support"

# Push to Heroku
git push heroku main
```

### **2. Run Migrations:**
```bash
heroku run python manage.py migrate
```

### **3. Scale Dynos:**
```bash
# Start web dyno
heroku ps:scale web=1

# Start worker dyno (for Celery)
heroku ps:scale worker=1

# Start beat dyno (for scheduling)
heroku ps:scale beat=1
```

## 🔍 **Monitor Redis on Heroku:**

### **1. Check Redis Status:**
```bash
# View Redis addon
heroku addons:info heroku-redis

# Check Redis URL
heroku config:get REDIS_URL
```

### **2. Monitor Usage:**
```bash
# Check dyno logs
heroku logs --tail --dyno worker

# Check Redis logs
heroku logs --tail --dyno web
```

### **3. Test Redis Connection:**
```bash
# Test Redis from Heroku
heroku run python -c "
import redis
import os
r = redis.from_url(os.environ.get('REDIS_URL'))
print('Redis connected:', r.ping())
"
```

## 💰 **Cost Breakdown:**

### **Monthly Costs:**
- **Web Dyno**: $7/month
- **Worker Dyno**: $7/month
- **Beat Dyno**: $7/month
- **PostgreSQL Mini**: $5/month
- **Redis Mini**: $5/month
- **Total**: $31/month

### **What You Get:**
- ✅ 24/7 job scraping
- ✅ Fast caching system
- ✅ Session management
- ✅ Scalable infrastructure
- ✅ Professional hosting

## 🚨 **Troubleshooting:**

### **Redis Connection Issues:**
```bash
# Check if Redis addon is active
heroku addons

# Restart Redis
heroku addons:restart heroku-redis

# Check Redis URL
heroku config:get REDIS_URL
```

### **Celery Issues:**
```bash
# Check worker logs
heroku logs --tail --dyno worker

# Restart worker
heroku restart worker

# Check Celery status
heroku run celery -A job_scraper inspect ping
```

### **Cache Issues:**
```bash
# Check cache from Heroku
heroku run python manage.py redis_monitor

# Clear cache
heroku run python manage.py redis_monitor --clear
```

## 🎯 **Quick Setup Script:**

```bash
#!/bin/bash
# setup_heroku_redis.sh

echo "🚀 Setting up Heroku with Redis..."

# Create app (if needed)
read -p "Enter your Heroku app name: " APP_NAME
heroku create $APP_NAME

# Add addons
echo "📦 Adding PostgreSQL..."
heroku addons:create heroku-postgresql:mini --app $APP_NAME

echo "🔴 Adding Redis..."
heroku addons:create heroku-redis:mini --app $APP_NAME

# Set config
echo "⚙️ Setting environment variables..."
heroku config:set DJANGO_SETTINGS_MODULE=hire_voo_ai.settings --app $APP_NAME
heroku config:set DEBUG=False --app $APP_NAME
heroku config:set SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(50))') --app $APP_NAME

# Deploy
echo "📤 Deploying..."
git add .
git commit -m "Deploy with Redis support"
git push heroku main

# Setup
echo "🗃️ Running migrations..."
heroku run python manage.py migrate --app $APP_NAME

echo "⚡ Scaling dynos..."
heroku ps:scale web=1 worker=1 beat=1 --app $APP_NAME

echo "✅ Setup complete!"
echo "🌐 App URL: https://$APP_NAME.herokuapp.com"
```

## 🎉 **Benefits of Heroku Redis:**

1. **✅ Automatic Scaling** - Handles traffic spikes
2. **✅ High Availability** - 99.9% uptime
3. **✅ Managed Service** - No server maintenance
4. **✅ Easy Monitoring** - Built-in metrics
5. **✅ Professional Support** - 24/7 help

---

**Your Redis system will work perfectly on Heroku! 🚀** 