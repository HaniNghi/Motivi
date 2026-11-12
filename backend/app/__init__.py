import os
from pathlib import Path
from typing import Any

from flask import Flask
from flask_cors import CORS
from sqlalchemy.engine import URL

from .database import db, migrate


def _database_uri() -> str:
   
    password = os.getenv("POSTGRES_PASSWORD")

    if not password:
        raise RuntimeError(
            "Set POSTGRES_PASSWORD"
            "to configure the database password."
        )
    # Define DB_HOST, PORT in .env when not using localhost
    return URL.create(
        drivername="postgresql+psycopg",
        username=os.getenv("POSTGRES_USER", "motivi"),
        password=password,
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "5432")),
        database=os.getenv("POSTGRES_DB", "calorie"),
    ).render_as_string(hide_password=False)


def create_app(config: dict[str, Any] | None = None):
    app = Flask(__name__)
    database_uri = _database_uri()
    cors_origins = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "").split(",")
        if origin.strip()
    ]
    app.config.update(
        SQLALCHEMY_DATABASE_URI=database_uri,
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        CORS_ORIGINS=cors_origins,
    )
    if config:
        app.config.update(config)

    db.init_app(app)
    migrate.init_app(app, db, directory="migrations")
    if app.config["CORS_ORIGINS"]:
        CORS(app, origins=app.config["CORS_ORIGINS"])

    from app import models
    from app.database import seed
    from app.errors import register_error_handlers
    from app.routes import register_blueprints

    register_blueprints(app)
    register_error_handlers(app)

    @app.cli.command("seed-foods")
    def seed_foods_command():
        inserted = seed.seed_foods()
        print(f"Seeded {inserted} foods.")

    return app
