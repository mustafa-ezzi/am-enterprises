"""
Django settings for AM Enterprises.
"""

from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-am-enterprises-dev-only-change-in-production",
)

DEBUG = os.getenv("DJANGO_DEBUG", "true").lower() in ("1", "true", "yes")

def _normalize_allowed_host(value: str) -> str:
    """Accept hostnames; strip accidental scheme/path from env values."""
    h = value.strip()
    if "://" in h:
        h = h.split("://", 1)[1]
    h = h.split("/")[0].split("?")[0]
    # Host header never includes a port in Railway's check the same way, but strip if present
    if h.startswith("[") and "]" in h:
        return h  # IPv6 literal
    return h.split(":")[0] if h.count(":") == 1 and h.rsplit(":", 1)[-1].isdigit() else h


ALLOWED_HOSTS = [
    host
    for host in (
        _normalize_allowed_host(h)
        for h in os.getenv(
            "DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1,.railway.app"
        ).split(",")
        if h.strip()
    )
    if host
]
# Railway public domains (safe default if env only lists localhost)
if ".railway.app" not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(".railway.app")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "corsheaders",
    "rest_framework",
    "django_filters",
    "drf_spectacular",
    # Local
    "apps.accounts",
    "apps.catalog",
    "apps.content",
    "apps.cart",
    "apps.orders",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# SQLite locally; Postgres on Railway when DATABASE_URL is set
_database_url = os.getenv("DATABASE_URL", "").strip()
if _database_url:
    import dj_database_url

    DATABASES = {
        "default": dj_database_url.config(
            default=_database_url,
            conn_max_age=600,
            ssl_require=os.getenv("DATABASE_SSL_REQUIRE", "true").lower()
            in ("1", "true", "yes"),
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = os.getenv("DJANGO_TIME_ZONE", "Asia/Karachi")
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Trust Railway / reverse-proxy HTTPS
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "accounts.User"

def _normalize_origin(value: str) -> str:
    """scheme://host[:port] with no trailing slash/path."""
    o = value.strip().rstrip("/")
    if "://" not in o:
        return o
    scheme, rest = o.split("://", 1)
    host = rest.split("/")[0]
    return f"{scheme}://{host}"


# CORS — React Vite dev + Railway frontend
CORS_ALLOWED_ORIGINS = [
    origin
    for origin in (
        _normalize_origin(o)
        for o in os.getenv(
            "CORS_ALLOWED_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if o.strip()
    )
    if origin
]
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    origin
    for origin in (
        _normalize_origin(o)
        for o in os.getenv(
            "CSRF_TRUSTED_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if o.strip()
    )
    if origin
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "config.pagination.FlexiblePagination",
    "PAGE_SIZE": 12,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "AM Enterprises API",
    "DESCRIPTION": "Household products e-commerce API — Your trust, our commitment",
    "VERSION": "0.1.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

# Brand defaults
SITE_NAME = "AM Enterprises"
SITE_SLOGAN = "Your trust, our commitment"
DEFAULT_CURRENCY = os.getenv("DEFAULT_CURRENCY", "PKR")

# Commerce
SHIPPING_STANDARD = os.getenv("SHIPPING_STANDARD", "250.00")
SHIPPING_EXPRESS = os.getenv("SHIPPING_EXPRESS", "550.00")

# Email — console backend for Phase 4
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend",
)
DEFAULT_FROM_EMAIL = os.getenv(
    "DEFAULT_FROM_EMAIL",
    "AM Enterprises <noreply@amenterprises.local>",
)

# Cloudflare R2 — binary files in bucket; Railway DB stores URLs only
CLOUDFLARE_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID", "")
CLOUDFLARE_R2_ACCESS_KEY_ID = os.getenv("CLOUDFLARE_R2_ACCESS_KEY_ID", "")
CLOUDFLARE_R2_SECRET_ACCESS_KEY = os.getenv("CLOUDFLARE_R2_SECRET_ACCESS_KEY", "")
CLOUDFLARE_R2_BUCKET = os.getenv("CLOUDFLARE_R2_BUCKET", "am-media")
CLOUDFLARE_R2_PUBLIC_BASE_URL = os.getenv("CLOUDFLARE_R2_PUBLIC_BASE_URL", "").rstrip("/")
CLOUDFLARE_R2_ENDPOINT = os.getenv("CLOUDFLARE_R2_ENDPOINT", "").rstrip("/")
