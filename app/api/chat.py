import logging
import functools
from datetime import datetime
from flask_login import current_user
from flask_socketio import disconnect, emit
from app import socketio, db
from app.models.user import User

logger = logging.getLogger(__name__)


def authenticated_only(f):
    @functools.wraps(f)
    def wrapped(*args, **kwargs):
        if not current_user.is_authenticated:
            discconnect_handler()
        else:
            return f(*args, **kwargs)

    return wrapped


@socketio.on("connect")
@authenticated_only
def connect_handler():
    logging.debug("Connected client %s", current_user.id)
    emit("my response", {"data": "Connected"})


@socketio("disconnect")
def discconnect_handler():
    logging.debug("Disconnected client %s", current_user.id)
    return False


@socketio("pong")
@authenticated_only
def app_pong():
    user = User.query.filter_by(id=current_user.id).first()
    user.last_seen = datetime.utcnow()
    db.session.add(user)
    db.session.commit()
    logging.debug("Pong from client %s", current_user.id)
