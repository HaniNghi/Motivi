import importlib
from decimal import Decimal
from types import SimpleNamespace
import pytest
from flask import Flask
from marshmallow import ValidationError

foods_routes = importlib.import_module("app.routes.foods")
from app.services import foods as foods_services
from app.services.foods import create_custom_food, dump_food
from app.schemas.foods import CustomFoodSchema
from app.errors import register_error_handlers
from app.models.food import Food


class FakeUser:
    """Mock user object representing an authenticated session user."""
    def __init__(self, id="user-123", email="tester@example.com"):
        self.id = id
        self.email = email


@pytest.fixture
def fake_user():
    return FakeUser()


@pytest.fixture
def valid_custom_food_payload():
    return {
        "name": "Greek Yogurt",
        "calories_per_100g": 100.0,
        "protein_per_100g": 10.0,
        "carbs_per_100g": 4.0,
        "fat_per_100g": 0.5,
    }


@pytest.fixture
def app(fake_user, monkeypatch):
    """Configures isolated test Flask app with mocked auth and registered routes."""
    test_app = Flask(__name__)
    test_app.config["TESTING"] = True

    register_error_handlers(test_app)

    # Mock authentication dependency so require_auth yields fake_user
    monkeypatch.setattr("app.routes.deps.current_user_or_error", lambda: (fake_user, None))

    test_app.register_blueprint(foods_routes.foods)
    return test_app


@pytest.fixture
def client(app):
    return app.test_client()


# ============================================================================
# 1. ENDPOINT TESTS: POST /api/foods/custom (Happy Path & Serialization)
# ============================================================================

def test_post_custom_food_happy_path(client, monkeypatch, fake_user, valid_custom_food_payload):
    """Happy Path: Submitting valid custom food returns HTTP 201 and serialized food object."""
    mock_food = SimpleNamespace(
        id="custom-101",
        off_code=None,
        name="Greek Yogurt",
        brand=None,
        calories_per_100g=Decimal("100.0"),
        calories_per_100ml=None,
        protein_per_100g=Decimal("10.0"),
        carbs_per_100g=Decimal("4.0"),
        fat_per_100g=Decimal("0.5"),
        source="custom",
        image_url=None,
    )

    created_call = {}

    def mock_create(user, data):
        created_call["user"] = user
        created_call["data"] = data
        return mock_food

    monkeypatch.setattr(foods_routes, "create_custom_food", mock_create)

    response = client.post("/api/foods/custom", json=valid_custom_food_payload)

    assert response.status_code == 201
    json_data = response.get_json()
    assert "food" in json_data

    food_data = json_data["food"]
    assert food_data["id"] == "custom-101"
    assert food_data["name"] == "Greek Yogurt"
    assert food_data["calories_per_100g"] == 100.0
    assert food_data["protein_per_100g"] == 10.0
    assert food_data["carbs_per_100g"] == 4.0
    assert food_data["fat_per_100g"] == 0.5
    assert food_data["source"] == "custom"
    assert food_data["calories_per_100ml"] is None

    # Verify service was invoked with authenticated user and deserialized data
    assert created_call["user"].id == fake_user.id
    assert created_call["data"]["name"] == "Greek Yogurt"
    assert created_call["data"]["calories_per_100g"] == 100.0


def test_post_custom_food_with_optional_calories_per_100ml(client, monkeypatch, valid_custom_food_payload):
    """Happy Path: Submitting with optional calories_per_100ml succeeds."""
    valid_custom_food_payload["calories_per_100ml"] = 85.0

    mock_food = SimpleNamespace(
        id="custom-102",
        off_code=None,
        name="Protein Shake",
        brand=None,
        calories_per_100g=Decimal("100.0"),
        calories_per_100ml=Decimal("85.0"),
        protein_per_100g=Decimal("10.0"),
        carbs_per_100g=Decimal("4.0"),
        fat_per_100g=Decimal("0.5"),
        source="custom",
        image_url=None,
    )

    monkeypatch.setattr(foods_routes, "create_custom_food", lambda user, data: mock_food)

    response = client.post("/api/foods/custom", json=valid_custom_food_payload)

    assert response.status_code == 201
    food_data = response.get_json()["food"]
    assert food_data["calories_per_100ml"] == 85.0


