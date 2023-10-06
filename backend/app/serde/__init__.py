from marshmallow import Schema, ValidationError, fields, post_load, pre_load

from app.models.user import User
from app.serde.basic_schema import BasicSchema
from app.serde.utils import (
    camelcase,
    lower_strip_email,
    must_not_be_blank,
    password_must_match,
)


class Messages(BasicSchema):
    ids = fields.List(fields.UUID)


class MessageSchema(BasicSchema):
    id = fields.UUID(dump_only=True)
    sender_id = fields.Integer()
    body = fields.Str()
    read = fields.Boolean()
    created_at = fields.DateTime(dump_only=True)


class ConversationSchema(BasicSchema):
    id = fields.UUID(dump_only=True)
    sender_id = fields.Integer()
    recipient_id = fields.Integer()


class NewConversationSchema(BasicSchema):
    recipient_id = fields.Integer()
    message_body = fields.Str()


class DeleteAccountSchema(BasicSchema):
    password = fields.Str(required=True, validate=must_not_be_blank)


class ChangeEmailSchema(BasicSchema):
    email = fields.Str(required=True, validate=must_not_be_blank)
    password = fields.Str(required=True, validate=must_not_be_blank)

    @pre_load
    def normalise_email(self, data, **kwargs):
        return lower_strip_email(data)


class ResetPasswordSchema(BasicSchema):
    password = fields.Str(required=True, validate=must_not_be_blank)
    confirm_password = fields.Str(required=True, validate=must_not_be_blank)

    @post_load
    def validate_passwords(self, data, **kwargs):
        password_must_match(data)
        return data


class PasswordResetRequestSchema(BasicSchema):
    email = fields.Str(required=True, validate=must_not_be_blank)

    @pre_load
    def normalise_email(self, data, **kwargs):
        return lower_strip_email(data)


class ChangePasswordSchema(BasicSchema):
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
    email_or_username = fields.Str(required=True, validate=must_not_be_blank)
    password = fields.Str(required=True, validate=must_not_be_blank)
    remember = fields.Boolean()

    @post_load
    def get_user(self, data, **kwargs):
        user1 = User.query.filter_by(username=data["email_or_username"]).first()
        user2 = User.query.filter_by(email=data["email_or_username"]).first()
        user = user2 if user1 is None else user1

        if user is None or not user.verify_password(data["password"]):
            raise ValidationError("Invalid email or password.")

        return user, data.get("remember")
