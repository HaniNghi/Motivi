from datetime import date, timedelta

from app.models.user import User
from app.services.me import day_totals

def monday_of(day:date) -> date:
    return day - timedelta(days=day.weekday())

def week_payload(user: User, start: date) -> dict:
    if user.profile is None or not user.profile.onboarding_completed:
        raise ValueError("profile_not_found")
    week_start = monday_of(start)
    week_end = week_start + timedelta(days=6)
    days = []
    current = week_start
    while current <= week_end:
        consumed, _entries = day_totals(user, current) #entries starts with _ because it is defined but will not use
        days.append(
            {
                "date": current.isoformat(),
                "calories": consumed["calories"],
                "protein_g": consumed["protein_g"],
                "carbs_g": consumed["carbs_g"],
                "fat_g": consumed["fat_g"],
            }
        )
        current += timedelta(days=1)
    return {
        "week_start": week_start.isoformat(),
        "week_end": week_end.isoformat(),
        "target_calories": user.profile.target_calories,
        "days": days,
    }