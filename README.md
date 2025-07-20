# Hire Voo AI - Django + React Application

A modern web application built with Django backend and React frontend for AI-powered hiring solutions.

## 🚀 Features

- **User Authentication & Authorization**
- **Admin User Management**
- **Session Management**
- **Security Monitoring**
- **API Rate Limiting**
- **Two-Factor Authentication**
- **Email Verification**
- **Responsive Design**

## 📋 Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL (for production)
- Redis (optional, for caching)

## 🛠️ Local Development Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd hire_voo_ai-4
```

### 2. Set up Python environment
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Set up environment variables
Create a `.env` file in the root directory:
```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your settings
```

### 4. Run database migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create a superuser
```bash
python manage.py createsuperuser
```

### 6. Build the React frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### 7. Run the development server
```bash
# For local development
python manage.py runserver --settings=hire_voo_ai.settings.local

# Or simply (defaults to local)
python manage.py runserver
```

## 🌐 Production Deployment (Heroku)

### 1. Install Heroku CLI
```bash
# macOS
brew install heroku/brew/heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

### 2. Login to Heroku
```bash
heroku login
```

### 3. Create Heroku app
```bash
heroku create your-app-name
```

### 4. Add PostgreSQL addon
```bash
heroku addons:create heroku-postgresql:mini
```

### 5. Set environment variables
```bash
heroku config:set DJANGO_ENVIRONMENT=production
heroku config:set SECRET_KEY=your-secure-secret-key
heroku config:set ALLOWED_HOSTS=your-app-name.herokuapp.com
heroku config:set PRODUCTION_DOMAIN=your-domain.com
heroku config:set EMAIL_HOST_USER=your-email@gmail.com
heroku config:set EMAIL_HOST_PASSWORD=your-app-password
```

### 6. Deploy to Heroku
```bash
# Build the frontend
cd frontend
npm run build
cd ..

# Commit changes
git add .
git commit -m "Deploy to Heroku"

# Push to Heroku
git push heroku main
```

### 7. Run migrations on Heroku
```bash
heroku run python manage.py migrate
```

### 8. Create superuser on Heroku
```bash
heroku run python manage.py createsuperuser
```

## 🔧 Configuration

### Settings Structure
- `hire_voo_ai/settings/base.py` - Common settings
- `hire_voo_ai/settings/local.py` - Local development settings
- `hire_voo_ai/settings/production.py` - Production settings

### Environment Variables
- `DJANGO_ENVIRONMENT` - Set to 'local' or 'production'
- `SECRET_KEY` - Django secret key
- `DATABASE_URL` - Database connection string
- `EMAIL_HOST_USER` - Email username
- `EMAIL_HOST_PASSWORD` - Email password
- `ALLOWED_HOSTS` - Comma-separated list of allowed hosts
- `PRODUCTION_DOMAIN` - Your production domain
- `SENTRY_DSN` - Sentry DSN for error tracking

## 📁 Project Structure
```
hire_voo_ai-4/
├── accounts/                 # User management app
├── frontend/                 # React frontend
├── hire_voo_ai/             # Django project
│   ├── settings/            # Settings package
│   │   ├── base.py         # Base settings
│   │   ├── local.py        # Local settings
│   │   └── production.py   # Production settings
│   ├── urls.py             # URL configuration
│   └── wsgi.py             # WSGI configuration
├── manage.py               # Django management script
├── requirements.txt        # Python dependencies
├── Procfile               # Heroku deployment
├── runtime.txt            # Python runtime version
└── README.md              # This file
```

## 🔒 Security Features

- **CSRF Protection**
- **Session Security**
- **Rate Limiting**
- **SQL Injection Protection**
- **XSS Protection**
- **Security Headers**
- **Two-Factor Authentication**
- **Account Lockout Protection**

## 🚀 API Endpoints

### Authentication
- `POST /api/login/` - User login
- `POST /api/logout/` - User logout
- `POST /api/register/` - User registration
- `GET /api/session/` - Session check

### Admin Management
- `GET /api/admin/users/` - List all users
- `GET /api/admin/users/analytics/` - User analytics
- `POST /api/admin/users/{id}/delete/` - Delete user
- `PUT /api/admin/users/{id}/` - Update user

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support, email support@hirevoo.ai or create an issue in the repository. 