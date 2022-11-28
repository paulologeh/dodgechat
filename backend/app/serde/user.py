from datetime import datetime

from marshmallow import Schema, fields, post_load, pre_load

from app.models.user import User
from .basic_schema import BasicSchema

from .utils import must_not_be_blank, validate_user_email


# noinspection PyTypeChecker
class UserSchema(BasicSchema):
    id = fields.Int(dump_only=True)
    email = fields.Email(required=True, validate=validate_user_email)
    username = fields.Str(validate=must_not_be_blank)
    password = fields.Str(required=True, load_only=True, validate=must_not_be_blank)
    confirmed = fields.Boolean(load_only=True)
    name = fields.Str(validate=must_not_be_blank)
    location = fields.Str()
    about_me = fields.Str()
    member_since = fields.DateTime(dump_only=True)
    last_seen = fields.DateTime(load_default=datetime.utcnow)
    avatar_hash = fields.Str()

    @pre_load
    def lowerstrip_email(self, data, **kwargs):
        email = data.get("email")
        if email is not None:
            data["email"] = email.lower().strip()

        return data

    @post_load
    def make_user(self, data, **kwargs):
        return User(**data)
