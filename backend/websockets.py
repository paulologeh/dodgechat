import logging
from app import socketio
from flask_login import current_user
from flask import request

logger = logging.getLogger(__name__)

ACTIVE_CLIENTS = {}


def send_event_to_client(data, user_id):
    client_sid = ACTIVE_CLIENTS.get(user_id)
    # send update to client only if it is active
    if client_sid:
        try:
            socketio.emit("message", {"data": data}, namespace="/", to=client_sid)
        except Exception as e:
            logger.exception("Failed to notify client of update %s" % e)


@socketio.event
def connect():
    if current_user.is_authenticated:
        ACTIVE_CLIENTS.update({current_user.id: request.sid})
        logger.info("Client connected - id:%s" % current_user.id)
    else:
        return False


@socketio.event()
def disconnect():
    if getattr(current_user, "id", None) is not None:
        if current_user.id in ACTIVE_CLIENTS:
            ACTIVE_CLIENTS.pop(current_user.id)
        logger.info("Client disconnected - id:%s" % current_user.id)
    else:
        logger.warning("Client disconnected - id:Unknown")
