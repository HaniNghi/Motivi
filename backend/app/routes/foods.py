from flask import request, jsonify, Blueprint
from marshmallow import ValidationError

from app.routes.deps import require_auth
from app.errors import error_response, first_martshmallow_message
from app.schemas.foods import CustomFoodSchema
from app.services.foods import create_custom_food, search_foods, dump_food
from app.services.off import OffUnavailable 

foods = Blueprint("foods", __name__, url_prefix="/api/foods")

def load_json(schema):
    payload = request.get_json(silent=True)
    print("payload", payload)
    if payload is None:
        payload = {}
    return schema.load(payload)

@foods.get("")
@foods.get("/")
@require_auth
def get_foods(user):
    raw_limit = request.args.get("limit", "20")
    try:
        limit = int(raw_limit)
    except (TypeError, ValueError):
        return error_response("invalid_query", "limit must be an integer between 1 and 50.", 400)
    if limit < 1 or limit > 50:
        return error_response("invalid_query", "limit must be an integer between 1 and 50.", 400)
    query = request.args.get("q", "")
    try:
        foods, fetched = search_foods(user, query, limit)
    except OffUnavailable:
        return error_response("off_unavailable"," Open Food Facts is unavailable and no local foods matched", 502)
    return jsonify({
        "query": query,
        "fetched_from_open_food_facts": fetched,
        "foods": [dump_food(item) for item in foods],
    }), 200

@foods.post("/custom")
@require_auth
def post_custom(user):
    try: 
        data = load_json(CustomFoodSchema())
    except ValidationError as exc:
        return error_response("invalid_body", first_martshmallow_message(exc), 400)
    food = create_custom_food(user, data)
    return jsonify({"food": dump_food(food)}), 201