@pytest.mark.parametrize("name_length", [1, 120])
def test_post_custom_food_boundary_name_lengths(client, monkeypatch, valid_custom_food_payload, name_length):
    """Happy Path: Boundary testing for name length of exactly 1 and 120 characters."""
    valid_custom_food_payload["name"] = "X" * name_length

    mock_food = SimpleNamespace(
        id="custom-boundary-name",
        off_code=None,
        name=valid_custom_food_payload["name"],
        brand=None,
        calories_per_100g=Decimal("100.0"),
        calories_per_100ml=None,
        protein_per_100g=Decimal("10.0"),
        carbs_per_100g=Decimal("4.0"),
        fat_per_100g=Decimal("0.5"),
        source="custom",
        image_url=None,
    )

    monkeypatch.setattr(foods_routes, "create_custom_food", lambda user, data: mock_food)

    response = client.post("/api/foods/custom", json=valid_custom_food_payload)
    assert response.status_code == 201
    assert response.get_json()["food"]["name"] == "X" * name_length


def test_post_custom_food_boundary_numeric_limits(client, monkeypatch):
    """Happy Path: Test minimum allowed (0) and maximum physical allowed values (900 cal, 100g macros)."""
    boundary_payload = {
        "name": "Extreme Nutrient Bar",
        "calories_per_100g": 900.0,
        "protein_per_100g": 100.0,
        "carbs_per_100g": 100.0,
        "fat_per_100g": 100.0,
    }

    mock_food = SimpleNamespace(
        id="custom-boundary-limits",
        off_code=None,
        name="Extreme Nutrient Bar",
        brand=None,
        calories_per_100g=Decimal("900.0"),
        calories_per_100ml=None,
        protein_per_100g=Decimal("100.0"),
        carbs_per_100g=Decimal("100.0"),
        fat_per_100g=Decimal("100.0"),
        source="custom",
        image_url=None,
    )

    monkeypatch.setattr(foods_routes, "create_custom_food", lambda user, data: mock_food)

    response = client.post("/api/foods/custom", json=boundary_payload)
    assert response.status_code == 201
    food_data = response.get_json()["food"]
    assert food_data["calories_per_100g"] == 900.0
    assert food_data["protein_per_100g"] == 100.0


# ============================================================================
# 2. ENDPOINT TESTS: Authentication & Authorization
# ============================================================================

def test_post_custom_food_unauthorized_when_not_logged_in(app, monkeypatch, valid_custom_food_payload):
    """Endpoint: Rejects unauthenticated requests with HTTP 401."""
    from app.errors import error_response

    monkeypatch.setattr(
        "app.routes.deps.current_user_or_error",
        lambda: (None, error_response("unauthorized", "Access token is missing", 401)),
    )

    unauth_client = app.test_client()
    response = unauth_client.post("/api/foods/custom", json=valid_custom_food_payload)

    assert response.status_code == 401
    assert response.get_json()["error"]["code"] == "unauthorized"


# ============================================================================
# 3. ENDPOINT TESTS: Validation & Edge Cases (400 Bad Request)
# ============================================================================

@pytest.mark.parametrize("missing_field", [
    "name",
    "calories_per_100g",
    "protein_per_100g",
    "carbs_per_100g",
    "fat_per_100g",
])
def test_post_custom_food_missing_required_fields(client, monkeypatch, valid_custom_food_payload, missing_field):
    """Validation: Missing any required field returns HTTP 400 Bad Request."""
    service_called = []
    monkeypatch.setattr(foods_routes, "create_custom_food", lambda u, d: service_called.append(True))

    del valid_custom_food_payload[missing_field]

    response = client.post("/api/foods/custom", json=valid_custom_food_payload)

    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data["error"]["code"] == "invalid_body"
    assert missing_field in json_data["error"]["message"].lower() or "required" in json_data["error"]["message"].lower()
    assert not service_called


