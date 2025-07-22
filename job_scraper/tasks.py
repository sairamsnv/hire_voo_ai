import os
import django
from celery import shared_task
from datetime import datetime
import time
import random
from typing import List

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hire_voo_ai.settings')
django.setup()

from background_sec import (
    get_proxy_list, First_Hit_Scrapper, get_dataframe, 
    ETL_Datframe, Second_Hit_Scrappers, updated_Database, 
    remove_files_in_directory
)
from job_scraper.redis_cache import (
    cache_job_listings, get_cached_job_listings,
    cache_scraping_status, get_cached_scraping_status,
    cache_proxy_list, get_cached_proxy_list,
    clear_job_cache
)

# High-value keywords for job scraping
JOB_KEYWORDS = [
    "software engineer",
    "data scientist", 
    "product manager",
    "full stack developer",
    "machine learning engineer",
    "devops engineer",
    "cloud architect",
    "cybersecurity analyst",
    "business analyst",
    "project manager",
    "sales manager",
    "marketing manager",
    "financial analyst",
    "operations manager",
    "ui ux designer",
    "qa engineer",
    "system administrator",
    "network engineer",
    "database administrator",
    "frontend developer"
]

def get_next_keyword() -> str:
    """Get the next keyword to scrape based on current hour"""
    current_hour = datetime.now().hour
    keyword_index = current_hour % len(JOB_KEYWORDS)
    return JOB_KEYWORDS[keyword_index]

def build_linkedin_url(keyword: str) -> str:
    """Build LinkedIn job search URL for the given keyword"""
    encoded_keyword = keyword.replace(' ', '%20')
    base_url = (
        f"https://www.linkedin.com/jobs/search/?"
        f"keywords={encoded_keyword}&"
        f"location=United%20States&"
        f"f_TPR=r86400&"  # Last 24 hours
        f"start="
    )
    return base_url

@shared_task(bind=True, max_retries=3)
def scrape_jobs_hourly(self) -> str:
    """Scrape jobs every hour with rotating keywords and caching"""
    try:
        # Get current keyword
        keyword = get_next_keyword()
        print(f"Starting hourly job scraping for keyword: {keyword}")
        
        # Check cache first
        cached_jobs = get_cached_job_listings(keyword)
        if cached_jobs:
            print(f"Found {len(cached_jobs)} cached jobs for keyword: {keyword}")
            # Update database with cached jobs
            # Note: You might want to implement a function to convert cached data to database format
            return f"Used {len(cached_jobs)} cached jobs for {keyword}"
        
        # Get proxy list (with caching)
        proxy_list = get_cached_proxy_list()
        if not proxy_list:
            proxy_list = get_proxy_list()
            if proxy_list:
                cache_proxy_list(proxy_list)
        
        if not proxy_list:
            print("No proxies available. Retrying...")
            raise self.retry(countdown=300)  # Retry in 5 minutes
            
        # Build LinkedIn URL
        linkedin_url = build_linkedin_url(keyword)
        
        # Execute scraping pipeline
        print(f"Scraping jobs for keyword: {keyword}")
        First_Hit_Scrapper(linkedin_url, 0, proxy_list)
        
        # Wait between scraping phases
        time.sleep(120)
        
        # Process scraped data
        df = get_dataframe()
        if df.empty:
            print(f"No data scraped for keyword: {keyword}")
            return f"No data for {keyword}"
            
        # Transform data
        first_instance = ETL_Datframe(df)
        first_dataframe = first_instance.Updated_link_column()
        transform_data_instance = ETL_Datframe(first_dataframe)
        trans = transform_data_instance.Transform_Dataframe()
        
        # Get detailed job information
        second_hit_output = Second_Hit_Scrappers(trans, proxy_list)
        
        # Cache the job data
        if not second_hit_output.empty:
            jobs_data = second_hit_output.to_dict('records')
            cache_job_listings(keyword, jobs_data)
            print(f"Cached {len(jobs_data)} jobs for keyword: {keyword}")
        
        # Wait before database update
        time.sleep(60)
        
        # Update database
        updated_Database(second_hit_output)
        
        # Clean up files
        uploads_dir = os.path.join(os.getcwd(), 'uploads')
        remove_files_in_directory(uploads_dir)
        
        # Update scraping status
        status = {
            'last_scraped': datetime.now().isoformat(),
            'keyword': keyword,
            'jobs_count': len(second_hit_output) if not second_hit_output.empty else 0,
            'status': 'success'
        }
        cache_scraping_status(status)
        
        success_message = f"Successfully scraped jobs for keyword: {keyword} at {datetime.now()}"
        print(success_message)
        
        return success_message
        
    except Exception as e:
        error_message = f"Error in hourly scraping for keyword {keyword}: {str(e)}"
        print(error_message)
        
        # Cache error status
        error_status = {
            'last_scraped': datetime.now().isoformat(),
            'keyword': keyword,
            'error': str(e),
            'status': 'error'
        }
        cache_scraping_status(error_status)
        
        # Retry with exponential backoff
        if self.request.retries < self.max_retries:
            countdown = 60 * (2 ** self.request.retries)  # 1min, 2min, 4min
            raise self.retry(countdown=countdown)
        else:
            print(f"Max retries exceeded for keyword: {keyword}")
            return f"Failed after {self.max_retries} retries: {error_message}"

