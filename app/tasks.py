import os
import logging
from app import mail, celery, create_app

logger = logging.getLogger(__name__)


@celery.task(serializer="pickle")
def send_async_email(msg):
    celery_app = create_app(os.environ.get("ENVIRONMENT"))
    with celery_app.app_context():
        try:
            mail.send(msg)
        except Exception as e:
            logger.exception(e)
