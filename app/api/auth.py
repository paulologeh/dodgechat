import logging
from flask import Blueprint, abort, jsonify, request
from flask_login import current_user, login_required, login_user, logout_user
from marshmallow.exceptions import ValidationError

from app import db
from app.models.user import User
from app.serde import (
    ChangeEmailSchema,
    ChangePasswordSchema,
    DeleteAccountSchema,
    LoginSchema,
    PasswordResetRequestSchema,
    ResetPasswordSchema,
)
from app.serde.user import UserSchema
from app.utils import get_front_end
from app.utils.email import send_email

logger = logging.getLogger(__name__)

FRONT_END_URI = f"{get_front_end()}"

auth = Blueprint("auth", __name__, url_prefix="/auth")


@auth.route("/whoami", methods=["GET"])
@login_required
def whoami():
    return jsonify(UserSchema().dump(current_user))


@login_required
@auth.route("/delete", methods=["DELETE"])
def delete_user():
    payload = request.get_json()

    try:
        data = DeleteAccountSchema().load(payload)
    except ValidationError as err:
        abort(422, err.messages)

    if not current_user.verify_password(data["password"]):
        abort(400, "Invalid credentials")

    db.session.delete(current_user)
    db.session.commit()

    return jsonify({"message": "Deleted user"})


@auth.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out"})


@auth.route("/login", methods=["POST"])
def login():
    payload = request.get_json()

    try:
        user = LoginSchema().load(payload)
    except ValidationError as err:
        abort(422, err.messages)

    login_user(user)

    return jsonify(UserSchema().dump(user))


@auth.route("/register", methods=["POST"])
def register():
    payload = request.get_json()

    try:
        user = UserSchema().load(payload)
    except ValidationError as err:
        abort(422, err.messages)

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
        user=user,
        token=token,
        root=FRONT_END_URI,
    )

    return response


@auth.route("/confirm/<token>", methods=["POST"])
@login_required
def confirm(token):
    if current_user.confirmed:
        abort(400, "User already confirmed")

    if not current_user.confirm(token):
        abort(400, "The confirmation link is invalid or has expired.")

    db.session.commit()
    return jsonify({"message": "You have confirmed your account. Thanks!"})


@auth.route("/confirm", methods=["POST"])
@login_required
def resend_confirmation():
    if current_user.confirmed:
        abort(400, "User already confirmed")

    token = current_user.generate_confirmation_token()

    send_email(
        current_user.email,
        "Confirm Your Account",
        "confirm_email",
        user=current_user,
        token=token,
        root=FRONT_END_URI,
    )

    return jsonify({"message": "A confirmation email will be sent to you by email"})


@auth.route("/change-password", methods=["POST"])
@login_required
def change_password():
    payload = request.get_json()

    try:
        data = ChangePasswordSchema().load(payload)
    except ValidationError as err:
        abort(422, err.messages)

    if not current_user.verify_password(data["old_password"]):
        abort(400, "Invalid credentials")

    current_user.password = data["password"]
    db.session.add(current_user)
    db.session.commit()

    return jsonify({"message": "Successfully changed password"})


@auth.route("/reset", methods=["POST"])
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
        abort(422, err.messages)

    user = User.query.filter_by(email=data["email"].lower()).first()
    if user:
        token = user.generate_reset_token()
        send_email(
            user.email,
            "Reset Your Password",
            "reset_password",
            user=user,
            token=token,
            root=FRONT_END_URI,
        )

    return jsonify(
        {
            "message": "An email with instructions to reset your password will be sent to you if you are "
            "registered"
        }
    )


@auth.route("/reset/<token>", methods=["POST"])
def password_reset(token):
    if not current_user.is_anonymous:
        abort(400, "Cannot reset password while you are logged in.")

    payload = request.get_json()
    try:
        data = ResetPasswordSchema().load(payload)
    except ValidationError as err:
        abort(422, err.messages)

    if not User.reset_password(token, data["password"]):
        abort(400, "Invalid token")

    db.session.commit()
    return jsonify({"message": "Your password has been updated"})


@auth.route("/change_email", methods=["POST"])
@login_required
def change_email_request():
    payload = request.get_json()

    try:
        data = ChangeEmailSchema().load(payload)
    except ValidationError as err:
        abort(422, err.messages)

    if not current_user.verify_password(data["password"]):
        abort(400, "Invalid email or password")

    new_email = data["email"].lower()
    token = current_user.generate_email_change_token(new_email)
    send_email(
        new_email,
        "Confirm your email address",
        "change_email",
        user=current_user,
        token=token,
        root=FRONT_END_URI,
    )
    return jsonify(
        {
            "message": "An email with instructions to confirm your new email address has been sent to you."
        }
    )


@auth.route("/change_email/<token>", methods=["POST"])
@login_required
def change_email(token):
    if not current_user.change_email(token):
        abort(400, "Invalid request")

    db.session.commit()
    return jsonify({"message": "Your email address has been updated"})
