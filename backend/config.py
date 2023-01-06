import os
import redis
from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))

CELERY_CONFIG = {
    "broker_url": os.environ.get("REDIS_URI"),
    "result_backend": os.environ.get("REDIS_URI"),
    "imports": ("app.tasks",),
    "accept_content": ["json", "pickle"],
}


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY")
    SSL_REDIRECT = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_RECORD_QUERIES = True
    DODGECHAT_SLOW_DB_QUERY_TIME = 60
    FRONT_END_URL = os.getenv("FRONT_END_URL")
    SQLALCHEMY_DATABASE_URI = (
        f'{os.environ.get("POSTGRESQL_URI")}/{os.environ.get("POSTGRES_DB")}'
    )
    SESSION_TYPE = "redis"
    SESSION_PERMANENT = True
    SESSION_USE_SIGNER = True
    SESSION_REDIS = redis.from_url(os.environ.get("REDIS_URI"))
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
    MAIL_PORT = int(os.environ.get("MAIL_PORT"))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS")
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    DODGECHAT_ADMIN = os.environ.get("DODGECHAT_ADMIN")
    SESSION_COOKIE_SECURE = True


config = {
    "DEVELOPMENT": DevelopmentConfig,
    "TESTING": TestConfig,
    "PRODUCTION": ProductionConfig,
}
