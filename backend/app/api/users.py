import logging
import os
from flask import Blueprint, abort, jsonify, request
from flask_login import current_user, login_required, login_user, logout_user
from marshmallow.exceptions import ValidationError

from app import db
from app.models.conversation import Conversation
from app.models.user import User
from app.serde import (
    ChangeEmailSchema,
    ChangePasswordSchema,
    DeleteAccountSchema,
    LoginSchema,
    PasswordResetRequestSchema,
    ResetPasswordSchema,
    UserUpdateSchema,
)
from app.serde.user import UserSchema
from app.utils import extract_all_errors
from app.utils.email import send_email

logger = logging.getLogger(__name__)

APP_URL = os.getenv("APP_URL")

users = Blueprint("auth", __name__, url_prefix="/users")


@users.route("/whoami", methods=["GET"])
@login_required
def whoami():
    return jsonify(UserSchema().dump(current_user))


@users.route("/delete", methods=["DELETE"])
@login_required
def delete_user():
    payload = request.get_json()

    try:
        data = DeleteAccountSchema().load(payload)
    except ValidationError as err:
        abort(422, extract_all_errors(err))

    if not current_user.verify_password(data["password"]):
        abort(400, "Invalid credentials")

    Conversation.query.filter_by(_sender_id=current_user.id, recipient_id=None).delete()
    Conversation.query.filter_by(recipient_id=current_user.id, _sender_id=None).delete()
    db.session.delete(current_user)
    db.session.commit()

    return jsonify({"message": "Deleted user"})


@users.route("/logout", methods=["POST"])
@login_required
def logout():
    id = current_user.id
    logout_user()
    logger.info("Logged out user %s" % id)
    return jsonify({"message": "Logged out"})


@users.route("/login", methods=["POST"])
def login():
    payload = request.get_json()
    remember, user = None, None

    try:
        user, remember = LoginSchema().load(payload)
    except ValidationError as err:
        abort(422, extract_all_errors(err))

    login_user(user, remember=True if remember else False)
    logger.info(
        "Logged in user %s remembered:%s" % (user.id, True if remember else False)
    )
    return jsonify(UserSchema().dump(user))


@users.route("/register", methods=["POST"])
def register():
    payload = request.get_json()

    try:
        user = UserSchema().load(payload)
    except ValidationError as err:
        abort(422, extract_all_errors(err))

    # check if username or email exists
    user1 = User.query.filter_by(email=user.email).first()

    if user1:
        abort(400, "Email already exists")

    user2 = User.query.filter_by(username=user.username).first()
    if user2:
        abort(400, "Username already exists")

    db.session.add(user)

    response = jsonify(UserSchema().dump(user))
    response.status_code = 201

    db.session.commit()

    token = user.generate_confirmation_token()
    send_email(
        user.email,
        "Confirm Your Account",
        "confirm_email",
        name=user.name,
        token=token,
        root=APP_URL,
    )

    return response


@users.route("/update", methods=["PATCH"])
@login_required
def update_user():
    if not current_user.confirmed:
        abort(400, "Confirm your email address first")

    payload = request.get_json()

    try:
        user_updates = UserUpdateSchema().load(payload)
    except ValidationError as err:
        abort(422, extract_all_errors(err))

    user = User.query.filter_by(username=current_user.username).first()

    for key, value in user_updates.items():
        setattr(user, key, value)

    db.session.add(user)
    db.session.commit()

    return jsonify(UserSchema().dump(user))


@users.route("/confirm/<token>", methods=["POST"])
@login_required
def confirm(token):
    if current_user.confirmed:
        abort(400, "User already confirmed")

    if not current_user.confirm(token):
        abort(400, "The confirmation link is invalid or has expired.")

    db.session.commit()
    return jsonify({"message": "You have confirmed your account. Thanks!"})


@users.route("/confirm", methods=["POST"])
@login_required
def resend_confirmation():
    if current_user.confirmed:
        abort(400, "User already confirmed")

    token = current_user.generate_confirmation_token()

    send_email(
        current_user.email,
        "Confirm Your Account",
        "confirm_email",
        name=current_user.name,
        token=token,
        root=APP_URL,
    )

    return jsonify({"message": "A confirmation email will be sent to you by email"})


@users.route("/change-password", methods=["POST"])
@login_required
def change_password():
    payload = request.get_json()

    try:
        data = ChangePasswordSchema().load(payload)
    except ValidationError as err:
        abort(422, extract_all_errors(err))

    if not current_user.verify_password(data["old_password"]):
        abort(400, "Invalid credentials")

    current_user.password = data["password"]
    db.session.add(current_user)
    db.session.commit()

    return jsonify({"message": "Successfully changed password"})


@users.route("/reset", methods=["POST"])
def password_reset_request():
    if not current_user.is_anonymous:
        abort(
            400,
            "Cannot reset password while you are logged in.",
        )

    payload = request.get_json()
    try:
        data = PasswordResetRequestSchema().load(payload)
    except ValidationError as err:
        abort(422, extract_all_errors(err))

    user = User.query.filter_by(email=data["email"].lower()).first()
    if user:
        token = user.generate_reset_token()
        send_email(
            user.email,
            "Reset Your Password",
            "reset_password",
            name=user.name,
            token=token,
            root=APP_URL,
        )

    return jsonify(
        {
            "message": "An email with instructions to reset your password will be sent to you if you are "
            "registered"
        }
    )


@users.route("/reset/<token>", methods=["POST"])
def password_reset(token):
    if not current_user.is_anonymous:
        abort(400, "Cannot reset password while you are logged in.")

    payload = request.get_json()
    try:
        data = ResetPasswordSchema().load(payload)
    except ValidationError as err:
        abort(422, extract_all_errors(err))

    if not User.reset_password(token, data["password"]):
        abort(400, "Invalid token")

    db.session.commit()
    return jsonify({"message": "Your password has been updated"})


@users.route("/change_email", methods=["POST"])
@login_required
def change_email_request():
    payload = request.get_json()

    try:
        data = ChangeEmailSchema().load(payload)
    except ValidationError as err:
        abort(422, extract_all_errors(err))

    if not current_user.verify_password(data["password"]):
        abort(400, "Invalid email or password")

    new_email = data["email"].lower()
    token = current_user.generate_email_change_token(new_email)
    send_email(
        new_email,
        "Confirm your email address",
        "change_email",
        name=current_user.name,
        token=token,
        root=APP_URL,
    )
    return jsonify(
        {
            "message": "An email with instructions to confirm your new email address has been sent to you."
        }
    )


@users.route("/change_email/<token>", methods=["POST"])
@login_required
def change_email(token):
    if not current_user.change_email(token):
        abort(400, "Invalid request")

    db.session.commit()
    return jsonify({"message": "Your email address has been updated"})
