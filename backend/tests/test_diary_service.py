import uuid
from datetime import date
from decimal import Decimal
from types import SimpleNamespace

from app.services import diary as diary_service


class FakeSession:
    def __init__(self):
        self.added = []
        self.deleted = []

    def add(self, obj):
        self.added.append(obj)

    def commit(self):
        pass

    def delete(self, obj):
        self.deleted.append(obj)


def test_diary_day_payload_returns_targets_and_remaining(monkeypatch):
    user = SimpleNamespace(
        profile=SimpleNamespace(
            onboarding_completed=True,
            target_calories=2200,
            target_protein_g=150,
            target_carbs_g=220,
            target_fat_g=70,
        )
    )

    monkeypatch.setattr(diary_service, "profile_targets", lambda profile: {
        "calories": 2200,
        "protein_g": 150.0,
        "carbs_g": 220.0,
        "fat_g": 70.0,
    })
    monkeypatch.setattr(diary_service, "day_totals", lambda _user, _day: (
        {
            "calories": 500,
            "protein_g": 40.0,
            "carbs_g": 60.0,
            "fat_g": 15.0,
        },
        [SimpleNamespace(
            id=uuid.uuid4(),
            food_id=uuid.uuid4(),
            food_name="Rice",
            amount_g=Decimal("200"),
            calories=500,
            protein_g=Decimal("40"),
            carbs_g=Decimal("60"),
            fat_g=Decimal("15"),
        )],
    ))

    payload = diary_service.diary_day_payload(user, date(2026, 10, 4))

    assert payload["date"] == "2026-10-04"
    assert payload["target"]["calories"] == 2200
    assert payload["consumed"]["calories"] == 500
    assert payload["remaining"]["calories"] == 1700
    assert payload["entries"][0]["food_name"] == "Rice"


def test_diary_day_payload_requires_completed_profile():
    user = SimpleNamespace(profile=SimpleNamespace(onboarding_completed=False))

    try:
        diary_service.diary_day_payload(user, date(2026, 10, 4))
        assert False, "Expected ValueError"
    except ValueError as exc:
        assert str(exc) == "profile_not_found"


def test_add_entry_creates_a_diary_entry(monkeypatch):
    user = SimpleNamespace(
        id=uuid.uuid4(),
        profile=SimpleNamespace(onboarding_completed=True),
    )
    food = SimpleNamespace(id=uuid.uuid4(), name="Rice")
    fake_session = FakeSession()

    class FakeDiaryEntry:
        def __init__(self, **kwargs):
            self.id = kwargs.get("id", uuid.uuid4())
            self.food_id = kwargs.get("food_id")
            self.food_name = kwargs.get("food_name")
            self.amount_g = kwargs.get("amount_g")
            self.calories = kwargs.get("calories")
            self.protein_g = kwargs.get("protein_g")
            self.carbs_g = kwargs.get("carbs_g")
            self.fat_g = kwargs.get("fat_g")

    monkeypatch.setattr(diary_service, "get_visible_food", lambda _user, _food_id: food)
    monkeypatch.setattr(diary_service, "snapshot_from_food", lambda _food, _amount_g: {
        "calories": 250,
        "protein_g": Decimal("12.5"),
        "carbs_g": Decimal("35.0"),
        "fat_g": Decimal("5.0"),
    })
    monkeypatch.setattr(diary_service, "DiaryEntry", FakeDiaryEntry)
    monkeypatch.setattr(diary_service.db, "session", fake_session, raising=False)
    monkeypatch.setattr(diary_service, "diary_day_payload", lambda _u, _day: {"entry": {"food_name": "Rice"}})

    payload = diary_service.add_entry(user, food.id, date(2026, 10, 4), 200)

    assert len(fake_session.added) == 1
    assert fake_session.added[0].food_name == "Rice"
    assert payload["entry"]["food_name"] == "Rice"


def test_patch_entry_updates_amount_and_returns_summary(monkeypatch):
    user = SimpleNamespace(id=uuid.uuid4())
    entry = SimpleNamespace(
        id=uuid.uuid4(),
        food_id=uuid.uuid4(),
        food_name="Rice",
        food=SimpleNamespace(name="Rice"),
        entry_date=date(2026, 10, 4),
        amount_g=Decimal("100"),
        calories=120,
        protein_g=Decimal("6.0"),
        carbs_g=Decimal("15.0"),
        fat_g=Decimal("2.0"),
    )
    fake_session = FakeSession()

    monkeypatch.setattr(diary_service, "get_visible_food", lambda _user, _food_id: SimpleNamespace(name="Rice"))
    monkeypatch.setattr(diary_service, "snapshot_from_food", lambda _food, amount_g: {
        "calories": 240,
        "protein_g": Decimal("12.0"),
        "carbs_g": Decimal("30.0"),
        "fat_g": Decimal("4.0"),
    })
    monkeypatch.setattr(diary_service.db, "session", fake_session, raising=False)
    monkeypatch.setattr(diary_service, "diary_day_payload", lambda _u, _day: {"entry": {"amount_g": 200.0}})

    payload = diary_service.patch_entry(user, entry, 200)

    assert entry.amount_g == Decimal("200")
    assert entry.calories == 240
    assert payload["entry"]["amount_g"] == 200.0


def test_delete_entry_deletes_and_returns_updated_day(monkeypatch):
    user = SimpleNamespace(id=uuid.uuid4())
    entry = SimpleNamespace(entry_date=date(2026, 10, 4))
    fake_session = FakeSession()

    monkeypatch.setattr(diary_service.db, "session", fake_session, raising=False)
    monkeypatch.setattr(diary_service, "diary_day_payload", lambda _u, _day: {"date": _day.isoformat()})

    payload = diary_service.delete_entry(user, entry)

    assert len(fake_session.deleted) == 1
    assert payload["date"] == "2026-10-04"
