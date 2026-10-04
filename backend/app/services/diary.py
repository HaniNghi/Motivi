from app.models.diary_entry import DiaryEntry
from app.models.user import User
from datetime import date
from decimal import Decimal
from app.services.me import remaining_from, day_totals, profile_targets, snapshot_from_food
from app.services.foods import get_visible_food
from app.database import db

def dump_entry(entry: DiaryEntry) -> dict:
    return {
        "id": str(entry.id),
        "food_id": str(entry.food_id),
        "food_name": str(entry.food_name),
        "amount_g": float(entry.amount_g),
        "calories": int(entry.calories),
        "protein_g": float(entry.protein_g),
        "carbs_g": float(entry.carbs_g),
        "fat_g": float(entry.fat_g)
    }

def diary_day_payload(user: User, day: date) -> dict:
    profile = user.profile
    if profile is None or not profile.onboarding_completed:
        raise ValueError("profile_not_found")
    target = profile_targets(profile)
    consumed, entries = day_totals(user, day)
    return {
        "date": day.isoformat(),
        "target": target,
        "consumed": consumed,
        "remaining": remaining_from(target, consumed),
        "entries": [dump_entry(item) for item in entries]
    }

def add_entry(user: User, food_id, day: date, amount_g) -> dict:
    if user.profile is None or not user.profile.onboarding_completed:
        raise ValueError("profile_not_found")
    food = get_visible_food(user, food_id)
    if food is None:
        raise ValueError("food_not_found")
    snap = snapshot_from_food(food, amount_g)
    entry = DiaryEntry(
        user_id=user.id,
        food_id=food.id,
        food_name=food.name,
        entry_date=day,
        amount_g=Decimal(str(amount_g)),
        calories=snap["calories"],
        protein_g=snap["protein_g"],
        carbs_g=snap["carbs_g"],
        fat_g=snap["fat_g"],
    )
    db.session.add(entry)
    db.session.commit()
    payload = diary_day_payload(user, day)
    payload["entry"] = dump_entry(entry)
    return payload

def get_owned_entry(user: User, entry_id) -> DiaryEntry | None:
    return DiaryEntry.query.filter_by(id=entry_id, user_id=user.id).first()

def patch_entry(user: User, entry: DiaryEntry, amount_g) -> dict:
    food = get_visible_food(user, entry.food_id)
    if food is None:
        food = entry.food
    snap = snapshot_from_food(food, amount_g)
    entry.amount_g=Decimal(str(amount_g))
    entry.calories=snap["calories"]
    entry.protein_g=snap["protein_g"]
    entry.carbs_g=snap["carbs_g"]
    entry.fat_g=snap["fat_g"]
    
    db.session.commit()
    payload = diary_day_payload(user, entry.entry_date)
    payload["entry"] = dump_entry(entry)
    return payload

def delete_entry(user: User, entry: DiaryEntry) -> dict:
    day = entry.entry_date
    db.session.delete(entry)
    db.session.commit()
    payload = diary_day_payload(user, day)
    return payload