import logging

from flask import Blueprint

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


@api.errorhandler(500)
def handle_internal_error(exception):
    logger.error(exception)
    return internal_sever_error(exception)


@api.errorhandler(422)
def handle_unprocessable_entity(e):
    logger.info("Unprocessable entity %s", e)
    return unprocessable_entity(e)


@api.errorhandler(409)
def handle_conflict(e):
    logger.info("Conflict %s", e)
    return conflict(e)


@api.errorhandler(404)
def handle_not_found(e):
    logger.info("Not found %s", e)
    return not_found(e)


@api.errorhandler(403)
def handle_forbidden(e):
    logger.info("Forbidden %s", e)
    return forbidden(e)


@api.errorhandler(401)
def handle_unauthorised(e):
    logger.info("Unauthorized %s", e)
    return unauthorized(e)


@api.errorhandler(400)
def handle_bad_request(e):
    logger.info("Bad request %s", e)
    return bad_request(e)
