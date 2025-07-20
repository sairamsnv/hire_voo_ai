#!/bin/bash

# Set environment to local
export DJANGO_ENVIRONMENT=local

# Run the Django development server
echo "🔧 Starting local development server..."
python3 manage.py runserver 