#!/usr/bin/env python3
"""
Quick Start Script for Job Scraping System
"""
import sys
import os
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Import and run the job scraper startup
from job_scraper.start_celery import main

if __name__ == "__main__":
    main() 