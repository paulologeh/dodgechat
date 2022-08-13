import pytest
from faker import Faker

from app.models.user import User


@pytest.mark.usefixtures("client", "client_database")
class BaseTestUser:
    user = {
        "email": "john@example.com",
        "username": "john",
        "password": "johnisbest",
        "name": "Johnny Cash",
        "aboutMe": "I am johnny cash",
    }

    def register_user(self, client):
        response = client.post("/api/auth/register", json=self.user)
        assert response.status_code == 201
        return response

    def login_user(self, client):
        response = client.post(
            "/api/auth/login",
            json={"username": self.user["username"], "password": self.user["password"]},
        )
        assert response.status_code == 200
        return response

    def logout_user(self, client):
        response = client.post("/api/auth/logout")
        assert response.status_code == 200
        return response

    def setup_basic_user(self, client):
        self.register_user(client)
        self.login_user(client)

    def assert_user(self, user):
        assert user["email"] == self.user["email"]
        assert user["username"] == self.user["username"]
        assert user["name"] == self.user["name"]
        assert user["aboutMe"] == self.user["aboutMe"]


class TestClassBasicAuthentication(BaseTestUser):
    def test_register(self, client):
        response = self.register_user(client)
        user = response.json
        self.assert_user(user)

    def test_login(self, client):
        response = self.login_user(client)
        user = response.json
        self.assert_user(user)

    def test_whoami(self, client):
        response = client.get("/api/auth/whoami")
        assert response.status_code == 200
        user = response.json
        self.assert_user(user)

    def test_logout(self, client):
        response = self.logout_user(client)
        res = response.json
        assert "message" in res and res["message"] == "Logged out"


class TestClassChangePassword(BaseTestUser):
    new_password = "admin123"

    def test_change_password(self, client):
        self.register_user(client)
        self.login_user(client)
        response = client.post(
            "/api/auth/change-password",
            json={
                "old_password": self.user["password"],
                "password": self.new_password,
                "confirm_password": self.new_password,
            },
        )
        assert response.status_code == 200
        self.logout_user(client)

    def test_can_login_with_new_password(self, client):
        response = client.post(
            "/api/auth/login",
            json={"email": self.user["email"], "password": self.new_password},
        )
        assert response.status_code == 200


class TestClassDeleteAccount(BaseTestUser):
    def test_delete_account(self, client):
        self.register_user(client)
        self.login_user(client)

        response = client.post(
            "/api/auth/delete", json={"password": self.user["password"]}
        )
        assert response.status_code == 200
        res = response.json
        assert "message" in res and res["message"] == "Deleted user"

    def test_cannot_delete_account_with_invalid_password(self, client):
        self.register_user(client)
        self.login_user(client)

        response = client.post(
            "/api/auth/delete", json={"password": "incorrectpassword"}
        )
        assert response.status_code == 400


class TestClassConfirmUser(BaseTestUser):
    def get_confirmation_token(self, client_database):
        user = User.query.filter_by(username=self.user["username"]).first()
        return user.generate_confirmation_token()

    def test_resend_confirmation(self, client):
        self.register_user(client)
        self.login_user(client)

        response = client.get("/api/auth/confirm")
        assert response.status_code == 200

    def test_confirm_user(self, client, client_database):
        token = self.get_confirmation_token(client_database)
        url = f"/api/auth/confirm/{token}"
        response = client.post(url)
        assert response.status_code == 200

    def test_does_not_resend_if_confirmed(self, client):
        response = client.get("/api/auth/confirm")
        assert response.status_code == 400


class TestClassPasswordReset(BaseTestUser):
    new_password = "admin123"

    def test_must_be_logged_out_to_request_reset(self, client):
        self.register_user(client)
        self.login_user(client)

        response = client.post("/api/auth/reset", json={"email": self.user["email"]})

        assert response.status_code == 400
        self.logout_user(client)

    def test_password_reset_request(self, client):
        response = client.post("/api/auth/reset", json={"email": self.user["email"]})
        assert response.status_code == 200

    def get_reset_token(self, client_database):
        user = User.query.filter_by(username=self.user["username"]).first()
        return user.generate_reset_token()

    def test_does_not_reset_password_with_invalid_token(self, client):
        token = "invalid"
        url = f"/api/auth/reset/{token}"
        response = client.post(
            url,
            json={"password": self.new_password, "confirm_password": self.new_password},
        )
        assert response.status_code == 400

    def test_password_reset(self, client, client_database):
        token = self.get_reset_token(client_database)
        url = f"/api/auth/reset/{token}"
        response = client.post(
            url,
            json={"password": self.new_password, "confirm_password": self.new_password},
        )
        assert response.status_code == 200

    def test_can_login_with_new_password(self, client):
        response = client.post(
            "/api/auth/login",
            json={"email": self.user["email"], "password": self.new_password},
        )
        assert response.status_code == 200


class TestClassChangeEmail(BaseTestUser):
    new_email = "johnny123@example.com"

    def test_change_email_request_invalid(self, client):
        self.register_user(client)
        self.login_user(client)
        response = client.post(
            "/api/auth/change_email",
            json={"email": self.user["email"], "password": "wrongpassword"},
        )
        assert response.status_code == 400

    def test_change_email_request(self, client):
        response = client.post(
            "/api/auth/change_email",
            json={"email": self.user["email"], "password": self.user["password"]},
        )
        assert response.status_code == 200

    def get_email_change_token(self, client_database):
        user = User.query.filter_by(username=self.user["username"]).first()
        return user.generate_email_change_token(self.new_email)

    def test_change_email_invalid_token(self, client):
        token = "invalid"
        url = f"/api/auth/change_email/{token}"
        response = client.post(url)
        assert response.status_code == 400

    def test_change_email(self, client, client_database):
        token = self.get_email_change_token(client_database)
        url = f"/api/auth/change_email/{token}"
        response = client.post(url)
        assert response.status_code == 200


@pytest.mark.usefixtures("client", "client_database")
class TestClassAdvanced:
    users = [
        {"username": "user1", "email": "user1@example.com", "password": "password"},
        {"username": "user2", "email": "user2@example.com", "password": "password"},
        {"username": "user3", "email": "user3@example.com", "password": "password"},
    ]

    def test_register_multiple_users(self, client):
        for user in self.users:
            res = client.post("/api/auth/register", json=user)
            assert res.status_code == 201

    def test_login_multiple_users(self, client):
        for user in self.users:
            res = client.post("/api/auth/login", json=user)
            assert res.status_code == 200

    def test_logout_multiple_users(self, client):
        for user in self.users:
            res = client.post("/api/auth/login", json=user)
            assert res.status_code == 200
            res = client.post("/api/auth/logout")
            assert res.status_code == 200


@pytest.mark.usefixtures("client", "client_database")
class TestClassLoad:
    fake = Faker()
    count = 100
    fake_users = []

    def test_multiple_registers_and_login(self, client, client_database):
        for i in range(self.count):
            payload = {
                "email": self.fake.email(),
                "username": self.fake.user_name(),
                "password": "password",
            }
            self.fake_users.append(payload)
            res = client.post("/api/auth/register", json=payload)
            assert res.status_code == 201
            res = client.post("/api/auth/login", json=payload)
            assert res.status_code == 200
