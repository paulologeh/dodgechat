import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "hard to guess string"
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.googlemail.com")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", True)
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    DODGECHAT_MAIL_SUBJECT_PREFIX = "[Dodgechat]"
    DODGECHAT_MAIL_SENDER = "Dodgechat Admin <dodgechatapp@gmail.com>"
    DODGECHAT_ADMIN = os.environ.get("DODGECHAT_ADMIN")
    SSL_REDIRECT = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_RECORD_QUERIES = True
    DODGECHAT_SLOW_DB_QUERY_TIME = 0.5
    FRONT_END_URL = os.getenv("FRONT_END_URL", "http://localhost:8080")

    @staticmethod
    def init_app(app):
        pass


class DevelopmentConfig(Config):
    DEBUG = True
    CORS_HEADERS = "Content-Type"
    SQLALCHEMY_DATABASE_URI = os.environ.get("DEV_DATABASE_URL")

    @staticmethod
    def get_front_end():
        return os.getenv("FRONT_END_URL", "http://localhost:8080")


class TestConfig(Config):
    TESTING = True
    DEBUG = False
    SECRET_KEY = os.environ.get("SECRET_KEY") or "hard to guess string"
    SQLALCHEMY_DATABASE_URI = os.environ.get("TEST_DATABASE_URL")


config = {"DEVELOPMENT": DevelopmentConfig, "TESTING": TestConfig}
