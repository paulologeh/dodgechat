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

app = create_app(os.getenv("ENVIRONMENT"))
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
        from app.utils import get_test_emails, get_test_conversation

        test_emails = get_test_emails()
        # create users
        for _email in test_emails:
            _user = user.User.query.filter_by(email=_email).first()

            if _user:
                db.session.delete(_user)

            db.session.commit()

            _username = _email.replace("@example.com", "")
            _name = " ".join([name.capitalize() for name in _username.split(".")])

            _user = user.User(
                email=_email,
                username=_username,
                password="password",
                confirmed=True,
                name=_name,
                location="London, England",
                about_me="I am a test account",
            )
            db.session.add(_user)
            db.session.commit()

        # create relationships
        # all users add the first user
        first_user = user.User.query.filter_by(email=test_emails[0]).first()
        blocked_email = test_emails[-1]

        for idx, _email in enumerate(test_emails[1:]):
            _user = user.User.query.filter_by(email=_email).first()

            if _email == blocked_email:
                friendship = relationship.Relationship(
                    requester_id=first_user.id,
                    addressee_id=_user.id,
                    relationship_type=relationship.RelationshipType.BLOCK,
                )
                db.session.add(friendship)
                continue

            # first user adds all even users
            if (idx % 2) == 0:
                friendship = relationship.Relationship(
                    requester_id=first_user.id,
                    addressee_id=_user.id,
                    relationship_type=relationship.RelationshipType.FRIEND,
                )
                db.session.add(friendship)

            # first user is added by all users
            friendship = relationship.Relationship(
                requester_id=_user.id,
                addressee_id=first_user.id,
                relationship_type=relationship.RelationshipType.FRIEND,
            )
            db.session.add(friendship)

        db.session.commit()

        # start conversation between first_user and friends
        for index in range(1, len(test_emails), 2):
            _email = test_emails[index]
            _user = user.User.query.filter_by(email=_email).first()

            _conversation = conversation.Conversation(
                _sender_id=first_user.id, recipient_id=_user.id
            )
            db.session.add(_conversation)
            db.session.commit()

            test_conversations = get_test_conversation()
            messages = [
                message.Message(
                    sender_id=first_user.id if (idx % 2) == 0 else _user.id,
                    conversation_id=_conversation.id,
                    body=message_body,
                )
                for idx, message_body in enumerate(test_conversations)
            ]

            db.session.add_all(messages)
            db.session.commit()

        print("Successfully created test accounts")
    except Exception as e:
        print("Failed to create tests accounts")
        print(str(e))
