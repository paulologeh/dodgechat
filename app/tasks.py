import os
import logging
from app import mail, make_celery, create_celery_app

logger = logging.getLogger(__name__)

app = create_celery_app(os.environ.get("ENVIRONMENT"))
celery = make_celery(app)


@celery.task(serializer="pickle")
def send_async_email(msg):
    try:
        mail.send(msg)
    except Exception as e:
        logger.exception(e)
