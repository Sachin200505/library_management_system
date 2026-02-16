import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'replace-me-in-env')
DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'
_default_hosts = [
    'localhost',
    '127.0.0.1',
    '.vercel.app',
    '.onrender.com',
    'library-management-system-glsx.onrender.com',
]
_env_hosts = [host.strip() for host in os.environ.get('DJANGO_ALLOWED_HOSTS', '').split(',') if host.strip()]
ALLOWED_HOSTS = list(dict.fromkeys(_env_hosts + _default_hosts))

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'accounts',
    'books',
    'transactions',
    'book_suggestions',
    'notifications',
    'reservations',
    'reviews',
    'analytics',
    'reports',
    'profile',
    'system_settings',
    'return_extensions',
    'fine_payments',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'library_management_system.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'notifications.context_processors.unread_count',
            ],
        },
    },
]

WSGI_APPLICATION = 'library_management_system.wsgi.application'

_supabase_host = os.environ.get('SUPABASE_DB_HOST')
if _supabase_host:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('SUPABASE_DB_NAME', 'postgres'),
            'USER': os.environ.get('SUPABASE_DB_USER', 'postgres'),
            'PASSWORD': os.environ.get('SUPABASE_DB_PASSWORD', ''),
            'HOST': _supabase_host,
            'PORT': os.environ.get('SUPABASE_DB_PORT', '5432'),
            'OPTIONS': {
                'sslmode': os.environ.get('SUPABASE_SSL_MODE', 'require'),
            },
        }
    }
else:
    # Fallback during build/collectstatic when Supabase env vars are unavailable
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = os.environ.get('DJANGO_TIME_ZONE', 'UTC')
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGIN_URL = 'accounts:login'
LOGIN_REDIRECT_URL = 'accounts:dashboard'
LOGOUT_REDIRECT_URL = 'accounts:login'

SESSION_COOKIE_AGE = int(os.environ.get('DJANGO_SESSION_AGE', 60 * 60 * 24))
SESSION_SAVE_EVERY_REQUEST = True

FINE_PER_DAY = float(os.environ.get('LIBRARY_FINE_PER_DAY', 5))
ISSUE_DURATION_DAYS = int(os.environ.get('LIBRARY_ISSUE_DURATION_DAYS', 14))
