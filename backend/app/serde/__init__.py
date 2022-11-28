from marshmallow import Schema, ValidationError, fields, post_load, pre_load

from app.models.user import User
from app.serde.basic_schema import BasicSchema
from app.serde.utils import (
    camelcase,
    lower_strip_email,
    must_not_be_blank,
    password_must_match,
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


class UserUpdateSchema(BasicSchema):
    name = fields.Str(validate=must_not_be_blank)
    username = fields.Str(validate=must_not_be_blank)
    location = fields.Str()
    about_me = fields.Str()
    avatar_hash = fields.Str()


class LoginSchema(BasicSchema):
    email_or_username = fields.Str(validate=must_not_be_blank)
    password = fields.Str(required=True, validate=must_not_be_blank)

    @post_load
    def get_user(self, data, **kwargs):
        user1 = User.query.filter_by(username=data["email_or_username"]).first()
        user2 = User.query.filter_by(email=data["email_or_username"]).first()
        user = user2 if user1 is None else user1

        if user is None or not user.verify_password(data["password"]):
            raise ValidationError("Invalid email or password.")

        return user
