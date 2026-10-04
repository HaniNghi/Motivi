from decimal import Decimal

from flask import Flask

from app.database.db import db
from app.database.seed import SEED_FOODS, seed_foods
from app.models.food import Food
from app.services.foods import dump_food


def _create_sqlite_app():
    app = Flask(__name__)
    app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI="sqlite://",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )
    db.init_app(app)

    with app.app_context():
        db.drop_all()
        db.create_all()

    return app


def test_seed_food_catalog_has_no_duplicates_and_is_sorted():
    names = [item[0] for item in SEED_FOODS]

    assert len(names) == len(set(name.lower() for name in names))
    assert SEED_FOODS == sorted(SEED_FOODS, key=lambda item: (item[1], item[0].lower()))


def test_dump_food_serializes_decimal_fields():
    food = Food(
        name="Rice",
        calories_per_100g=Decimal("130"),
        protein_per_100g=Decimal("2.5"),
        carbs_per_100g=Decimal("28"),
        fat_per_100g=Decimal("0.5"),
        source="seed",
    )

    payload = dump_food(food)

    assert payload == {
        "id": str(food.id),
        "off_code": None,
        "name": "Rice",
        "brand": None,
        "calories_per_100g": 130.0,
        "calories_per_100ml": None,
        "protein_per_100g": 2.5,
        "carbs_per_100g": 28.0,
        "fat_per_100g": 0.5,
        "source": "seed",
        "image_url": None,
    }


def test_seed_foods_inserts_seed_rows_once():
    app = _create_sqlite_app()

    with app.app_context():
        inserted = seed_foods()

        assert inserted == len(SEED_FOODS)
        assert Food.query.filter_by(source="seed").count() == len(SEED_FOODS)

        repeated = seed_foods()
        assert repeated == 0
