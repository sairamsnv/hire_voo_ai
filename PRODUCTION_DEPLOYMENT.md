# 🚀 Production Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] PostgreSQL database configured
- [ ] Domain name purchased and configured
- [ ] SSL certificate obtained
- [ ] Environment variables set up
- [ ] Static files built

### 2. Security Requirements
- [ ] Strong SECRET_KEY generated
- [ ] DEBUG set to False
- [ ] ALLOWED_HOSTS configured
- [ ] HTTPS enabled
- [ ] Security headers configured

---

## ⚙️ Settings.py Changes for Production

### 1. Basic Settings
```python
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-actual-secret-key-here')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = [
    'yourdomain.com',
    'www.yourdomain.com',
    'your-production-ip.com'
]
```

### 2. Database Configuration
```python
# Use environment variables for database credentials
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'hire_voo_ai'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'your-db-password'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}
```

### 3. Security Settings
```python
# HTTPS Settings
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Cookie Settings
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False
```

### 4. CORS & CSRF Settings
```python
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]

CSRF_TRUSTED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]
```

### 5. Email Configuration
```python
# Production Email Settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', 'sayypureddysairam96@gmail.com')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', 'your-app-password')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
```

### 6. Static Files
```python
# Static files configuration
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# React build directory
STATICFILES_DIRS = (
    BASE_DIR.joinpath('frontend', 'dist'),
)
```

### 7. Logging Configuration
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
        },
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['file', 'console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

---

## 🔧 Environment Variables (.env)

Create a `.env` file in your production server:

```bash
# Django Settings
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DB_NAME=hire_voo_ai
DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_HOST=localhost
DB_PORT=5432

# Email
EMAIL_HOST_USER=sayypureddysairam96@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password

# Sentry (Optional)
SENTRY_DSN=your-sentry-dsn-here
```

---

## 🚀 Deployment Steps

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install python3 python3-pip python3-venv postgresql postgresql-contrib nginx git

# Create project directory
mkdir /var/www/hire_voo_ai
cd /var/www/hire_voo_ai
```

### 2. Python Environment
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Database Setup
```bash
# Create database
sudo -u postgres psql
CREATE DATABASE hire_voo_ai;
CREATE USER hire_voo_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE hire_voo_ai TO hire_voo_user;
\q
```

### 4. Django Setup
```bash
# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Create logs directory
mkdir logs
```

### 5. Gunicorn Setup
```bash
# Install gunicorn
pip install gunicorn

# Create gunicorn service file
sudo nano /etc/systemd/system/hire_voo_ai.service
```

**Gunicorn Service File:**
```ini
[Unit]
Description=Hire Voo AI Gunicorn daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/hire_voo_ai
Environment="PATH=/var/www/hire_voo_ai/venv/bin"
ExecStart=/var/www/hire_voo_ai/venv/bin/gunicorn --workers 3 --bind unix:/var/www/hire_voo_ai/hire_voo_ai.sock hire_voo_ai.wsgi:application

[Install]
WantedBy=multi-user.target
```

### 6. Nginx Configuration
```bash
# Create nginx config
sudo nano /etc/nginx/sites-available/hire_voo_ai
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /var/www/hire_voo_ai;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/hire_voo_ai/hire_voo_ai.sock;
    }
}
```

### 7. Start Services
```bash
# Start gunicorn
sudo systemctl start hire_voo_ai
sudo systemctl enable hire_voo_ai

# Enable nginx site
sudo ln -s /etc/nginx/sites-available/hire_voo_ai /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔍 Post-Deployment Checklist

### 1. Functionality Tests
- [ ] Website loads correctly
- [ ] User registration works
- [ ] Email verification works
- [ ] Login/logout works
- [ ] Admin panel accessible
- [ ] Static files served correctly

### 2. Security Tests
- [ ] HTTPS redirects working
- [ ] Security headers present
- [ ] CSRF protection working
- [ ] No DEBUG information exposed

### 3. Performance Tests
- [ ] Database queries optimized
- [ ] Static files compressed
- [ ] Caching configured (if needed)
- [ ] Load testing completed

---

## 🛠️ Maintenance Commands

### Database Backup
```bash
pg_dump hire_voo_ai > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Update Application
```bash
cd /var/www/hire_voo_ai
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart hire_voo_ai
```

### View Logs
```bash
# Application logs
tail -f /var/www/hire_voo_ai/logs/django.log

# Gunicorn logs
sudo journalctl -u hire_voo_ai

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔧 Troubleshooting

### Common Issues:

1. **Static files not loading**
   - Check STATIC_ROOT path
   - Run `python manage.py collectstatic`
   - Check nginx static file configuration

2. **Database connection errors**
   - Verify database credentials
   - Check PostgreSQL service status
   - Ensure database exists

3. **Email not sending**
   - Check Gmail app password
   - Verify EMAIL_HOST settings
   - Check firewall settings

4. **Permission errors**
   - Ensure www-data user has proper permissions
   - Check file ownership in project directory

---

## 📞 Support

For deployment issues:
1. Check logs for error messages
2. Verify all environment variables are set
3. Ensure all services are running
4. Test each component individually

**Remember:** Always backup your database before making changes! 