def test_post_custom_food_empty_json_payload(client, monkeypatch):
    """Validation: Submitting an empty JSON body returns HTTP 400."""
    service_called = []
    monkeypatch.setattr(foods_routes, "create_custom_food", lambda u, d: service_called.append(True))

    response = client.post("/api/foods/custom", json={})

    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "invalid_body"
    assert not service_called


def test_post_custom_food_non_json_payload(client, monkeypatch):
    """Validation: Submitting non-JSON or malformed payload returns HTTP 400."""
    service_called = []
    monkeypatch.setattr(foods_routes, "create_custom_food", lambda u, d: service_called.append(True))

    response = client.post(
        "/api/foods/custom",
        data="not a json string",
        content_type="text/plain",
    )

    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "invalid_body"
    assert not service_called


@pytest.mark.parametrize("field, invalid_value", [
    ("calories_per_100g", 900.1),
    ("calories_per_100g", 1500),
    ("calories_per_100ml", 900.1),
    ("protein_per_100g", 100.1),
    ("protein_per_100g", 120),
    ("carbs_per_100g", 100.01),
    ("carbs_per_100g", 250),
    ("fat_per_100g", 100.1),
    ("fat_per_100g", 999),
])
def test_post_custom_food_values_exceeding_physical_limits(client, monkeypatch, valid_custom_food_payload, field, invalid_value):
    """Validation: Values exceeding physical limits (calories > 900, macros > 100g) return HTTP 400."""
    service_called = []
    monkeypatch.setattr(foods_routes, "create_custom_food", lambda u, d: service_called.append(True))

    valid_custom_food_payload[field] = invalid_value

    response = client.post("/api/foods/custom", json=valid_custom_food_payload)

    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "invalid_body"
    assert not service_called


@pytest.mark.parametrize("field, negative_value", [
    ("calories_per_100g", -1.0),
    ("calories_per_100g", -0.01),
    ("calories_per_100ml", -50.0),
    ("protein_per_100g", -0.1),
    ("protein_per_100g", -10),
    ("carbs_per_100g", -0.05),
    ("carbs_per_100g", -100),
    ("fat_per_100g", -1),
    ("fat_per_100g", -0.001),
])
def test_post_custom_food_negative_numbers_rejected(client, monkeypatch, valid_custom_food_payload, field, negative_value):
    """Validation: Negative values for calories or macronutrients return HTTP 400."""
    service_called = []
    monkeypatch.setattr(foods_routes, "create_custom_food", lambda u, d: service_called.append(True))

    valid_custom_food_payload[field] = negative_value

    response = client.post("/api/foods/custom", json=valid_custom_food_payload)

    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "invalid_body"
    assert not service_called


def test_post_custom_food_name_empty_string(client, monkeypatch, valid_custom_food_payload):
    """Validation: Name with 0 characters returns HTTP 400."""
    valid_custom_food_payload["name"] = ""

    response = client.post("/api/foods/custom", json=valid_custom_food_payload)

    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "invalid_body"


def test_post_custom_food_name_exceeding_max_length(client, monkeypatch, valid_custom_food_payload):
    """Validation: Name exceeding 120 characters returns HTTP 400."""
    valid_custom_food_payload["name"] = "A" * 121

    response = client.post("/api/foods/custom", json=valid_custom_food_payload)

    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "invalid_body"


@pytest.mark.parametrize("field, invalid_type_val", [
    ("name", 12345),
    ("calories_per_100g", "not-a-number"),
    ("protein_per_100g", "high-protein"),
    ("carbs_per_100g", [10, 20]),
    ("fat_per_100g", {"amount": 5}),
])
def test_post_custom_food_invalid_data_types(client, monkeypatch, valid_custom_food_payload, field, invalid_type_val):
    """Validation: Invalid data types for schema fields return HTTP 400."""
    valid_custom_food_payload[field] = invalid_type_val

    response = client.post("/api/foods/custom", json=valid_custom_food_payload)

    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "invalid_body"


