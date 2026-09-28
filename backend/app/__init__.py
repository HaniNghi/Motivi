import os
from pathlib import Path

from flask import Flask
from flask_cors import CORS

from .database import db, migrate
from .routes import register_blueprints


def create_app():
    app = Flask(__name__)

    def get_db_password() -> str:
        secret_path = os.getenv("POSTGRES_PASSWORD_FILE")
        if secret_path:
            try:
                return Path(secret_path).read_text().strip()
            except FileNotFoundError:
                pass
        return os.getenv("POSTGRES_PASSWORD", "")

    user = os.getenv("POSTGRES_USER", "motivi")
    db_name = os.getenv("POSTGRES_DB", "calorie")
    password = get_db_password()

    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"postgresql://{user}:{password}@db:5432/{db_name}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


    db.init_app(app)

    migrate.init_app(app, db, directory="migrations")
    CORS(app)

    from app import models
    from app.routes import register_blueprints
    # from app.errors import register_error_handlers

    register_blueprints(app)
    return app
