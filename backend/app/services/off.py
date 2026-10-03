import httpx
import os
class OffUnavailable(Exception):
    pass


def _nutrient(nutriments: dict, *keys):
    for key in keys:
        value = nutriments.get(key)
        if value is not None:
            try:
                return float(value)
            except (TypeError, ValueError):
                continue
    return None


def search_open_food_facts(query: str, page_size: int = 20) -> list[dict]:
    url = "https://world.openfoodfacts.org/cgi/search.pl"
    params = {
        "search_terms": query,
        "search_simple": 1,
        "action": "process",
        "json": 1,
        "page_size": page_size,
    }
    headers = {"User-Agent": os.getenv("OFF_USER_AGENT")}
    try:
        response = httpx.get(url, params=params, headers=headers, timeout=12.0)
        response.raise_for_status()
        payload = response.json()
    except Exception as exc:
        raise OffUnavailable from exc

    products = []
    for item in payload.get("products", []):
        nutriments = item.get("nutriments") or {}
        calories = _nutrient(
            nutriments,
            "energy-kcal_100g",
            "energy-kcal_value",
            "energy-kcal",
            "energy_100g",
            "energy_value",
            "energy",
        )
        if calories is None:
            continue
        protein = _nutrient(nutriments, "proteins_100g", "proteins", "proteins_value") or 0
        carbs = _nutrient(nutriments, "carbohydrates_100g", "carbohydrates", "carbohydrates_value") or 0
        fat = _nutrient(nutriments, "fat_100g", "fat", "fat_value") or 0
        code = item.get("code") or item.get("_id")
        name = (
            item.get("product_name")
            or item.get("product_name_en")
            or item.get("generic_name")
            or item.get("brands")
        )
        if not name or not code:
            continue
        products.append(
            {
                "off_code": str(code),
                "name": str(name).strip(),
                "brand": (item.get("brands") or "").split(",")[0].strip() or None,
                "calories_per_100g": calories,
                "protein_per_100g": protein,
                "carbs_per_100g": carbs,
                "fat_per_100g": fat,
                "image_url": item.get("image_front_small_url") or item.get("image_url"),
            }
        )
    return products