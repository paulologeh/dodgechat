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