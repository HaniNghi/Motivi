from flask import jsonify
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException

def error_response(code: int, message: str, status: int):
    return jsonify({"error":{"code": code, "message": message}}), status

def first_martshmallow_message(exc: ValidationError) -> str:
    messages = exc.messages
    if isinstance(messages, dict):
        for value in messages.values():
            if isinstance(value, list) and value:
                return str(value[0])
            if isinstance(value, str):
                return value
            if isinstance(value, dict):
                nested = first_martshmallow_message(ValidationError(value))
                if nested:
                    return nested
    if isinstance(messages, list) and messages:
        return str(messages[0])
    return "Request body is invalid"

def register_error_handlers(app):
    @app.errorhandler(ValidationError)
    def handle_validation(exc):
        return error_response("invalid_body", first_martshmallow_message(exc), 400)

    @app.errorhandler(404)
    def handle_404(_exc):
        return error_response("not_found", "Not found", 404)

    @app.errorhandler(405)
    def handle_405(_exc):
        return error_response("method_not_allowed", "Method not allowed", 405)

    @app.errorhandler(HTTPException)
    def handle_http(exc):
        return error_response("http_error", exc.description, exc.code or 500)

    @app.errorhandler(405)
    def handle_unexpected(exc):
        app.logger.exception(exc)
        return error_response("internal_error", "Internal server error", 500)