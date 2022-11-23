import os
import logging
import socket

from dotenv import load_dotenv
from flask_migrate import Migrate

from app import create_app, db
from app.models import *

load_dotenv()

LOG_LEVEL = int(os.environ.get("LOG_LEVEL", 20))

logging.basicConfig(
    filename=os.environ.get("LOG_FILE_NAME", "flask.log"),
    level=LOG_LEVEL,
    format="%(asctime)s - [%(container_id)s] [%(levelname)s] %(name)s "
    "[%(module)s.%(funcName)s:%(lineno)d]: %(message)s",
    datefmt="%Y%m%d-%H-:%M:%S",
)

old_factory = logging.getLogRecordFactory()


def record_factory(*args, **kwargs):
    record = old_factory(*args, **kwargs)
    record.container_id = socket.gethostname()
    return record


logging.setLogRecordFactory(record_factory)

werkzeug_logger = logging.getLogger("werkzeug")
werkzeug_logger.level = LOG_LEVEL

app = create_app(os.getenv("ENVIRONMENT", "DEVELOPMENT"))
migrate = Migrate(app, db)

for logger in (
    app.logger,
    logging.getLogger("sqlalchemy"),
    logging.getLogger("werkzeug"),
    logging.getLogger("flask_cors"),
):
    logger.setLevel(LOG_LEVEL)


@app.cli.command("setup-database")
def setup_db():
    try:
        db.drop_all()
        print("Setting up database...")
        db.create_all()
        print("Database setup successfully")
    except Exception as e:
        print("Failed to setup database")
        print(str(e))


@app.cli.command("setup-test-accounts")
def setup_test_accounts():
    try:
        # create users
        for i in range(1, 5):
            _email = f"test_account_{i}@dodgechat.com"
            _user = user.User.query.filter_by(email=_email).first()

            if _user:
                # find and remove all relationships
                _relationships = relationship.Relationship.query.filter_by(
                    requester_id=_user.id
                ).delete()
                db.session.delete(_user)

            db.session.commit()

            _user = user.User(
                email=_email,
                username=f"test_account_{i}",
                password="password",
                confirmed=True,
                name=f"Test Account{i}",
                location="London, England",
                about_me="I am a test account",
            )
            db.session.add(_user)
            db.session.commit()

        # create relationships
        # all test accounts add test_account_1
        user_test_account_1 = user.User.query.filter_by(
            email="test_account_1@dodgechat.com"
        ).first()

        for i in range(2, 5):
            _email = f"test_account_{i}@dodgechat.com"
            _user = user.User.query.filter_by(email=_email).first()

            # test_account_1 adds the second user and blocks the fourth user
            if i == 2 or i == 4:
                friendship = relationship.Relationship(
                    requester_id=user_test_account_1.id,
                    addressee_id=_user.id,
                    relationship_type=relationship.RelationshipType.FRIEND
                    if i == 2
                    else relationship.RelationshipType.BLOCK,
                )
                db.session.add(friendship)

            # all users request friendship except the fourth as they are blocked
            if i != 4:
                friendship = relationship.Relationship(
                    requester_id=_user.id,
                    addressee_id=user_test_account_1.id,
                    relationship_type=relationship.RelationshipType.FRIEND,
                )
                db.session.add(friendship)

        db.session.commit()

        print("Successfully created test accounts")
    except Exception as e:
        print("Failed to create tests accounts")
        print(str(e))
