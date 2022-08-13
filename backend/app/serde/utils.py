from marshmallow import ValidationError

from app.models.user import User


def must_not_be_blank(data):
    # Custom validator
    if not data:
        raise ValidationError("Data not provided.")


def camelcase(s):
    parts = iter(s.split("_"))
    return next(parts) + "".join(i.title() for i in parts)


def email_must_not_be_registered(email):
    user = User.query.filter_by(email=email).first()
    if user is not None:
        raise ValidationError("Email already registered.")


def validate_user_email(email):
    must_not_be_blank(email)
    email_must_not_be_registered(email)


def password_must_match(data):
    password = data.get("password")
    confirm_password = data.get("confirm_password")

    if password != confirm_password:
        raise ValidationError("Passwords must match")


def lower_strip_email(data):
    email = data.get("email")
    if email is not None:
        data["email"] = email.lower().strip()

    return data
