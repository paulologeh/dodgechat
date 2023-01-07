import pytest
from marshmallow import ValidationError

from app.models.user import User
from app.serde.utils import (
    camelcase,
    email_must_not_be_registered,
    lower_strip_email,
    must_not_be_blank,
    password_must_match,
)


def test_must_not_be_blank():
    with pytest.raises(ValidationError):
        must_not_be_blank("")

    with pytest.raises(ValidationError):
        must_not_be_blank(None)

    assert must_not_be_blank("hello") is None


def test_camelcase():
    key = "first_name"
    assert camelcase(key) == "firstName"


def test_email_must_not_be_registered(database):
    u = User(email="john@example.com", password="cat")
    database.session.add(u)
    database.session.commit()
    with pytest.raises(ValidationError):
        email_must_not_be_registered("john@example.com")


def test_password_must_match():
    assert password_must_match({"password": "cat", "confirm_password": "cat"}) is None

    with pytest.raises(ValidationError):
        password_must_match({"password": "dog", "confirm_password": "cat"})


def test_lower_strip_email():
    new_data = lower_strip_email({"email": " AbCd@gmail.com"})
    assert new_data["email"] == "abcd@gmail.com"
