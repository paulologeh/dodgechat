import os
import redis
from datetime import timedelta

from app.utils import get_database_uri, get_redis_uri

basedir = os.path.abspath(os.path.dirname(__file__))


CELERY_CONFIG = {
    "broker_url": get_redis_uri(),
    "result_backend": get_redis_uri(),
    "imports": ("app.tasks",),
    "accept_content": ["json", "pickle"],
}


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY")
    SSL_REDIRECT = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_RECORD_QUERIES = True
    DODGECHAT_SLOW_DB_QUERY_TIME = 60
    APP_URL = os.getenv("APP_URL")
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SESSION_TYPE = "redis"
    SESSION_PERMANENT = True
    SESSION_USE_SIGNER = True
    SESSION_REDIS = redis.from_url(get_redis_uri())
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=20)

    @staticmethod
    def init_app(app):
        pass


class DevelopmentConfig(Config):
    DEVELOPMENT = True
    DEBUG = True
    CORS_HEADERS = "Content-Type"


class TestConfig(Config):
    TESTING = True
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("TEST_DATABASE_URL")


class ProductionConfig(Config):
    DEBUG = False
    PRODUCTION = True
    CORS_HEADERS = "Content-Type"
    MAIL_SERVER = os.environ.get("MAIL_SERVER")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 537))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    DODGECHAT_ADMIN = os.environ.get("DODGECHAT_ADMIN")
    SESSION_COOKIE_SECURE = True


config = {
    "DEVELOPMENT": DevelopmentConfig,
    "TESTING": TestConfig,
    "PRODUCTION": ProductionConfig,
}
