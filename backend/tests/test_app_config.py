from unittest.mock import Mock

from app import create_app
from app.database import db
from app.database import seed as food_seed
from app.models import Food


def test_create_app_uses_database_url_override(monkeypatch):
    monkeypatch.setenv(
        "DATABASE_URL",
        "postgresql+psycopg://motivi:password@db:5432/calorie",
    )
    app = create_app()

    assert app.config["SQLALCHEMY_DATABASE_URI"] == (
        "postgresql+psycopg://motivi:password@db:5432/calorie"
    )


def test_create_app_builds_escaped_database_uri_from_secret_file(monkeypatch, tmp_path):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    password_file = tmp_path / "db-password"
    password_file.write_text("p@ss/word")
    monkeypatch.setenv("POSTGRES_PASSWORD_FILE", str(password_file))
    monkeypatch.setenv("POSTGRES_USER", "motivi")
    monkeypatch.setenv("POSTGRES_DB", "calorie")
    monkeypatch.setenv("DB_HOST", "db")
    monkeypatch.setenv("DB_PORT", "5432")

    app = create_app()

    assert app.config["SQLALCHEMY_DATABASE_URI"] == (
        "postgresql+psycopg://motivi:p%40ss%2Fword@db:5432/calorie"
    )


def test_production_app_does_not_enable_wildcard_cors(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", "")
    seed = Mock()
    monkeypatch.setattr(food_seed, "seed_foods", seed)
    app = create_app({
        "SQLALCHEMY_DATABASE_URI": "sqlite://",
    })

    response = app.test_client().options(
        "/api/auth/register",
        headers={
            "Origin": "https://untrusted.example",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert "Access-Control-Allow-Origin" not in response.headers
    seed.assert_not_called()


def test_local_app_factory_does_not_seed_automatically(monkeypatch):
    seed = Mock()
    monkeypatch.setattr(food_seed, "seed_foods", seed)
    create_app({
        "SQLALCHEMY_DATABASE_URI": "sqlite://",
    })

    seed.assert_not_called()


def test_seed_foods_cli_is_repeatable(monkeypatch, tmp_path):
    app = create_app({
        "SQLALCHEMY_DATABASE_URI": f"sqlite:///{tmp_path / 'foods.sqlite'}",
    })

    with app.app_context():
        db.create_all()

    runner = app.test_cli_runner()
    first = runner.invoke(args=["seed-foods"])
    second = runner.invoke(args=["seed-foods"])

    assert first.exit_code == 0
    assert "Seeded" in first.output
    assert second.exit_code == 0
    assert "Seeded 0 foods." in second.output
    with app.app_context():
        assert Food.query.filter_by(source="seed").count() > 0
