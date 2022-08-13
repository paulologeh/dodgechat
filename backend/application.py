import logging
import os
import socket

from dotenv import load_dotenv
from flask_migrate import Migrate

from app import create_app, db
from app.models import *

load_dotenv()

logging.basicConfig(
    filename="flask.log",
    level=logging.DEBUG,
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

werkzeug_logger = logging.getLogger("werkzeug")
werkzeug_logger.level = logging.DEBUG

flask_cors_logger = logging.getLogger("flask_cors")
flask_cors_logger.level = logging.ERROR


app = create_app(os.getenv("ENVIRONMENT"))
migrate = Migrate(app, db)
app.logger.setLevel(logging.DEBUG)
