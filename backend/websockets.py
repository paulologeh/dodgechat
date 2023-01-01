import logging
from app import socketio
from flask_socketio import emit

logger = logging.getLogger(__name__)


def conversation_changed_event(data):
    socketio.emit("message", {"data": data}, namespace="/")


@socketio.event
def connect():
    emit("connect", {"data": "Connected"})
    logger.info("Client connected")


@socketio.event()
def disconnect():
    logger.info("Client disconnected")
