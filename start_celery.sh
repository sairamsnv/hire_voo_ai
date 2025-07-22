#!/bin/bash

# Start Celery Worker and Beat Scheduler
echo "Starting Celery Worker and Beat Scheduler..."

# Start Celery Worker in background
celery -A hire_voo_ai worker --loglevel=info --detach

# Start Celery Beat Scheduler in background
celery -A hire_voo_ai beat --loglevel=info --detach

echo "Celery Worker and Beat Scheduler started successfully!"
echo "Check logs with: tail -f celery.log"
echo "Stop with: pkill -f celery" 