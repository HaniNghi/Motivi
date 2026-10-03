from flask import Flask

from app.routes import me as me_routes


class FakeUser:
    def __init__(self, email="user@example.com", display_name="User"):
        self.id = "user-123"
        self.email = email
        self.display_name = display_name
        self.profile = None


def test_get_me_returns_user_payload(monkeypatch):
    user = FakeUser()
    app = Flask(__name__)

    monkeypatch.setattr(me_routes, "me_payload", lambda current_user: {
        "user": {"email": current_user.email, "display_name": current_user.display_name},
        "onboarding_completed": False,
        "profile": None,
    })

    with app.app_context():
        result = me_routes.get_me.__wrapped__(user)

    response, status_code = result
    assert status_code == 200
    payload = response.get_json()
    assert payload["user"]["email"] == "user@example.com"
    assert payload["onboarding_completed"] is False


def test_post_me_creates_profile(monkeypatch):
    app = Flask(__name__)
    user = FakeUser()

    payload = {
        "age": 30,
        "gender": "male",
        "height_cm": 175,
        "weight_kg": 70,
        "activity_level": "moderate",
        "goal": "maintain",
    }

    monkeypatch.setattr(me_routes, "create_profile", lambda current_user, data: current_user)
    monkeypatch.setattr(me_routes, "me_payload", lambda current_user: {
        "user": {"email": current_user.email},
        "onboarding_completed": True,
        "profile": {"goal": "maintain"},
    })

    with app.app_context():
        with app.test_request_context("/api/me", method="POST", json=payload):
            result = me_routes.post_me.__wrapped__(user)

    response, status_code = result
    assert status_code == 201
    assert response.get_json()["profile"]["goal"] == "maintain"


def test_put_me_updates_profile(monkeypatch):
    app = Flask(__name__)
    user = FakeUser()

    payload = {
        "age": 28,
        "gender": "female",
        "height_cm": 165,
        "weight_kg": 60,
        "activity_level": "light",
        "goal": "lose",
    }

    monkeypatch.setattr(me_routes, "update_profile", lambda current_user, data: current_user)
    monkeypatch.setattr(me_routes, "me_payload", lambda current_user: {
        "user": {"email": current_user.email},
        "onboarding_completed": True,
        "profile": {"goal": "lose"},
    })

    with app.app_context():
        with app.test_request_context("/api/me", method="PUT", json=payload):
            result = me_routes.put_me.__wrapped__(user)

    response, status_code = result
    assert status_code == 200
    assert response.get_json()["profile"]["goal"] == "lose"