# ============================================================================
# 4. SERVICE UNIT TESTS: create_custom_food
# ============================================================================

def test_create_custom_food_service_persists_and_returns_food(fake_user, valid_custom_food_payload, monkeypatch):
    """Service: create_custom_food instantiates Food, persists to db.session, and commits."""
    added_objects = []
    commit_called = []

    class FakeSession:
        def add(self, obj):
            added_objects.append(obj)

        def commit(self):
            commit_called.append(True)

    monkeypatch.setattr(foods_services.db, "session", FakeSession())

    result_food = create_custom_food(fake_user, valid_custom_food_payload)

    assert isinstance(result_food, Food)
    assert result_food.name == "Greek Yogurt"
    assert result_food.calories_per_100g == Decimal("100.0")
    assert result_food.protein_per_100g == Decimal("10.0")
    assert result_food.carbs_per_100g == Decimal("4.0")
    assert result_food.fat_per_100g == Decimal("0.5")
    assert result_food.calories_per_100ml is None
    assert result_food.source == "custom"
    assert result_food.created_by_user_id == fake_user.id

    assert len(added_objects) == 1
    assert added_objects[0] is result_food
    assert len(commit_called) == 1


def test_create_custom_food_service_strips_name_whitespace(fake_user, valid_custom_food_payload, monkeypatch):
    """Service: create_custom_food strips leading and trailing whitespace from food name."""
    class FakeSession:
        def add(self, obj): pass
        def commit(self): pass

    monkeypatch.setattr(foods_services.db, "session", FakeSession())

    valid_custom_food_payload["name"] = "   Homemade Granola   "
    result_food = create_custom_food(fake_user, valid_custom_food_payload)

    assert result_food.name == "Homemade Granola"


def test_create_custom_food_service_handles_optional_calories_per_100ml(fake_user, valid_custom_food_payload, monkeypatch):
    """Service: create_custom_food converts optional calories_per_100ml to Decimal when present."""
    class FakeSession:
        def add(self, obj): pass
        def commit(self): pass

    monkeypatch.setattr(foods_services.db, "session", FakeSession())

    valid_custom_food_payload["calories_per_100ml"] = 72.5
    result_food = create_custom_food(fake_user, valid_custom_food_payload)

    assert result_food.calories_per_100ml == Decimal("72.5")


# ============================================================================
# 5. SCHEMA UNIT TESTS: CustomFoodSchema
# ============================================================================

def test_custom_food_schema_deserializes_valid_data(valid_custom_food_payload):
    """Schema: Successfully deserializes and validates compliant payload."""
    schema = CustomFoodSchema()
    loaded = schema.load(valid_custom_food_payload)

    assert loaded["name"] == "Greek Yogurt"
    assert loaded["calories_per_100g"] == 100.0
    assert loaded["protein_per_100g"] == 10.0
    assert loaded["carbs_per_100g"] == 4.0
    assert loaded["fat_per_100g"] == 0.5


def test_custom_food_schema_raises_validation_error_on_missing_name(valid_custom_food_payload):
    """Schema: Raises ValidationError when required 'name' field is missing."""
    del valid_custom_food_payload["name"]
    schema = CustomFoodSchema()

    with pytest.raises(ValidationError) as exc_info:
        schema.load(valid_custom_food_payload)

    assert "name" in exc_info.value.messages
    assert exc_info.value.messages["name"] == ["name is required."]


def test_custom_food_schema_raises_validation_error_on_out_of_range_calories(valid_custom_food_payload):
    """Schema: Raises ValidationError when calories_per_100g exceeds 900."""
    valid_custom_food_payload["calories_per_100g"] = 901.0
    schema = CustomFoodSchema()

    with pytest.raises(ValidationError) as exc_info:
        schema.load(valid_custom_food_payload)

    assert "calories_per_100g" in exc_info.value.messages
