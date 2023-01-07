from flask import current_app


def test_app_exists(app):
    assert current_app is not None


def test_app_is_testing(app):
    assert current_app.config["TESTING"]
