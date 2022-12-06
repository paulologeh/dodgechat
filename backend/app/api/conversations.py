import logging
from sqlalchemy import or_
from flask import Blueprint, abort, jsonify, request
from flask_login import current_user, login_required

from app import db
from app.exceptions import ValidationError
from app.models.conversation import Conversation
from app.models.message import Message
from app.serde import ConversationSchema, MessageSchema, NewConversationSchema
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
                    for message in db.session.query(Message)
                    .filter(Message.conversation_id == conversation.id)
                    .order_by(Message.created_at.desc())
                    .limit(10)
                    .all()
                ],
                **ConversationSchema().dump(conversation),
            }
            for conversation in db.session.query(Conversation)
            .filter(
                or_(
                    Conversation.recipient_id == current_user.id,
                    Conversation.sender_id == current_user.id,
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

        conversation = Conversation.query.filter_by(
            _sender_id=current_user.id, recipient_id=data["recipient_id"]
        ).first()
        if conversation:
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
            for message in db.session.query(Message)
            .filter(Message.conversation_id == conversation.id)
            .order_by(Message.created_at.desc())
            .limit(messages_limt)
            .all()
        ]

        return jsonify(messages)
    elif request.method == "POST":
        payload = request.get_json()
        try:
            data = MessageSchema().load(payload)
        except ValidationError as err:
            abort(422, extract_all_errors(err))

        message = Message(**data, conversation_id=conversation_id)
        db.session.add(message)
        db.session.commit()

        return jsonify(MessageSchema().dump(message))


@conversations.route("/messages/<message_id>/read", methods=["POST"])
@login_required
def read_message(message_id):
    message = Message.query.get(message_id)

    if not message:
        abort(400, "Message does not exist")

    if message.read:
        abort(400, "Messge already read")

    message.read = True

    db.session.add(message)
    db.session.commit()

    return jsonify({"message": "Message has been read"})
