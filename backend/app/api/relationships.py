import logging

from flask import Blueprint, abort, jsonify
from flask_login import current_user, login_required
from sqlalchemy import and_, or_

from app import db
from app.models.relationship import FriendState, Relationship, RelationshipType
from app.models.user import User
from app.models.conversation import Conversation


logger = logging.getLogger(__name__)

relationships = Blueprint("relationships", __name__, url_prefix="/relationships")


def remove_all_relationships(current_user_id, user_id, is_unblock=False):
    """Removes all relationships between two users"""
    _relationships = (
        db.session.query(Relationship)
        .filter(
            or_(
                and_(
                    Relationship.requester_id == current_user_id,
                    Relationship.addressee_id == user_id,
                ),
                and_(
                    Relationship.requester_id == user_id,
                    Relationship.addressee_id == current_user_id,
                ),
            )
        )
        .all()
    )

    # remove all relationships
    for relationship in _relationships:
        if relationship.relationship_type is RelationshipType.BLOCK:
            if relationship.requester_id == current_user_id and not is_unblock:
                abort(400, "User blocked")

            # can't block or unblock someone that has already blocked you
            if relationship.requester_id == user_id:
                abort(404, "User not found")

        db.session.delete(relationship)


def _get_friends(user_id, include_requests=True):
    _relationships = (
        db.session.query(Relationship)
        .filter(
            or_(
                Relationship.requester_id == user_id,
                Relationship.addressee_id == user_id,
            )
        )
        .filter(Relationship.relationship_type == RelationshipType.FRIEND)
        .all()
    )

    candidates = {}

    for relationship in _relationships:
        if relationship.requester_id == user_id:
            if relationship.addressee_id not in candidates:
                candidates[relationship.addressee_id] = FriendState.REQUESTED
            else:
                candidates[relationship.addressee_id] = FriendState.ACCEPTED
        else:
            if relationship.requester_id not in candidates:
                candidates[relationship.requester_id] = FriendState.REQUESTEE
            else:
                candidates[relationship.requester_id] = FriendState.ACCEPTED

    friend_ids = [key for key in candidates if candidates[key] is FriendState.ACCEPTED]

    result = {}

    friends = db.session.query(User).filter(User.id.in_(list(friend_ids))).all()
    result["friends"] = [friend.to_minimal(True) for friend in friends]

    if not include_requests:
        return result

    friend_request_ids = [
        key for key in candidates if candidates[key] is FriendState.REQUESTEE
    ]

    friend_requests = (
        db.session.query(User).filter(User.id.in_(friend_request_ids)).all()
    )

    result["friendRequests"] = [
        friend_request.to_minimal() for friend_request in friend_requests
    ]

    other_ids = [
        conversation.recipient_id
        if conversation.sender_id == user_id
        else conversation.sender_id
        for conversation in db.session.query(Conversation)
        .filter(
            or_(
                Conversation.recipient_id == user_id, Conversation._sender_id == user_id
            )
        )
        .all()
    ]

    others = []
    for id in other_ids:
        if id not in friend_ids:
            other = User.query.get(id)
            if other:
                others.append(other.to_minimal())

    result["others"] = others

    return result


@relationships.route("/friends", methods=["GET"])
@login_required
def get_friends():
    return jsonify(_get_friends(current_user.id))


@relationships.route("/block/<username>", methods=["POST"])
@login_required
def block_user(username):
    if username == current_user.username:
        abort(400, "Cannot block yourself")

    user = User.query.filter_by(username=username).first()

    if user is None:
        abort(404, "User not found")

    remove_all_relationships(current_user.id, user.id)

    block = Relationship(
        requester_id=current_user.id,
        addressee_id=user.id,
        relationship_type=RelationshipType.BLOCK,
    )

    db.session.add(block)
    db.session.commit()

    from websockets import send_event_to_client

    send_event_to_client({"name": "relationship"}, user.id)

    return jsonify({"message": f"Blocked {username}"})


@relationships.route("/unblock/<username>", methods=["POST"])
@login_required
def unblock_user(username):
    if username == current_user.username:
        abort(400, "Cannot unblock yourself")

    user = User.query.filter_by(username=username).first()

    if user is None:
        abort(404, "User not found")

    remove_all_relationships(current_user.id, user.id, True)

    db.session.commit()

    from websockets import send_event_to_client

    send_event_to_client({"name": "relationship"}, user.id)

    return jsonify({"message": f"Unblocked {username}"})


@relationships.route("/add/<username>", methods=["POST"])
@login_required
def add_user(username):
    if username == current_user.username:
        abort(400, "Cannot add yourself")

    user = User.query.filter_by(username=username).first()

    if user is None:
        abort(404, "User not found")

    # Check if user has been blocked by the adder
    blocked = Relationship.query.filter_by(
        requester_id=user.id,
        addressee_id=current_user.id,
        relationship_type=RelationshipType.BLOCK,
    ).first()
    if blocked:
        abort(404, "User not found")

    # check if user is already added
    relationship = Relationship.query.filter_by(
        requester_id=current_user.id,
        addressee_id=user.id,
        relationship_type=RelationshipType.FRIEND,
    ).first()

    if relationship:
        abort(400, "User already added")

    friendship = Relationship(
        requester_id=current_user.id,
        addressee_id=user.id,
        relationship_type=RelationshipType.FRIEND,
    )

    db.session.add(friendship)
    db.session.commit()

    from websockets import send_event_to_client

    send_event_to_client({"name": "relationship"}, user.id)

    return jsonify({"message": f"Added {username}"})


@relationships.route("/delete/<username>", methods=["DELETE"])
@login_required
def delete_user(username):
    if username == current_user.username:
        abort(400, "Cannot delete yourself")

    user = User.query.filter_by(username=username).first()

    if user is None:
        abort(404, "User not found")

    remove_all_relationships(current_user.id, user.id)

    db.session.commit()

    from websockets import send_event_to_client

    send_event_to_client({"name": "relationship"}, user.id)

    return jsonify({"message": f"Deleted friend {username}"})
