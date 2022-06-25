import logging

from flask import Blueprint, abort, request
from flask_login import current_user, login_required

from app.api.relationships import _get_friends
from app.models.relationship import Relationship, RelationshipType, FriendState
from app.models.user import User

logger = logging.getLogger(__name__)

search = Blueprint("search", __name__, url_prefix="/search")


@search.route("/user/<username>", methods=["GET"])
@login_required
def search_user(username):
    if current_user.username == username:
        abort(400, "Cannot fetch yourself")

    user = User.query.filter_by(username=username).first()
    if not user:
        abort(400, "User doesn't exist")

    # check if user has blocked you
    blocked = Relationship.query.filter_by(
        requester_id=user.id,
        addressee_id=current_user.id,
        relationship_type=RelationshipType.BLOCK,
    ).first()

    if blocked:
        abort(400, "User doesn't exist")

    # check if you have blocked the user
    block = Relationship.query.filter_by(
        requester_id=current_user.id,
        addressee_id=user.id,
        relationship_type=RelationshipType.BLOCK,
    ).first()

    relationship_from = Relationship.query.filter_by(
        requester_id=current_user.id,
        addressee_id=user.id,
        relationship_type=RelationshipType.FRIEND,
    ).first()

    relationship_to = Relationship.query.filter_by(
        requester_id=user.id,
        addressee_id=current_user.id,
        relationship_type=RelationshipType.FRIEND,
    ).first()

    # determine relationship state
    if relationship_from and relationship_to:
        relationship_state = FriendState.ACCEPTED
    elif relationship_from:
        relationship_state = FriendState.REQUESTED
    elif relationship_to:
        relationship_state = FriendState.REQUESTEE
    elif block:
        relationship_state = FriendState.BLOCKED
    else:
        relationship_state = None

    profile = {
        "name": user.name,
        "username": user.username,
        "location": user.location,
        "gravatar": user.gravatar(size=400),
        "relationshipState": relationship_state,
    }

    if relationship_state == "FRIEND":
        friends = _get_friends(current_user.id, include_requests=False)
        number_of_friends = len(friends["friends"])
        return {
            **profile,
            "aboutMe": user.about_me,
            "lastSeen": user.last_seen,
            "memberSince": user.member_since,
            "numberOfFriends": number_of_friends,
        }

    return profile


@search.route("", methods=["GET"])
@login_required
def search_all():
    """
    This will do a full text scan of
    - usernames
    - names
    - messages (TO DO)
    """
    results = {}
    term = request.args.get("term")
    if not term:
        abort(400, "No search term supplied")

    users = User.query.filter(User.__ts_vector__.match(term)).all()
    blocked = Relationship.query.filter_by(
        addressee_id=current_user.id, relationship_type=RelationshipType.BLOCK
    ).all()
    blocked_ids = {val.requester_id for val in blocked}

    results["users"] = {
        "name": "users",
        "results": [user.to_minimal() for user in users if user.id not in blocked_ids],
    }

    return results
