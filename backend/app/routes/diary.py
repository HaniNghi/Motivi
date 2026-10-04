from datetime import datetime

from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.routes.deps import require_auth
from app.errors import error_response, first_martshmallow_message
from app.schemas.diary import DiaryEntryCreateSchema, DiaryEntryPatchSchema
from app.services.diary import add_entry, diary_day_payload, delete_entry, get_owned_entry, patch_entry

diary = Blueprint("diary", __name__, url_prefix="/api/diary")

def parse_date(value: str | None):
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None

def load_json(schema):
    payload = request.get_json(silent=True)
    print("payload", payload)
    if payload is None:
        payload = {}
    return schema.load(payload)

@diary.get("")
@diary.get("/")
@require_auth
def get_diary(user):
    day = parse_date(request.args.get("date"))
    if day is None:
        return error_response("invalid_query", "date is required and must be YYYY-MM-DD",400)
    try:
        payload= diary_day_payload(user, day)
    except ValueError as exc:
        if str(exc) == "profile_not_found":
            return error_response("profile_not_found", "Complete the calculator before using the diary", 400)
        raise
    return jsonify(payload), 200

@diary.post("/entries")
@require_auth
def post_entry(user):
    try:
        data = load_json(DiaryEntryCreateSchema())
    except ValidationError as exc:
        return error_response("invalid_body", first_martshmallow_message(exc), 400)
    try:
        result = add_entry(user, data["food_id"], data["date"], data["amount_g"])
    except ValueError as exc:
        code = str(exc)
        if code == "food_not_found":
            return error_response("food_not_found", "Food does not exist or is not visible to this user.", 404)
        if code == "profile_not_found":
            return error_response("profile_not_found", "Complete the calculator before using the diary.", 400)
        raise
    return jsonify(result), 201

@diary.patch("/entries/<uuid:entry_id>")
@require_auth
def patch_entry_route(user, entry_id):
    entry = get_owned_entry(user, entry_id)
    if entry is None:
        return error_response("entry_not_found", "Diary entry does not exist or is not owned by this user", 404)
    try:
        data = load_json(DiaryEntryPatchSchema())
    except ValidationError as exc:
        return error_response("invalid_body", first_martshmallow_message(exc), 400)

    result = patch_entry(user, entry, data["amount_g"])

    return jsonify(result), 200

@diary.delete("/entries/<uuid:entry_id>")
@require_auth
def delete_entry_route(user, entry_id):
    entry = get_owned_entry(user, entry_id)
    if entry is None:
        return error_response("entry_not_found", "Diary entry does not exist or is not owned by this user", 404)
    result = delete_entry(user, entry)
    return jsonify(result), 200