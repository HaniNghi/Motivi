from decimal import Decimal, ROUND_HALF_UP

from app.database import db
from app.models.profile import Profile
from app.models.user import User
from app.models.diary_entry import DiaryEntry
from app.models.food import Food

from app.services.calorie import compute_targets
from app.services.auth import dump_user

def dump_profile(profile: Profile | None) -> dict | None:
    if profile is None:
        return None
    return {
        "age": profile.age,
        "gender": profile.gender,
        "height_cm": float(profile.height_cm),
        "weight_cm": float(profile.weight_cm),
        "activity_level": profile.activity_level,
        "goal": profile.goal,
        "bmr": profile.bmr,
        "tdee": profile.tdee,
        "target_calories": profile.target_calories,
        "target_protein_g":  profile.target_protein_g,
        "target_carbs_g":  profile.target_carbs_g,
        "target_fat_g":  profile.target_fat_g,
    }

def me_payload(user: User) -> dict:
    profile = user.profile
    completed = bool(profile and profile.onboarding_completed)
    return {
        "user": dump_user(user),
        "onboarding_completed": completed,
       "profile": dump_profile(profile) if completed else None,
    }

def apply_profile_fields(profile: Profile, data: dict) -> None:
    targets = compute_targets(
        age=data["age"],
        gender=data["gender"],
        height_cm=data["height_cm"],
        weight_kg=data["weight_kg"],
        activity_level=data["activity_level"],
        goal=data["goal"]
    )
    profile.age = data["age"]
    profile.gender = data["gender"]
    profile.height_cm = data["height_cm"]
    profile.weight_cm = data["weight_kg"]
    profile.activity_level = data["activity_level"]
    profile.goal = data["goal"]
    profile.bmr = targets["bmr"]
    profile.tdee = targets["tdee"]
    profile.target_calories = targets["target_calories"]
    profile.target_protein_g = targets["target_protein_g"]
    profile.target_carbs_g = targets["target_carbs_g"]
    profile.target_fat_g = targets["target_fat_g"]
    profile.onboarding_completed = True

def create_profile(user: User, data: dict) -> User:
    if user.profile is not None:
        raise ValueError("profile_exists")
    profile = Profile(user_id=user.id)
    apply_profile_fields(profile, data)
    db.session.add(profile)
    db.session.commit()
    db.session.refresh(user)
    return user

def update_profile(user: User, data: dict) -> User:
    if user.profile is None:
        raise ValueError("profile_not_found")
    apply_profile_fields(user.profile, data)
    db.session.commit()
    db.session.refresh(user)
    return user

def nutrion_totals(calories=0, protein=0, carbs=0, fat=0) -> dict:
    return {
        "calories":int(calories),
        "protein_g": float(protein),
        "carbs_g": float(carbs),
        "fat_g": float(fat)
    }

def profile_targets(profile: Profile) -> dict:
    return nutrion_totals(
        profile.target_calories,
        profile.target_protein_g,
        profile.target_carbs_g,
        profile.target_fat_g,
    )

def day_totals(user: User, day)-> dict:
    entries = DiaryEntry.query.filter_by(user_id=user.id, entry_date=day).all()
    calories = sum(item.calories for item in entries)
    protein = sum(Decimal(str(item.protein_g)) for item in entries)
    carbs = sum(Decimal(str(item.carbs_g)) for item in entries)
    fat = sum(Decimal(str(item.fat_g)) for item in entries)
    return nutrion_totals(calories, protein, carbs, fat), entries

def remaining_from(target: dict, consumed: dict) -> dict:
    return {
        "calories": target["calories"] - consumed["calories"],
        "protein_g": round(target["protein_g"] - consumed["protein_g"], 1),
        "carbs_g": round(target["carbs_g"] - consumed["carbs_g"], 1),
        "fat_g": round(target["fat_g"] - consumed["fat_g"], 1),
    }

def snapshot_from_food(food: Food, amount_g)-> dict:
    amount = Decimal(str(amount_g))
    factor = amount / Decimal("100")
    calories = (Decimal(str(food.calories_per_100g)) * factor).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    protein = (Decimal(str(food.protein_per_100g)) * factor).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
    carbs = (Decimal(str(food.carbs_per_100g)) * factor).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
    fat = (Decimal(str(food.fat_per_100g)) * factor).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)

    return {
        "calories": int(calories),
        "protein_g": protein,
        "carbs_g": carbs,
        "fat_g": fat,
    }