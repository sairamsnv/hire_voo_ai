#!/usr/bin/env python3
"""
Utility functions for job scraping
"""
import os
import sys
import django
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hire_voo_ai.settings')
django.setup()

from job_scraper.tasks import scrape_specific_keyword, get_scraping_status

def test_celery_setup():
    """Test if Celery is working properly"""
    print("🧪 Testing Celery Setup...")
    print("=" * 40)
    
    try:
        # Test 1: Check scraping status
        print("1. Testing scraping status...")
        status = get_scraping_status()
        print(f"   ✅ Status: {status}")
        
        # Test 2: Test specific keyword scraping
        print("2. Testing specific keyword scraping...")
        result = scrape_specific_keyword.delay("software engineer")
        print(f"   ✅ Task ID: {result.id}")
        print(f"   📋 Task Status: {result.status}")
        
        # Test 3: Check if task is queued
        print("3. Checking task queue...")
        if result.status in ['PENDING', 'STARTED']:
            print("   ✅ Task is queued successfully")
        else:
            print(f"   ⚠️  Task status: {result.status}")
        
        print("=" * 40)
        print("🎉 Celery setup test completed!")
        print("💡 To start the full system, run: python job_scraper/start_celery.py")
        
    except Exception as e:
        print(f"❌ Error testing Celery setup: {e}")
        print("💡 Make sure Redis is running: redis-server")
        print("💡 Make sure Celery worker is running: celery -A job_scraper worker --loglevel=info")

def start_celery_background():
    """Start Celery worker and beat scheduler in background"""
    import subprocess
    import time
    
    print("🚀 Starting Celery Job Scraping System...")
    print("=" * 50)
    
    # Start worker
    print("Starting Celery Worker...")
    worker_cmd = [
        'celery', '-A', 'job_scraper', 'worker',
        '--loglevel=info',
        '--concurrency=1',
        '--hostname=worker1@%h'
    ]
    worker_process = subprocess.Popen(worker_cmd)
    time.sleep(3)
    
    # Start beat scheduler
    print("Starting Celery Beat Scheduler...")
    beat_cmd = [
        'celery', '-A', 'job_scraper', 'beat',
        '--loglevel=info',
        '--scheduler=django_celery_beat.schedulers:DatabaseScheduler'
    ]
    beat_process = subprocess.Popen(beat_cmd)
    time.sleep(3)
    
    print("✅ Celery Worker and Beat Scheduler started successfully!")
    print("📊 Job scraping will run every hour with rotating keywords")
    print("🔍 Keywords: software engineer, data scientist, product manager, etc.")
    print("=" * 50)
    print("Press Ctrl+C to stop...")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping Celery processes...")
        worker_process.terminate()
        beat_process.terminate()
        print("✅ Celery processes stopped")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        test_celery_setup()
    else:
        start_celery_background() 