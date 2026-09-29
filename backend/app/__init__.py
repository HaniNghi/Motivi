import os
from pathlib import Path

from flask import Flask
from flask_cors import CORS

from .database import db, migrate
from .routes import register_blueprints


def create_app():
    app = Flask(__name__)

    # Reads the PostgreSQL password from the environment first, then the Docker secret file,
    # and finally falls back to the repo-level db/password.txt so local backend runs can connect.
    def get_db_password() -> str:
        secret_path = os.getenv("POSTGRES_PASSWORD_FILE")
        if secret_path:
            try:
                return Path(secret_path).read_text().strip()
            except FileNotFoundError:
                pass

        env_password = os.getenv("POSTGRES_PASSWORD")
        if env_password:
            return env_password

        repo_root = Path(__file__).resolve().parents[2]
        default_secret = repo_root / "db" / "password.txt"
        if default_secret.exists():
            return default_secret.read_text().strip()

        return ""

    user = os.getenv("POSTGRES_USER")
    db_name = os.getenv("POSTGRES_DB")
    password = get_db_password()


    # Use when backend runs inside Docker and talks to the db service on the Compose network.
    # app.config["SQLALCHEMY_DATABASE_URI"] = (
    #     f"postgresql://{user}:{password}@db:5432/{db_name}"
    # )

    # Use when backend runs locally on your machine and connects to the Docker PostgreSQL exposed on localhost.
    app.config["SQLALCHEMY_DATABASE_URI"] = (
            f"postgresql://{user}:{password}@localhost:5432/{db_name}"
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
