from flask import Flask
from flask_cors import CORS
from flask_login import LoginManager
from flask_mail import Mail
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy

from config import config

mail = Mail()
db = SQLAlchemy()
socketio = SocketIO()

login_manager = LoginManager()


def create_app(config_name):
    app = Flask(__name__)

    app.config.from_object(config[config_name])
    config[config_name].init_app(app)

    cors_config = {"origins": ["http://localhost:8080"]}

    CORS(app, resources={"/*": cors_config}, supports_credentials=True)

    mail.init_app(app)
    db.init_app(app)
    login_manager.init_app(app)
    # socketio.init_app(app)

    from app.api import api as api_blueprint
    from app.api.auth import auth as auth_blueprint
    from app.api.health import health as health_blueprint
    from app.api.relationships import relationships as relationships_blueprint
    from app.api.search import search as search_blueprint

    api_blueprint.register_blueprint(auth_blueprint)
    api_blueprint.register_blueprint(health_blueprint)
    api_blueprint.register_blueprint(relationships_blueprint)
    api_blueprint.register_blueprint(search_blueprint)

    app.register_blueprint(api_blueprint)

    return app