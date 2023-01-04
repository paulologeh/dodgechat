import logging
from app import socketio
from flask_login import current_user

logger = logging.getLogger(__name__)


def conversation_changed_event(data):
    socketio.emit("message", {"data": data}, namespace="/")


@socketio.event
def connect():
    if current_user.is_authenticated:
        logger.info("Client connected - id:%s" % current_user.id)
    else:
        return False


@socketio.event()
def disconnect():
    if getattr(current_user, "id", None) is not None:
        logger.info("Client disconnected - id:%s" % current_user.id)
    else:
        logger.warning("Client disconnected - id:Unknown")
