import logging
from sqlalchemy import or_
from flask import Blueprint, abort, jsonify, request
from flask_login import current_user, login_required

from app import db
from app.exceptions import ValidationError
from app.models.conversation import Conversation
from app.models.message import Message
from app.serde import (
    ConversationSchema,
    MessageSchema,
    NewConversationSchema,
    MessagesToRead,
)
from app.utils import extract_all_errors

logger = logging.getLogger(__name__)

conversations = Blueprint("conversations", __name__, url_prefix="/conversations")


@conversations.route("", methods=["GET", "POST"])
@login_required
def get_or_create_conversations():
    if request.method == "GET":
        data = [
            {
                "messages": [
                    MessageSchema().dump(message)
                    for message in conversation.get_messages(10, current_user.id)
                ],
                **ConversationSchema().dump(conversation),
            }
            for conversation in db.session.query(Conversation)
            .filter(
                or_(
                    Conversation.recipient_id == current_user.id,
                    Conversation._sender_id == current_user.id,
                )
            )
            .all()
        ]
        return jsonify(data)
    elif request.method == "POST":
        payload = request.get_json()
        try:
            data = NewConversationSchema().load(payload)
        except ValidationError as err:
            abort(422, extract_all_errors(err))

        if Conversation.conversation_exists(current_user.id, data["recipient_id"]):
            abort(400, "Conversation already exists")

        conversation = Conversation(
            _sender_id=current_user.id, recipient_id=data["recipient_id"]
        )
        db.session.add(conversation)
        db.session.commit()

        message = Message(
            body=data["message_body"],
            sender_id=current_user.id,
            conversation_id=conversation.id,
        )
        db.session.add(message)
        db.session.commit()

        return jsonify(
            {
                **ConversationSchema().dump(conversation),
                "messages": [MessageSchema().dump(message)],
            }
        )


@conversations.route("/<conversation_id>", methods=["GET", "POST"])
@login_required
def get_or_update_conversation(conversation_id):
    conversation = Conversation.query.get(conversation_id)
    if not conversation:
        abort(400, "Conversation does not exist")

    if request.method == "GET":
        messages_limt = request.args.get("limit", 10)
        messages = [
            MessageSchema().dump(message)
            for message in conversation.get_messages(messages_limt, current_user.id)
        ]

        return jsonify(messages)
    elif request.method == "POST":
        payload = request.get_json()
        try:
            data = MessageSchema().load(payload)
        except ValidationError as err:
            abort(422, extract_all_errors(err))

        message = Message(
            **data, sender_id=current_user.id, conversation_id=conversation_id
        )
        db.session.add(message)
        db.session.commit()

        return jsonify(MessageSchema().dump(message))


@conversations.route("/messages/read", methods=["POST"])
@login_required
def read_messages():
    payload = request.get_json()
    try:
        data = MessagesToRead().load(payload)
    except ValidationError as err:
        abort(422, extract_all_errors(err))

    messages = []
    msgs_non_existent = []
    msgs_read = []

    for msg_id in data["ids"]:
        msg = Message.query.get(msg_id)
        if msg is None:
            msgs_non_existent.append(str(msg_id))
        elif msg.read:
            msgs_read.append(str(msg_id))
        else:
            messages.append(msg)

    if msgs_non_existent:
        abort(400, f"Messages {','.join(msgs_non_existent)} are not exist")

    if msgs_read:
        abort(400, f"Messages {','.join(msgs_read)} are already read")

    for msg in messages:
        msg.read = True

    db.session.add_all(messages)
    db.session.commit()

    return jsonify({"message": "Messages has been read"})