@shared_task
def scrape_specific_keyword(keyword: str) -> str:
    """Scrape jobs for a specific keyword (manual trigger) with caching"""
    try:
        print(f"Starting manual scraping for keyword: {keyword}")
        
        # Check cache first
        cached_jobs = get_cached_job_listings(keyword)
        if cached_jobs:
            print(f"Found {len(cached_jobs)} cached jobs for keyword: {keyword}")
            return f"Used {len(cached_jobs)} cached jobs for {keyword}"
        
        # Get proxy list (with caching)
        proxy_list = get_cached_proxy_list()
        if not proxy_list:
            proxy_list = get_proxy_list()
            if proxy_list:
                cache_proxy_list(proxy_list)
        
        if not proxy_list:
            return "No proxies available"
            
        # Build LinkedIn URL
        linkedin_url = build_linkedin_url(keyword)
        
        # Execute scraping pipeline
        First_Hit_Scrapper(linkedin_url, 0, proxy_list)
        time.sleep(120)
        
        df = get_dataframe()
        if df.empty:
            return f"No data scraped for keyword: {keyword}"
            
        first_instance = ETL_Datframe(df)
        first_dataframe = first_instance.Updated_link_column()
        transform_data_instance = ETL_Datframe(first_dataframe)
        trans = transform_data_instance.Transform_Dataframe()
        second_hit_output = Second_Hit_Scrappers(trans, proxy_list)
        
        # Cache the job data
        if not second_hit_output.empty:
            jobs_data = second_hit_output.to_dict('records')
            cache_job_listings(keyword, jobs_data)
            print(f"Cached {len(jobs_data)} jobs for keyword: {keyword}")
        
        time.sleep(60)
        updated_Database(second_hit_output)
        
        uploads_dir = os.path.join(os.getcwd(), 'uploads')
        remove_files_in_directory(uploads_dir)
        
        return f"Successfully scraped jobs for keyword: {keyword}"
        
    except Exception as e:
        return f"Error scraping keyword {keyword}: {str(e)}"

@shared_task
def get_scraping_status() -> dict:
    """Get current scraping status and statistics with caching"""
    try:
        # Check cache first
        cached_status = get_cached_scraping_status()
        if cached_status:
            print("Using cached scraping status")
            return cached_status
        
        from job_scraper.models import Job, Company
        
        total_jobs = Job.objects.using('default').count()
        total_companies = Company.objects.using('default').count()
        
        # Get jobs from last 24 hours
        from django.utils import timezone
        from datetime import timedelta
        
        last_24h = timezone.now() - timedelta(hours=24)
        recent_jobs = Job.objects.using('default').filter(
            created_at__gte=last_24h
        ).count()
        
        status = {
            'total_jobs': total_jobs,
            'total_companies': total_companies,
            'jobs_last_24h': recent_jobs,
            'current_keyword': get_next_keyword(),
            'next_keyword': JOB_KEYWORDS[(datetime.now().hour + 1) % len(JOB_KEYWORDS)],
            'cache_hit': False
        }
        
        # Cache the status
        cache_scraping_status(status)
        
        return status
        
    except Exception as e:
        return {'error': str(e)}

@shared_task
def clear_cache_task() -> str:
    """Clear all job-related cache"""
    try:
        success = clear_job_cache()
        if success:
            return "Cache cleared successfully"
        else:
            return "Failed to clear cache"
    except Exception as e:
        return f"Error clearing cache: {str(e)}" 