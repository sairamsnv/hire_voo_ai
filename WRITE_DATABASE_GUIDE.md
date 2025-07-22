# Write Database Guide

This guide explains how to use your existing `background_sec.py` file with the **write database** setup.

## Database Setup

We have **two databases**:
- **Write Database** (`default`) - For scraping and storing data
- **Read Database** (`read`) - For other apps to read data

## Your Existing Code

Your `background_sec.py` file has been updated to:
1. Use the correct Django settings (`hire_voo_ai.settings`)
2. Import the correct models (`job_scraper.models`)
3. Write data to the **write database** using `Job.objects.using('default')`

## Key Changes Made

### 1. Django Settings
```python
# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hire_voo_ai.settings')
django.setup()

from job_scraper.models import Job, Company
```

### 2. Database Operations
```python
# Write to write database
Job.objects.using('default').bulk_create(jobs_to_create)
Company.objects.using('default').get_or_create(...)
```

### 3. Field Mapping
- `job_link` → `job_url`
- `posted_time` → `posted_date`
- `salary` → `salary_display`
- `seniority` → `seniority_level`

## How to Use

### 1. Run Your Existing Script
```bash
python background_sec.py
```

This will:
- Scrape jobs from LinkedIn
- Store them in the **write database**
- Print notifications

### 2. Check Data in Write Database
```python
# In Django shell
python manage.py shell

from job_scraper.models import Job, Company
Job.objects.using('default').count()  # Count jobs in write DB
```

### 3. Other Apps Can Read Data
Other applications can use the read API endpoints:
- `GET /job_scraper/api/jobs/` - Get all jobs
- `GET /job_scraper/api/jobs/<id>/` - Get specific job
- `GET /job_scraper/api/jobs/stats/` - Get statistics
- `GET /job_scraper/api/jobs/search/?q=python` - Search jobs

## Database Configuration

The databases are configured in `hire_voo_ai/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'hire_voo_ai_write',  # Write database
        'USER': 'postgres',
        'PASSWORD': 'R@ms@i143',
        'HOST': 'localhost',
        'PORT': '5432',
    },
    'read': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'hire_voo_ai_read',  # Read database
        'USER': 'postgres',
        'PASSWORD': 'R@ms@i143',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## Database Router

The `hire_voo_ai/database_router.py` automatically:
- Routes **write operations** to `default` database
- Routes **read operations** to `read` database

## Next Steps

1. **Set up PostgreSQL databases**:
   ```sql
   CREATE DATABASE hire_voo_ai_write;
   CREATE DATABASE hire_voo_ai_read;
   ```

2. **Run migrations**:
   ```bash
   python manage.py migrate --database=default
   python manage.py migrate --database=read
   ```

3. **Test your script**:
   ```bash
   python background_sec.py
   ```

4. **Set up data replication** (optional):
   - Configure PostgreSQL replication from write to read database
   - Or use Django signals to sync data

## Benefits

- **Separation of concerns**: Write operations don't affect read performance
- **Scalability**: Can scale read and write databases independently
- **Performance**: Read queries are faster on dedicated read database
- **Reliability**: Write operations are isolated

Your existing `background_sec.py` will continue to work exactly as before, but now it writes to a dedicated write database! 