import logging
import os
import socket

from dotenv import load_dotenv
from flask_migrate import Migrate

from app import create_app, db
from app.models import *

load_dotenv()

LOG_LEVEL = int(os.getenv("LOG_LEVEL", 10))

logging.basicConfig(
    filename="flask.log",
    level=LOG_LEVEL,
    format="%(asctime)s - [%(container_id)s] [%(levelname)s] %(name)s "
    "[%(module)s.%(funcName)s:%(lineno)d]: %("
    "message)s",
    datefmt="%Y%m%d-%H:%M:%S",
)


old_factory = logging.getLogRecordFactory()


def record_factory(*args, **kwargs):
    record = old_factory(*args, **kwargs)
    record.container_id = socket.gethostname()
    return record


logging.setLogRecordFactory(record_factory)

app = create_app(os.getenv("ENVIRONMENT"))
migrate = Migrate(app, db)

for logger in (
    app.logger,
    logging.getLogger("werkzeug"),
    logging.getLogger("flask_cors"),
):
    logger.setLevel(LOG_LEVEL)
