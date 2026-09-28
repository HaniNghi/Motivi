from flask import Blueprint
from sqlalchemy import text
from app.database import db

auth = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth.route("/home")
def register():
    try:
        with db.session.connection() as conn:
            conn.execute(text("SELECT 1"))
        return "Hello Motivi — connected to PostgreSQL"
    except Exception as exc:
        return f"Hello Motivi — DB error: {exc}", 500