import importlib
from types import SimpleNamespace

from flask import Flask

foods_routes = importlib.import_module("app.routes.foods")


class FakeUser:
    id = "user-123"


def test_get_foods_returns_food_list(monkeypatch):
    user = FakeUser()
    app = Flask(__name__)

    fake_food = SimpleNamespace(
        id="food-1",
        name="Tomato",
        brand="Fresh",
        calories_per_100g=20,
        calories_per_100ml=None,
        protein_per_100g=1,
        carbs_per_100g=4,
        fat_per_100g=0.2,
        source="seed",
        image_url=None,
    )

    monkeypatch.setattr(foods_routes, "search_foods", lambda current_user, query, limit: ([fake_food], False))
    monkeypatch.setattr(foods_routes, "dump_food", lambda food: {
        "id": str(food.id),
        "name": food.name,
        "brand": food.brand,
        "calories_per_100g": float(food.calories_per_100g),
        "calories_per_100ml": None,
        "protein_per_100g": float(food.protein_per_100g),
        "carbs_per_100g": float(food.carbs_per_100g),
        "fat_per_100g": float(food.fat_per_100g),
        "source": food.source,
        "image_url": food.image_url,
    })

    with app.app_context():
        with app.test_request_context("/api/foods?q=tomato&limit=20"):
            result = foods_routes.get_foods.__wrapped__(user)

    response, status_code = result
    assert status_code == 200
    payload = response.get_json()
    assert payload["query"] == "tomato"
    assert payload["fetched_from_open_food_facts"] is False
    assert payload["foods"][0]["name"] == "Tomato"


def test_get_foods_rejects_invalid_limit():
    app = Flask(__name__)
    user = FakeUser()

    with app.app_context():
        with app.test_request_context("/api/foods?limit=bad"):
            result = foods_routes.get_foods.__wrapped__(user)

    response, status_code = result
    assert status_code == 400
    payload = response.get_json()
    assert payload["error"]["code"] == "invalid_query"


def test_post_custom_creates_food(monkeypatch):
    app = Flask(__name__)
    user = FakeUser()

    created_food = SimpleNamespace(
        id="custom-food-1",
        name="My Pasta",
        brand=None,
        calories_per_100g=250,
        calories_per_100ml=None,
        protein_per_100g=12,
        carbs_per_100g=40,
        fat_per_100g=5,
        source="custom",
        image_url=None,
    )

    monkeypatch.setattr(foods_routes, "create_custom_food", lambda current_user, data: created_food)
    monkeypatch.setattr(foods_routes, "dump_food", lambda food: {
        "id": str(food.id),
        "name": food.name,
        "brand": food.brand,
        "calories_per_100g": float(food.calories_per_100g),
        "calories_per_100ml": None,
        "protein_per_100g": float(food.protein_per_100g),
        "carbs_per_100g": float(food.carbs_per_100g),
        "fat_per_100g": float(food.fat_per_100g),
        "source": food.source,
        "image_url": food.image_url,
    })

    payload = {
        "name": "My Pasta",
        "calories_per_100g": 250,
        "protein_per_100g": 12,
        "carbs_per_100g": 40,
        "fat_per_100g": 5,
    }

    with app.app_context():
        with app.test_request_context("/api/foods/custom", method="POST", json=payload):
            result = foods_routes.post_custom.__wrapped__(user)

    response, status_code = result
    assert status_code == 201
    assert response.get_json()["food"]["name"] == "My Pasta"
