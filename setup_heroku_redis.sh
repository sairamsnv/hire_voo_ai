#!/bin/bash

echo "🔴 Setting up Heroku with Redis for Job Scraping System"
echo "======================================================"

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Installing..."
    brew tap heroku/brew && brew install heroku
fi

# Check if logged in
if ! heroku auth:whoami &> /dev/null; then
    echo "❌ Not logged in to Heroku. Please run: heroku login"
    exit 1
fi

# Get app name
read -p "Enter your Heroku app name: " APP_NAME

echo "📦 Setting up Heroku app: $APP_NAME"

# Create app if it doesn't exist
if ! heroku apps:info --app $APP_NAME &> /dev/null; then
    echo "Creating new Heroku app..."
    heroku create $APP_NAME
else
    echo "Using existing app..."
    heroku git:remote -a $APP_NAME
fi

# Add PostgreSQL
echo "🗄️ Adding PostgreSQL database..."
heroku addons:create heroku-postgresql:mini --app $APP_NAME

# Add Redis (This is what you need!)
echo "🔴 Adding Redis for Celery and caching..."
heroku addons:create heroku-redis:mini --app $APP_NAME

# Set environment variables
echo "⚙️ Setting environment variables..."
heroku config:set DJANGO_SETTINGS_MODULE=hire_voo_ai.settings --app $APP_NAME
heroku config:set DEBUG=False --app $APP_NAME
heroku config:set SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(50))') --app $APP_NAME

# Set Redis URLs
echo "🔗 Setting Redis URLs..."
REDIS_URL=$(heroku config:get REDIS_URL --app $APP_NAME)
heroku config:set CELERY_BROKER_URL=$REDIS_URL --app $APP_NAME
heroku config:set CELERY_RESULT_BACKEND=$REDIS_URL --app $APP_NAME
heroku config:set REDIS_CACHE_URL=$REDIS_URL --app $APP_NAME

# Deploy code
echo "📤 Deploying code..."
git add .
git commit -m "Deploy job scraping system with Redis support"
git push heroku main

# Run migrations
echo "🗃️ Running database migrations..."
heroku run python manage.py migrate --app $APP_NAME

# Scale dynos
echo "⚡ Scaling dynos..."
heroku ps:scale web=1 worker=1 beat=1 --app $APP_NAME

echo "✅ Heroku Redis setup complete!"
echo "🌐 Your app is available at: https://$APP_NAME.herokuapp.com"
echo "🔴 Redis URL: $REDIS_URL"
echo "📊 Check logs with: heroku logs --tail --app $APP_NAME"
echo "🔧 Monitor dynos with: heroku ps --app $APP_NAME" 