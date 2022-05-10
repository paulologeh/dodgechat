import pytest

from app import create_app, db


@pytest.fixture(scope="session")
def app():
    app = create_app("TESTING")

    with app.app_context():
        yield app


@pytest.fixture(scope="session")
def client(app):
    return app.test_client(use_cookies=True)


@pytest.fixture(scope="class")
def client_database(app):
    db.app = app

    with app.app_context():
        db.create_all()

    yield db

    db.session.remove()
    db.drop_all()


@pytest.fixture()
def runner(app):
    return app.test_cli_runner()


@pytest.fixture(scope="function")
def database(app):
    db.app = app

    with app.app_context():
        db.create_all()

    yield db

    db.session.remove()
    db.drop_all()
