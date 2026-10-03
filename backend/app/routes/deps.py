from flask import request
from functools import wraps
from app.errors import error_response
from app.services.auth import decode_access_token
from app.database import db
from app.models import User

import uuid


def get_bearer_token():
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    token = header[7:].strip()
    return token or None

def current_user_or_error():
    token = get_bearer_token()
    if not token:
        return None, error_response("unauthorized", " Access token is missing", 401)
    user_id, reason = decode_access_token(token)
    if reason == "expired":
        return None, error_response("unauthorized", " Access token is expired", 401)
    if reason == "invalid_signature":
        return None, error_response("unauthorized", " Access token signature is invalid", 401)
    if not user_id:
        return None, error_response("unauthorized", " Access token is invalid", 401)
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        return None, error_response("unauthorized", " Access token is invalid", 401)
    user = db.session.get(User, uid)
    if user is None:
        return None, error_response("unauthorized", " Access token is invalid", 401)
    return user, None

def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user, err = current_user_or_error()
        if err:
            return err
        return fn(user, *args, **kwargs)
    return wrapper