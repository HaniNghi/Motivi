

from flask import Blueprint
from sqlalchemy import text
from app.database import db


api = Blueprint('api', __name__, url_prefix='/api')

@api.route("/")
def home():
    try:
        with db.session.connection() as conn:
            conn.execute(text("SELECT 1"))
        return "Hello Motivi — connected to PostgreSQL"
    except Exception as exc:
        return f"Hello Motivi — DB error: {exc}", 500