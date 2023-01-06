import logging
from sqlalchemy import or_
from flask import Blueprint, abort, jsonify, request
from flask_login import current_user, login_required
from datetime import datetime

from app import db
from app.exceptions import ValidationError
from app.models.conversation import Conversation
from app.models.message import Message
from app.serde import (
    ConversationSchema,
    MessageSchema,
    NewConversationSchema,
    Messages,
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
                    for message in conversation.get_messages(current_user.id)
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
        db.session.flush()

        if not conversation.are_friends():
            db.session.rollback()
            abort(400, "You cannot message this user as you are not friends")

        message = Message(
            body=data["message_body"],
            sender_id=current_user.id,
            conversation_id=conversation.id,
        )
        db.session.add(message)
        db.session.commit()

        client_user_id = conversation.recipient_id
        event_data = {"id": str(conversation.id), "kind": "NEW", "name": "conversation"}
        from websockets import send_event_to_client

        send_event_to_client(event_data, client_user_id)

        return jsonify(
            {
                **ConversationSchema().dump(conversation),
                "messages": [MessageSchema().dump(message)],
            }
        )


@conversations.route("/<conversation_id>", methods=["GET", "POST", "DELETE"])
@login_required
def get_or_update_or_remove_conversation(conversation_id):
    conversation = Conversation.query.get(conversation_id)
    if not conversation:
        abort(400, "Conversation does not exist")

    client_user_id = (
        conversation.recipient_id
        if current_user.id == conversation.sender_id
        else conversation.sender_id
    )

    if request.method == "GET":
        messages_limt = int(request.args.get("limit", 10))
        timestamp = request.args.get("timestamp")
        if timestamp:
            timestamp = datetime.fromisoformat(timestamp)

        messages = [
            MessageSchema().dump(message)
            for message in conversation.get_messages(
                current_user.id, messages_limt, timestamp
            )
        ]

        return jsonify(
            {**ConversationSchema().dump(conversation), "messages": messages}
        )
    elif request.method == "POST":
        if not conversation.are_friends():
            abort(400, "You cannot message this user as you are not friends")

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

        event_data = {
            "id": str(conversation.id),
            "kind": "UPDATE",
            "name": "conversation",
        }

        from websockets import send_event_to_client

        send_event_to_client(event_data, client_user_id)

        return jsonify(MessageSchema().dump(message))
    elif request.method == "DELETE":
        if (
            current_user.id == conversation.sender_id
            or current_user.id == conversation.recipient_id
        ):
            db.session.delete(conversation)
            db.session.commit()

            event_data = {
                "id": str(conversation.id),
                "kind": "DELETE",
                "name": "conversation",
            }

            from websockets import send_event_to_client

            send_event_to_client(event_data, client_user_id)

            return jsonify({"message": "Deleted conversation"})
        else:
            abort(400, "You do not have permission to delete this conversation")


@conversations.route("/messages/delete", methods=["DELETE"])
@login_required
def delete_message():
    payload = request.get_json()
    try:
        data = Messages().load(payload)
    except ValidationError as err:
        abort(422, extract_all_errors(err))

    messages = []
    msgs_non_existent = []
    msgs_deleted = []

    for msg_id in data["ids"]:
        msg = Message.query.get(msg_id)
        if msg is None:
            msgs_non_existent.append(str(msg_id))
        elif msg.deleted_by == current_user.id:
            msgs_deleted.append(str(msg_id))
        else:
            messages.append(msg)

    if msgs_non_existent:
        abort(400, f"Messages {','.join(msgs_non_existent)} are not exist")

    if msgs_deleted:
        abort(400, f"Messages {','.join(msgs_deleted)} are already deleted")

    for message in messages:
        if message.deleted_by is None:
            message.deleted_by = current_user.id
            db.session.add(message)
        else:
            db.session.delete(message)

    db.session.commit()

    return jsonify({"message": "Messages has been deleted"})


@conversations.route("/messages/read", methods=["POST"])
@login_required
def read_messages():
    payload = request.get_json()
    try:
        data = Messages().load(payload)
    except ValidationError as err:
        abort(422, extract_all_errors(err))

    messages = []
    msgs_non_existent = []
    msgs_read = []

    for msg_id in data["ids"]:
        msg = Message.query.get(msg_id)
        if msg is None:
            msgs_non_existent.append(str(msg_id))
        elif msg.read is not None:
            msgs_read.append(str(msg_id))
        else:
            messages.append(msg)

    if msgs_non_existent:
        abort(400, f"Messages {','.join(msgs_non_existent)} are not exist")

    if msgs_read:
        abort(400, f"Messages {','.join(msgs_read)} are already read")

    for msg in messages:
        msg.read = datetime.utcnow()

    db.session.add_all(messages)
    db.session.commit()

    return jsonify({"message": "Messages has been read"})
