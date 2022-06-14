from marshmallow import Schema, ValidationError, fields, post_load, pre_load

from app.models.user import User
from app.serde.utils import (
    lower_strip_email,
    must_not_be_blank,
    password_must_match,
    camelcase,
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
    email_or_username = fields.Str(validate=must_not_be_blank)
    password = fields.Str(required=True, validate=must_not_be_blank)

    def on_bind_field(self, field_name, field_obj):
        field_obj.data_key = camelcase(field_obj.data_key or field_name)

    @post_load
    def get_user(self, data, **kwargs):
        user1 = User.query.filter_by(username=data["email_or_username"]).first()
        user2 = User.query.filter_by(email=data["email_or_username"]).first()
        user = user2 if user1 is None else user1

        if user is None or not user.verify_password(data["password"]):
            raise ValidationError("Invalid email or password.")

        return user
