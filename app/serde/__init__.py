from marshmallow import Schema, ValidationError, fields, post_load, pre_load

from app.models.user import User
from app.serde.utils import (
    lower_strip_email,
    must_not_be_blank,
    password_must_match,
    validate_user_email,
)


class DeleteAccountSchema(Schema):
    password = fields.Str(required=True, validate=must_not_be_blank)


class ChangeEmailSchema(Schema):
    email = fields.Str(required=True, validate=must_not_be_blank)
    password = fields.Str(required=True, validate=must_not_be_blank)

    @pre_load
    def normalise_email(self, data, **kwargs):
        return lower_strip_email(data)


class ResetPasswordSchema(Schema):
    password = fields.Str(required=True, validate=must_not_be_blank)
    confirm_password = fields.Str(required=True, validate=must_not_be_blank)

    @post_load
    def validate_passwords(self, data, **kwargs):
        password_must_match(data)
        return data


class PasswordResetRequestSchema(Schema):
    email = fields.Str(required=True, validate=must_not_be_blank)

    @pre_load
    def normalise_email(self, data, **kwargs):
        return lower_strip_email(data)


class ChangePasswordSchema(Schema):
    old_password = fields.Str(required=True, validate=must_not_be_blank)
    password = fields.Str(required=True, validate=must_not_be_blank)
    confirm_password = fields.Str(required=True, validate=must_not_be_blank)

    @post_load
    def validate_passwords(self, data, **kwargs):
        password_must_match(data)

        return data


class LoginSchema(Schema):
    email = fields.Str(validate=must_not_be_blank)
    username = fields.Str(validate=must_not_be_blank)
    password = fields.Str(required=True, validate=must_not_be_blank)

    @pre_load
    def username_or_email_required(self, data, **kwargs):
        email = data.get("email")
        username = data.get("username")

        if email is None and username is None:
            raise ValidationError("username or email is required")

        return lower_strip_email(data)

    @post_load
    def get_user(self, data, **kwargs):
        user = (
            User.query.filter_by(username=data["username"]).first()
            if data.get("username")
            else User.query.filter_by(email=data["email"]).first()
        )

        if user is None or not user.verify_password(data["password"]):
            raise ValidationError("Invalid email or password.")

        return user
