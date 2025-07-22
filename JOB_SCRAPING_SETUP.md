# 🚀 Job Scraping System - Complete Setup Guide

## ✅ **Files Organized Successfully!**

All Celery files have been moved to the `job_scraper` app directory for better organization:

### 📁 **Project Structure:**
```
hire_voo_ai-4/
├── job_scraper/                    # 🎯 Main scraping app
│   ├── celery.py                   # Celery configuration
│   ├── tasks.py                    # Task definitions
│   ├── scheduler.py                # Beat scheduler
│   ├── utils.py                    # Utility functions
│   ├── start_celery.py             # Startup script
│   ├── README.md                   # App documentation
│   ├── models.py                   # Database models
│   └── management/
│       └── commands/
│           └── start_scraping.py   # Django management command
├── hire_voo_ai/
│   └── celery.py                   # Main project celery config
├── start_job_scraping.py           # Quick start script
├── test_job_scraping.py            # Test script
├── background_sec.py               # Core scraping logic
└── JOB_SCRAPING_SETUP.md           # This guide
```

## 🚀 **Quick Start Commands:**

### **1. Start the System:**
```bash
# Option 1: Simple start
python start_job_scraping.py

# Option 2: Direct start
python job_scraper/start_celery.py

# Option 3: Manual start
celery -A job_scraper worker --loglevel=info
celery -A job_scraper beat --loglevel=info
```

### **2. Test the Setup:**
```bash
# Test everything
python test_job_scraping.py

# Or test specific components
python job_scraper/utils.py test
```

### **3. Manual Commands:**
```bash
# Scrape specific keyword
python manage.py start_scraping --keyword "python developer"

# Check status
python manage.py start_scraping --status

# Start hourly scraping
python manage.py start_scraping --hourly
```

## 🎯 **What Happens:**

### **Every Hour:**
1. **Keyword Rotation**: System picks next keyword from 20 options
2. **LinkedIn Scraping**: Scrapes job listings with proxies
3. **Data Processing**: Cleans and transforms job data
4. **Database Storage**: Saves to write database
5. **Cleanup**: Removes temporary files

### **Keywords Included:**
- Software Engineer, Data Scientist, Product Manager
- Full Stack Developer, ML Engineer, DevOps Engineer
- Cloud Architect, Cybersecurity, Business Analyst
- And 12 more high-value job types!

## 🔧 **Prerequisites:**

### **1. Install Dependencies:**
```bash
pip install celery redis django-celery-beat django-celery-results
```

### **2. Start Redis:**
```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# Windows
redis-server
```

### **3. Run Migrations:**
```bash
python manage.py migrate
```

## 📊 **Monitoring:**

### **Check Status:**
```bash
# Task status
celery -A job_scraper inspect active

# Scheduled tasks
celery -A job_scraper inspect scheduled

# Worker status
celery -A job_scraper inspect ping
```

### **View Logs:**
```bash
# Celery logs
tail -f celery.log

# Django logs
tail -f logs/django.log
```

## 🚨 **Troubleshooting:**

### **Common Issues:**

1. **Redis Not Running:**
   ```bash
   redis-cli ping  # Should return: PONG
   ```

2. **Celery Worker Issues:**
   ```bash
   python manage.py check
   celery -A job_scraper inspect ping
   ```

3. **Tasks Not Executing:**
   ```bash
   celery -A job_scraper worker --loglevel=debug
   celery -A job_scraper beat --loglevel=debug
   ```

## 🎉 **Benefits of This Organization:**

### **✅ Better Structure:**
- All scraping code in one app
- Clear separation of concerns
- Easy to maintain and extend

### **✅ Easy to Use:**
- Simple startup scripts
- Clear documentation
- Test scripts included

### **✅ Scalable:**
- Modular design
- Easy to add new features
- Configurable scheduling

### **✅ Production Ready:**
- Error handling
- Logging
- Monitoring capabilities

## 🚀 **Ready to Start!**

The system is now perfectly organized and ready to run. Just choose your preferred startup method:

1. **Quick Start**: `python start_job_scraping.py`
2. **Test First**: `python test_job_scraping.py`
3. **Manual Control**: Use Django management commands

**Your job scraping system is ready to go! 🎉** 