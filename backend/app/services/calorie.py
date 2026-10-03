from decimal import Decimal, ROUND_HALF_UP

ACTIVITY_MULTIPLIERS = {
   "sedentary": Decimal("1.2"), 
   "light": Decimal("1.375"), 
   "moderate": Decimal("1.55"), 
   "active": Decimal("1.725"), 
   "very_active": Decimal("1.9")
}

GOAL_ADJUSTMENTS = {
    "lose": Decimal("-500"),
    "maintain": Decimal("0"),
    "gain": Decimal("500")
}

CALORIE_FLOOR = 1200

def _round_int(value: Decimal) -> int:
    return int(value.quantize(Decimal("1"), rounding=ROUND_HALF_UP))

def compute_targets(age: int, gender: str, height_cm, weight_kg, activity_level: str, goal: str) -> dict:
    kg = Decimal(str(weight_kg))
    cm = Decimal(str(height_cm))
    age_n = Decimal(str(age))

    if gender == "male":
        bmr = Decimal("10") * kg + Decimal("6.25") * cm - Decimal("5") * age_n + Decimal("5")
    else:
        bmr = Decimal("10") * kg + Decimal("6.25") * cm - Decimal("5") * age_n + Decimal("5")

    tdee = bmr * ACTIVITY_MULTIPLIERS[activity_level]
    target = tdee + GOAL_ADJUSTMENTS[goal]
    if target < CALORIE_FLOOR:
        target = Decimal(CALORIE_FLOOR)

    protein = (target * Decimal("0.30")) / Decimal("4")
    carbs = (target * Decimal("0.40")) / Decimal("4")
    fat = (target * Decimal("0.30")) / Decimal("9")

    return {
        "bmr" : _round_int(bmr),
        "tdee": _round_int(tdee),
        "target_calories": _round_int(target),
        "target_protein_g": _round_int(protein),
        "target_carbs_g": _round_int(carbs),
        "target_fat_g": _round_int(fat),
    }