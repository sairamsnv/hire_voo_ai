#!/usr/bin/env python3
"""
Start Celery Worker and Beat Scheduler for Job Scraping
"""
import os
import sys
import subprocess
import time
import signal
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hire_voo_ai.settings')

def start_celery_worker():
    """Start Celery worker"""
    print("Starting Celery Worker...")
    worker_cmd = [
        'celery', '-A', 'job_scraper', 'worker',
        '--loglevel=info',
        '--concurrency=1',
        '--hostname=worker1@%h'
    ]
    return subprocess.Popen(worker_cmd)

def start_celery_beat():
    """Start Celery beat scheduler"""
    print("Starting Celery Beat Scheduler...")
    beat_cmd = [
        'celery', '-A', 'job_scraper', 'beat',
        '--loglevel=info',
        '--scheduler=django_celery_beat.schedulers:DatabaseScheduler'
    ]
    return subprocess.Popen(beat_cmd)

def main():
    """Main function to start both worker and beat"""
    print("🚀 Starting Celery Job Scraping System...")
    print("=" * 50)
    
    # Start worker
    worker_process = start_celery_worker()
    time.sleep(3)  # Wait for worker to start
    
    # Start beat scheduler
    beat_process = start_celery_beat()
    time.sleep(3)  # Wait for beat to start
    
    print("✅ Celery Worker and Beat Scheduler started successfully!")
    print("📊 Job scraping will run every hour with rotating keywords")
    print("🔍 Keywords: software engineer, data scientist, product manager, etc.")
    print("=" * 50)
    print("Press Ctrl+C to stop...")
    
    try:
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping Celery processes...")
        worker_process.terminate()
        beat_process.terminate()
        print("✅ Celery processes stopped")

if __name__ == "__main__":
    main() 