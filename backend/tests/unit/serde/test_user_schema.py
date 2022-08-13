from app.serde.user import UserSchema


def test_user_schema(database):
    payload = {
        "email": "john@example.com",
        "username": "john",
        "password": "johnisbest",
        "name": "Johnny Cash",
        "aboutMe": "I am johnny cash",
    }

    user = UserSchema().load(payload)

    assert user.email == payload["email"]
    assert user.username == payload["username"]
    assert user.name == payload["name"]
    assert user.about_me == payload["aboutMe"]

    user = UserSchema().dump(user)

    assert user["email"] == payload["email"]
    assert user["username"] == payload["username"]
    assert user["name"] == payload["name"]
    assert user["aboutMe"] == payload["aboutMe"]
    assert "memberSince" in user
    assert "lastSeen" in user
