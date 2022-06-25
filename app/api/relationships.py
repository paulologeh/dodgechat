import logging

from flask import Blueprint, abort, jsonify
from flask_login import current_user, login_required

from app import db
from app.models.relationship import Relationship, RelationshipType
from app.models.user import User
from app.utils import get_front_end

logger = logging.getLogger(__name__)

FRONT_END_URI = f"{get_front_end()}"

relationships = Blueprint("relationships", __name__, url_prefix="/relationships")


def get_friendships(user_id):
    rel_from = Relationship.query.filter_by(requester_id=user_id).all()
    rel_to = Relationship.query.filter_by(addressee_id=user_id).all()
    rel_id_map = {}

    for rel in rel_from:
        if rel.addressee_id not in rel_id_map:
            rel_id_map[rel.addressee_id] = 0

        rel_id_map[rel.addressee_id] += 1

    for rel in rel_to:
        if rel.requester_id in rel_id_map:
            rel_id_map[rel.requester_id] += 1
        else:
            rel_id_map[rel.requester_id] = 1

    friend_ids = [key for key in rel_id_map if rel_id_map[key] == 2]
    friend_request_ids = [key for key in rel_id_map if rel_id_map[key] == 1]

    friends = db.session.query(User).filter(User.id.in_(friend_ids)).all()
    friend_requests = (
        db.session.query(User).filter(User.id.in_(friend_request_ids)).all()
    )

    return {
        "friends": [friend.to_minimal(True) for friend in friends],
        "friendRequests": [
            friend_request.to_minimal() for friend_request in friend_requests
        ],
    }


@relationships.route("/friends", methods=["GET"])
@login_required
def get_friends():
    return jsonify(get_friendships(current_user.id))


@relationships.route("/block/<username>", methods=["POST"])
@login_required
def block_user(username):
    if username == current_user.username:
        abort(400, "Cannot block yourself")

    user = User.query.filter_by(username=username).first()

    if user is None:
        abort(400, "Username doesn't exist")

    # check if the user is already blocked
    blocked = Relationship.query.filter_by(
        requester_id=current_user.id,
        addressee_id=user.id,
        relationship_type=RelationshipType.BLOCK,
    ).first()
    if blocked:
        abort(400, "User already blocked")

    # if friend delete user first
    friend = Relationship.query.filter_by(
        requester_id=current_user.id,
        addressee_id=user.id,
        relationship_type=RelationshipType.FRIEND,
    ).first()

    if friend:
        db.session.delete(friend)

    # if friend request sent, reject it
    friend_req = Relationship.query.filter_by(
        requester_id=user.id,
        addressee_id=current_user.id,
        relationship_type=RelationshipType.FRIEND,
    ).first()

    if friend_req:
        db.session.delete(friend_req)

    block = Relationship(
        requester_id=current_user.id,
        addressee_id=user.id,
        relationship_type=RelationshipType.BLOCK,
    )

    db.session.add(block)
    db.session.commit()

    return jsonify({"message": f"Blocked {username}"})


@relationships.route("/add/<username>", methods=["POST"])
@login_required
def add_user(username):
    if username == current_user.username:
        abort(400, "Cannot add yourself")

    requester_id = current_user.id
    user = User.query.filter_by(username=username).first()

    if user is None:
        abort(400, "User doesn't exist")

    addressee_id = user.id

    # Check if user has been blocked by the addee first
    blocked = Relationship.query.filter_by(
        requester_id=addressee_id, addressee_id=requester_id, relationship_type=RelationshipType.BLOCK
    ).first()
    if blocked:
        abort(400, f"User doesn't exist")

    # check if user is already added
    relationship = Relationship.query.filter_by(
        requester_id=requester_id,
        addressee_id=addressee_id,
        relationship_type=RelationshipType.FRIEND,
    ).first()

    if relationship:
        abort(400, "User already added")

    friendship = Relationship(
        requester_id=requester_id,
        addressee_id=addressee_id,
        relationship_type=RelationshipType.FRIEND,
    )

    db.session.add(friendship)
    db.session.commit()

    return jsonify({"message": f"Added {username}"})


@relationships.route("/delete/<username>", methods=["DELETE"])
@login_required
def delete_user(username):
    if username == current_user.username:
        abort(400, "Cannot delete yourself")

    user = User.query.filter_by(username=username).first()

    if user is None:
        abort(400, "User does not exist")

    friend = Relationship.query.filter_by(
        requester_id=current_user.id,
        addressee_id=user.id,
        relationship_type=RelationshipType.FRIEND,
    ).first()

    if friend is None:
        abort(400, f"{username} is not a friend")

    # check if friend request sent
    friend_req = Relationship.query.filter_by(
        requester_id=user.id,
        addressee_id=current_user.id,
        relationship_type=RelationshipType.FRIEND,
    ).first()

    db.session.remove(friend)
    db.session.remove(friend_req)
    db.session.commit()

    return jsonify({"message": f"Deleted friend {username}"})
