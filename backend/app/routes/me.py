from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.routes.deps import require_auth
from app.errors import error_response, first_martshmallow_message
from app.schemas.me import ProfileInputSchema
from app.services.me import create_profile, update_profile, me_payload



me = Blueprint("me", __name__, url_prefix="/api/me")

def load_json(schema):
    payload = request.get_json(silent=True)
    print("payload", payload)
    if payload is None:
        payload = {}
    return schema.load(payload)

@me.get("")
@me.get("/")
@require_auth
def get_me(user):
    return jsonify(me_payload(user)), 200

@me.post("")
@me.post("/")
@require_auth
def post_me(user):
    print("user", user.email)
    try:
        data = load_json(ProfileInputSchema())
    except ValidationError as exc:
        return error_response("invalid_body", first_martshmallow_message(exc), 400)
    try:
        user = create_profile(user, data)
    except ValueError as exc:
        if str(exc) == "profile_exists":
            return error_response(
                "profile_exists", "Profile already exists."
            )
        raise
    return jsonify(me_payload(user)), 201

@me.put("")
@me.put("/")
@require_auth
def put_me(user):
    try:
        data = load_json(ProfileInputSchema())
    except ValidationError as exc:
        return error_response("invalid_body", first_martshmallow_message(exc), 400)
    try:
        user = update_profile(user, data)
    except ValueError as exc:
        if str(exc) == "profile_not_found":
            return error_response(
                "profile_not_found", "Profile does not exist."
            )
        raise
    return jsonify(me_payload(user)), 200


