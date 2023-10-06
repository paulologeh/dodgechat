import logging

from flask import Blueprint, session, request
from flask_login import current_user

from app import db
from app.errors import (
    bad_request,
    conflict,
    forbidden,
    internal_sever_error,
    not_found,
    unauthorized,
    unprocessable_entity,
)

logger = logging.getLogger(__name__)

api = Blueprint("api", __name__, url_prefix="/api")


@api.before_request
def handle_before_request():
    if current_user.is_authenticated:
        current_user.ping()
        db.session.commit()

        if request.cookies.get("remember_token") is None:
            session.modified = True
            logger.info("Reset session for user %s" % current_user.id)


@api.after_request
def handle_after_request(response):
    return response


@api.errorhandler(500)
def handle_internal_error(exception):
    logger.error(exception)
    return internal_sever_error(exception)


@api.errorhandler(422)
def handle_unprocessable_entity(e):
    logger.info(e)
    return unprocessable_entity(e.description)


@api.errorhandler(409)
def handle_conflict(e):
    logger.info(e)
    return conflict(e.description)


@api.errorhandler(404)
def handle_not_found(e):
    logger.info(e)
    return not_found(e.description)


@api.errorhandler(403)
def handle_forbidden(e):
    logger.info(e)
    return forbidden(e.description)


@api.errorhandler(401)
def handle_unauthorised(e):
    logger.info(e)
    return unauthorized(e.description)


@api.errorhandler(400)
def handle_bad_request(e):
    logger.info(e)
    return bad_request(e.description)
