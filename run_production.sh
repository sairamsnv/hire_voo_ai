#!/bin/bash

# Set environment to production
export DJANGO_ENVIRONMENT=production

# Run the Django server with production settings
echo "🚀 Starting production server (local testing)..."
python3 manage.py runserver 