#!/usr/bin/env python3
"""
Test Script for Job Scraping System
"""
import sys
import os
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Import and run the job scraper test
from job_scraper.utils import test_celery_setup

if __name__ == "__main__":
    test_celery_setup() 