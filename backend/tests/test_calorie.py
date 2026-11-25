import pytest
from app.services.calorie import compute_targets, CALORIE_FLOOR


def test_compute_targets_male():
    """
    Male Mifflin-St Jeor:
    BMR = 10 * 75 + 6.25 * 180 - 5 * 25 + 5 = 1755
    TDEE (moderate = 1.55) = 1755 * 1.55 = 2720.25 -> 2720
    """
    targets = compute_targets(
        age=25,
        gender="male",
        height_cm=180,
        weight_kg=75,
        activity_level="moderate",
        goal="maintain",
    )

    assert targets["bmr"] == 1755
    assert targets["tdee"] == 2720
    assert targets["target_calories"] == 2720
    assert targets["target_protein_g"] == 204
    assert targets["target_carbs_g"] == 272
    assert targets["target_fat_g"] == 91


def test_compute_targets_female():
    """
    Female Mifflin-St Jeor:
    BMR = 10 * 75 + 6.25 * 180 - 5 * 25 - 161 = 1589
    Difference from male should be exactly 166 kcal (5 - (-161))
    TDEE (moderate = 1.55) = 1589 * 1.55 = 2462.95 -> 2463
    """
    targets = compute_targets(
        age=25,
        gender="female",
        height_cm=180,
        weight_kg=75,
        activity_level="moderate",
        goal="maintain",
    )

    assert targets["bmr"] == 1589
    assert targets["tdee"] == 2463
    assert targets["target_calories"] == 2463
    assert targets["target_protein_g"] == 185
    assert targets["target_carbs_g"] == 246
    assert targets["target_fat_g"] == 82


def test_female_vs_male_bmr_difference():
    """Verify female BMR is exactly 166 kcal lower than male for identical stats."""
    male = compute_targets(30, "male", 170, 65, "sedentary", "maintain")
    female = compute_targets(30, "female", 170, 65, "sedentary", "maintain")

    assert male["bmr"] - female["bmr"] == 166


def test_calorie_floor_enforced():
    """Verify target_calories never drops below CALORIE_FLOOR (1200 kcal)."""
    targets = compute_targets(
        age=50,
        gender="female",
        height_cm=145,
        weight_kg=40,
        activity_level="sedentary",
        goal="lose",  # -500 would normally drop it well below 1200
    )

    assert targets["target_calories"] == CALORIE_FLOOR
