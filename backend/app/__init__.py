from flask import Flask
from flask_cors import CORS
from flask_login import LoginManager
from flask_mail import Mail
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
from celery import Celery

from config import config, CELERY_CONFIG

mail = Mail()
db = SQLAlchemy()
socketio = SocketIO()
session = Session()
login_manager = LoginManager()


def make_celery(app):
    celery = Celery(app.import_name)
    celery.conf.update(CELERY_CONFIG)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery


def create_celery_app(config_name):
    app = Flask(__name__)

    app.config.from_object(config[config_name])
    mail.init_app(app)
    db.init_app(app)

    return app


def create_app(config_name):
    app = Flask(__name__)

    app.config.from_object(config[config_name])
    config[config_name].init_app(app)

    client = app.config.get("APP_URL")
    cors_config = {"origins": [client]}

    CORS(app, resources={"/*": cors_config}, supports_credentials=True)

    mail.init_app(app)
    db.init_app(app)
    session.init_app(app)
    login_manager.init_app(app)
    socketio.init_app(
        app,
        cors_allowed_origins=client,
        async_mode="eventlet",
        manage_session=False,
        engineio_logger=True,
    )

    from app.api import api as api_blueprint
    from app.api.users import users as users_blueprint
    from app.api.health import health as health_blueprint
    from app.api.relationships import relationships as relationships_blueprint
    from app.api.search import search as search_blueprint
    from app.api.conversations import conversations as conversations_blueprint

    api_blueprint.register_blueprint(users_blueprint)
    api_blueprint.register_blueprint(health_blueprint)
    api_blueprint.register_blueprint(relationships_blueprint)
    api_blueprint.register_blueprint(search_blueprint)
    api_blueprint.register_blueprint(conversations_blueprint)

    app.register_blueprint(api_blueprint)

    return app
