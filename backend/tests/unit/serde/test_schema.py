import pytest
from marshmallow import ValidationError

from app.models.user import User
from app.serde import (
    ChangeEmailSchema,
    ChangePasswordSchema,
    LoginSchema,
    PasswordResetRequestSchema,
    ResetPasswordSchema,
)


def assert_payload_is_equal(payload, output):
    for key in payload:
        assert output[key] == payload[key]


def test_change_email_schema(database):
    payload = {"email": "john@example.com", "password": "mypassword"}
    output = ChangeEmailSchema().load(payload)
    assert_payload_is_equal(payload, output)


def test_reset_password_schema():
    payload = {"password": "admin123", "confirm_password": "admin123"}
    output = ResetPasswordSchema().load(payload)
    assert_payload_is_equal(payload, output)


def test_password_reset_request_schema():
    payload = {"email": "john@example.com"}
    output = PasswordResetRequestSchema().load(payload)
    assert_payload_is_equal(payload, output)


def test_change_password_schema():
    payload = {
        "old_password": "abc123",
        "password": "admin123",
        "confirm_password": "admin123",
    }
    output = ChangePasswordSchema().load(payload)
    assert_payload_is_equal(payload, output)


def test_login_schema(database):
    u = User(username="admin", email="admin@test.com", password="admin123")

    database.session.add(u)
    database.session.commit()

    payload_only_password = {"password": "admin123"}
    with pytest.raises(ValidationError) as e:
        LoginSchema().load(payload_only_password)

    assert e.value.args[0]["_schema"][0] == "username or email is required"

    payload_username = {"username": "admin", "password": "admin123"}

    user = LoginSchema().load(payload_username)
    assert user.username == "admin"
    assert user.email == "admin@test.com"

    payload_email = {"email": "admin@test.com", "password": "admin123"}

    user = LoginSchema().load(payload_email)
    assert user.username == "admin"
    assert user.email == "admin@test.com"

    payload_incorrect_user = {"username": "adminy", "password": "admin123"}

    payload_incorrect_password = {"username": "admin", "password": "adminy123"}

    with pytest.raises(ValidationError):
        LoginSchema().load(payload_incorrect_user)
        LoginSchema().load(payload_incorrect_password)
