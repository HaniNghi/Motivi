from flask import Blueprint, jsonify, request
from sqlalchemy import text
from app.database import db
from marshmallow import ValidationError

from app.schemas.auth import RegisterSchema, RefreshSchema, LoginSchema
from app.errors import error_response, first_martshmallow_message
from app.services.auth import register_user, session_payload, login_user

auth = Blueprint('auth', __name__, url_prefix='/api/auth')

def load_json(schema):
    payload = request.get_json(silent=True)
    if payload is None:
        payload = {}
    return schema.load(payload)

@auth.route("/home")
def home():
    try:
        with db.session.connection() as conn:
            conn.execute(text("SELECT 1"))
        return "Hello Motivi — connected to PostgreSQL"
    except Exception as exc:
        return f"Hello Motivi — DB error: {exc}", 500


@auth.post("/register")
def register():
    try:
        data = load_json(RegisterSchema())
    except ValidationError as exc:
        return error_response("invalid_body", first_martshmallow_message(exc), 400)
    try:
        user, refresh = register_user(
            data["email"], data["password"], data.get("display_name")
        )
    except ValueError as exc:
        if str(exc) == "email_taken":
            return error_response("email_taken", "An account with this email already exists", 409)
        raise
    return jsonify(session_payload(user,refresh)), 201

@auth.post("/login")
def login():
    try:
        data = load_json(LoginSchema())
    except ValidationError as exc:
        return error_response("invalid_body", first_martshmallow_message(exc), 400)
    try:
        user, refresh = login_user(data["email"], data["password"])
    except ValueError:
        return error_response("invalid_credentials", "Email or password is incorrect", 401)
    return jsonify(session_payload(user, refresh)), 200