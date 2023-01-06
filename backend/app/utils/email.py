from flask import render_template
from flask_mail import Message
from app.tasks import send_async_email
import os


def send_email(to, subject, template, **kwargs):
    msg = Message(
        "[Dodgechat]" + " " + subject,
        sender=f'[Dodgechat] <{os.environ.get("MAIL_USERNAME", "")}>',
        recipients=[to],
    )
    msg.body = render_template(template + ".txt", **kwargs)
    msg.html = render_template(template + ".html", **kwargs)
    send_async_email.delay(msg)
