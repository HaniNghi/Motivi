from datetime import datetime

from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.routes.deps import require_auth
from app.errors import error_response
from app.services.analytics import week_payload

analytics = Blueprint("analytics", __name__, url_prefix="/api/analytics")

@analytics.get("/week")
@require_auth
def get_week(user):
    raw = request.args.get("start")
    if not raw:
        return error_response("invalid_query", "start is required", 400)
    try:
        start = datetime.strptime(raw, "%Y-%m-%d").date()
    except ValueError:
        return error_response("invalid_query", "start must be YYYY-MM-DD", 400)
    try:
        payload = week_payload(user, start)
    except ValueError as exc:
        if str(exc) == "profile_not_found":
            return error_response("profile_not_found","Complete the calculator before using the diary", 400)
        raise
    return jsonify(payload), 200