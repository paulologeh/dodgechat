import time
from datetime import datetime

import pytest

from app.models.user import User


def test_password_setter():
    u = User(password="cat")
    assert u.password_hash is not None


def test_no_password_getter():
    u = User(password="cat")
    with pytest.raises(AttributeError):
        u.password


def test_password_verification():
    u = User(password="cat")
    assert u.verify_password("cat")
    assert not u.verify_password("dog")


def test_password_salts_are_random():
    u = User(password="cat")
    u2 = User(password="cat")
    assert u.password_hash != u2.password_hash


def test_valid_confirmation_token(database):
    u = User(password="cat")
    database.session.add(u)
    database.session.commit()
    token = u.generate_confirmation_token()
    assert u.confirm(token)


def test_invalid_confirmation_token(database):
    u1 = User(password="cat")
    u2 = User(password="dog")
    database.session.add(u1)
    database.session.add(u2)
    database.session.commit()
    token = u1.generate_confirmation_token()
    assert not u2.confirm(token)


def test_expired_confirmation_token(database):
    u = User(password="cat")
    database.session.add(u)
    database.session.commit()
    token = u.generate_confirmation_token(1)
    time.sleep(2)
    assert not u.confirm(token)


def test_valid_reset_token(database):
    u = User(password="cat")
    database.session.add(u)
    database.session.commit()
    token = u.generate_reset_token()
    assert User.reset_password(token, "dog")
    assert u.verify_password("dog")


def test_invalid_reset_token(database):
    u = User(password="cat")
    database.session.add(u)
    database.session.commit()
    token = u.generate_reset_token()
    assert not User.reset_password(token + "a", "horse")
    assert u.verify_password("cat")


def test_valid_email_change_token(database):
    u = User(email="john@example.com", password="cat")
    database.session.add(u)
    database.session.commit()
    token = u.generate_email_change_token("susan@example.org")
    assert u.change_email(token)
    assert u.email == "susan@example.org"


def test_invalid_email_change_token(database):
    u1 = User(email="john@example.com", password="cat")
    u2 = User(email="susan@example.org", password="dog")
    database.session.add(u1)
    database.session.add(u2)
    database.session.commit()
    token = u1.generate_email_change_token("david@example.net")
    assert not u2.change_email(token)
    assert u2.email == "susan@example.org"


def test_duplicate_email_change_token(database):
    u1 = User(email="john@example.com", password="cat")
    u2 = User(email="susan@example.org", password="dog")
    database.session.add(u1)
    database.session.add(u2)
    database.session.commit()
    token = u2.generate_email_change_token("john@example.com")
    assert not u2.change_email(token)
    assert u2.email == "susan@example.org"


def test_timestamps(database):
    u = User(password="cat")
    database.session.add(u)
    database.session.commit()
    assert (datetime.utcnow() - u.member_since).total_seconds() < 3
    assert (datetime.utcnow() - u.last_seen).total_seconds() < 3


def test_ping(database):
    u = User(password="cat")
    database.session.add(u)
    database.session.commit()
    time.sleep(2)
    last_seen_before = u.last_seen
    u.ping()

    assert u.last_seen > last_seen_before


def test_gravatar(app):
    u = User(email="john@example.com", password="cat")
    gravatar = u.gravatar()
    gravatar_256 = u.gravatar(size=256)
    gravatar_pg = u.gravatar(rating="pg")
    gravatar_retro = u.gravatar(default="retro")
    assert (
        "https://secure.gravatar.com/avatar/d4c74594d841139328695756648b6bd6"
        in gravatar
    )
    assert "s=256" in gravatar_256
    assert "r=pg" in gravatar_pg
    assert "d=retro" in gravatar_retro
