import os
from app import mail, celery, create_app


@celery.task(serializer="pickle")
def send_async_email(msg):
    celery_app = create_app(os.environ.get("ENVIRONMENT"))
    with celery_app.app_context():
        mail.send(msg)
