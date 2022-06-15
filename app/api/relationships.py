import logging
from flask import Blueprint, abort, jsonify
from flask_login import current_user, login_required

from app import db
from app.models.user import User
from app.models.relationship import Relationship, RelationshipType


from app.utils import get_front_end

logger = logging.getLogger(__name__)

FRONT_END_URI = f"{get_front_end()}"

relationships = Blueprint("relationships", __name__, url_prefix="/relationships")


def get_friendships(user_id):
    rel_from = Relationship.query.filter_by(from_id=user_id).all()
    rel_to = Relationship.query.filter_by(to_id=user_id).all()
    rel_id_map = {}

    for rel in rel_from:
        if rel.to_id not in rel_id_map:
            rel_id_map[rel.to_id] = 0

        rel_id_map[rel.to_id] += 1

    for rel in rel_to:
        if rel.from_id in rel_id_map:
            rel_id_map[rel.to_id] += 1
        else:
            rel_id_map[rel.to_id] = 1

    friend_ids = [key for key in rel_id_map if rel_id_map[key] == 2]
    friend_request_ids = [key for key in rel_id_map if rel_id_map[key] == 1]

    return {"friends": friend_ids, "friend_requests": friend_request_ids}


@relationships.route("/friends", methods=["GET"])
@login_required
def get_friends():
    return jsonify(get_friendships(current_user.id))


@relationships.route("/block/<username>", methods=["POST"])
@login_required
def block_user(username):
    if username == current_user.username:
        abort(400, "Cannot block yourself")

    from_id = current_user.id
    user = User.query.filter_by(username=username).first()

    if user is None:
        abort(400, "Username doesn't exist")

    to_id = user.id

    # check if the user is already blocked
    blocked = Relationship.query.filter_by(
        from_id=from_id, to_id=to_id, relationship_type=RelationshipType.BLOCK
    ).first()
    if blocked:
        abort(400, "User already blocked")

    # if friend delete user first
    relationship = Relationship.query.filter_by(
        from_id=from_id, to_id=to_id, relationship_type=RelationshipType.FRIEND
    ).first()

    if relationship:
        db.session.delete(relationship)

    block = Relationship(
        from_id=from_id, to_id=to_id, relationship_type=RelationshipType.BLOCK
    )

    db.session.add(block)
    db.session.commit()

    return jsonify({"message": f"Blocked {username}"})


@relationships.route("/add/<username>", methods=["POST"])
@login_required
def add_user(username):
    if username == current_user.username:
        abort(400, "Cannot add yourself")

    from_id = current_user.id
    user = User.query.filter_by(username=username).first()

    if user is None:
        abort(400, "User doesn't exist")

    to_id = user.id

    # Check if user has been blocked by the addee first
    blocked = Relationship.query.filter_by(
        from_id=to_id, to_id=from_id, relationship_type=RelationshipType.BLOCK
    ).first()
    if blocked:
        abort(400, f"User doesn't exist")

    # check if user is already added
    relationship = Relationship.query.filter_by(
        from_id=from_id, to_id=to_id, relationship_type=RelationshipType.FRIEND
    ).first()

    if relationship:
        abort(400, "User already added")

    friendship = Relationship(
        from_id=from_id, to_id=to_id, relationship_type=RelationshipType.FRIEND
    )

    db.session.add(friendship)
    db.session.commit()

    return jsonify({"message": f"Added {username}"})


@relationships.route("/delete/<username>", methods=["DELETE"])
@login_required
def delete_user(username):
    if username == current_user.username:
        abort(400, "Cannot delete yourself")

    from_id = current_user.id
    user = User.query.filter_by(username=username).first()

    if user is None:
        abort(400, "User does not exist")

    to_id = user.id

    relationship = Relationship.query.filter_by(
        from_id=from_id, to_id=to_id, relationship_type=RelationshipType.FRIEND
    ).first()

    if relationship is None:
        abort(400, f"{username} is not a friend")

    db.session.remove(relationship)
    db.session.commit()

    return jsonify({"message": f"Deleted friend {username}"})
