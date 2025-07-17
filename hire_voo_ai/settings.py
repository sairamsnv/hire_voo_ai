import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'your-secret-key'
DEBUG = True

ALLOWED_HOSTS = ['127.0.0.1', 'localhost',' http://localhost:8080/']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'accounts',
    'rest_framework',
    'corsheaders', 
    'rest_framework.authtoken',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
AUTHENTICATION_BACKENDS = [
    'accounts.backends.EmailBackend',  # ✅ Correct place
    'django.contrib.auth.backends.ModelBackend',
]


ROOT_URLCONF = 'hire_voo_ai.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'frontend' / 'dist'  # 👈 React build directory
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'hire_voo_ai.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True



# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS Settings - Updated to support port 8080
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",      # <-- add this
    "http://127.0.0.1:5173",
    "http://192.168.31.183:8080"
]

# CSRF Settings - Updated to support port 8080
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",      # <-- add this
    "http://127.0.0.1:5173",
    "http://192.168.31.183:8080"
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'cookie',  # Important for session handling
]
CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

# Session Configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_NAME = 'sessionid'
SESSION_COOKIE_AGE = 1209600  # 2 weeks
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
SESSION_COOKIE_SAMESITE = 'Lax'  # Important for cross-origin requests
SESSION_SAVE_EVERY_REQUEST = True  # Ensure session is saved on every request


CSRF_COOKIE_NAME = 'csrftoken'
CSRF_COOKIE_HTTPONLY = False  # Must be False so JavaScript can read it
CSRF_COOKIE_SECURE = False  # Set to True in production with HTTPS
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_HEADER_NAME = 'HTTP_X_CSRFTOKEN'
CSRF_USE_SESSIONS = False  # Use cookie-based CSRF tokens

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    # Add this for better error handling
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
}

AUTH_USER_MODEL = 'accounts.User'

# Sentry integration
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

dsn = os.getenv("SENTRY_DSN")
if dsn:
    sentry_sdk.init(
        dsn=dsn, 
        integrations=[DjangoIntegration()],
        traces_sample_rate=1.0,
        send_default_pii=True,
    )

# Logging for debugging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django.request': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}



# Static files (React + Django)
STATIC_URL = '/static/'
STATICFILES_DIRS = (
    BASE_DIR.joinpath('frontend', 'dist'),
)
REACT_BUILD_DIR = os.path.join(BASE_DIR, 'frontend', 'dist')


#for the production env
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

import certifi
EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'sayypureddysairam96@gmail.com'
EMAIL_HOST_PASSWORD = 'acic pcqo htqs yjex'
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_SSL_CERTFILE = certifi.where()



