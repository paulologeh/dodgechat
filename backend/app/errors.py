from typing import List

from flask import jsonify


def unprocessable_entity(messages: List[str]) -> object:
    response = jsonify({"error": "unprocessable entity", "messages": messages})
    response.status_code = 422
    return response


def bad_request(message: str) -> object:
    response = jsonify({"error": "bad request", "message": message})
    response.status_code = 400
    return response


def unauthorized(message: str) -> object:
    response = jsonify({"error": "unauthorized", "message": message})
    response.status_code = 401
    return response


def forbidden(message: str) -> object:
    response = jsonify({"error": "forbidden", "message": message})
    response.status_code = 403
    return response


def internal_sever_error(message: str) -> object:
    response = jsonify({"error": "internal server error", "message": message})
    response.status_code = 500
    return response


def not_found(message: str) -> object:
    response = jsonify({"error": "not found", "message": message})
    response.status_code = 404
    return response


def conflict(message: str) -> object:
    response = jsonify({"error": "conflict", "message": message})
    response.status_code = 409
    return response
