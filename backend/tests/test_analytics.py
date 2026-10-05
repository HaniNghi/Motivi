from datetime import date
from types import SimpleNamespace

from app.services import analytics


def test_monday_of_returns_start_of_week():
    assert analytics.monday_of(date(2026, 10, 4)) == date(2026, 9, 28)
    assert analytics.monday_of(date(2026, 10, 5)) == date(2026, 10, 5)


def test_week_payload_builds_seven_day_summary(monkeypatch):
    user = SimpleNamespace(
        profile=SimpleNamespace(
            onboarding_completed=True,
            target_calories=2200,
        )
    )

    def fake_day_totals(_user, current_day):
        totals = {
            "calories": 100 + current_day.day,
            "protein_g": float(current_day.day),
            "carbs_g": float(current_day.day * 2),
            "fat_g": float(current_day.day / 2),
        }
        return totals, []

    monkeypatch.setattr(analytics, "day_totals", fake_day_totals)

    payload = analytics.week_payload(user, date(2026, 10, 4))

    assert payload["week_start"] == "2026-09-28"
    assert payload["week_end"] == "2026-10-04"
    assert payload["target_calories"] == 2200
    assert len(payload["days"]) == 7
    assert payload["days"][0] == {
        "date": "2026-09-28",
        "calories": 128,
        "protein_g": 28.0,
        "carbs_g": 56.0,
        "fat_g": 14.0,
    }
    assert payload["days"][-1] == {
        "date": "2026-10-04",
        "calories": 104,
        "protein_g": 4.0,
        "carbs_g": 8.0,
        "fat_g": 2.0,
    }


def test_week_payload_requires_completed_profile():
    user = SimpleNamespace(profile=None)

    try:
        analytics.week_payload(user, date(2026, 10, 4))
        assert False, "Expected ValueError for incomplete profile"
    except ValueError as exc:
        assert str(exc) == "profile_not_found"
