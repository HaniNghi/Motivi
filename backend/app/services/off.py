import httpx
import os
class OffUnavailable(Exception):
    pass

def off_search_params(query: str, page_size: int=20) -> dict:
    return{
        "search_terms": query,
        "search_simple": 1,
        "action": "process",
        "json": 1,
        "page_size": page_size,
        "lc": "en",
        "tagtype_0": "languages",
        "tag_contains_0": "contains",
        "tag_0":"en",
    }

def _nutrient(nutriments: dict, *keys):
    for key in keys:
        value = nutriments.get(key)
        if value is not None:
            try:
                return float(value)
            except (TypeError, ValueError):
                continue
    return None

def map_off_products(item: dict) -> dict | None:
    nutriments = item.get("nutriments") or {}

    calories_g = _nutrient(
        nutriments,
        "energy-kcal_100g",
        "energy-kcal_value",
        "energy-kcal",
        "energy_100g",
        "energy_value",
        "energy",
    )
    calories_ml = _nutrient(
        nutriments,
        "energy-kcal_100ml",
        "energy-kcal_value_ml",
        "energy_100ml",
    )

    if calories_g is None and calories_ml is None:
        return None
    if calories_g is None:
        calories_g = calories_ml

    protein = _nutrient(
        nutriments,
        "proteins_100g",
        "proteins",
        "proteins_100ml",
        "proteins_value",
    ) or 0
    carbs = _nutrient(
        nutriments,
        "carbohydrates_100g",
        "carbohydrates",
        "carbohydrates_100ml",
        "carbohydrates_value",
    ) or 0
    fat = _nutrient(
        nutriments,
        "fat_100g",
        "fat",
        "fat_100ml",
        "fat_value",
    ) or 0

    code = item.get("code") or item.get("_id")
    name = (
        item.get("product_name_en")
        or item.get("product_name")
        or item.get("generic_name")
        or ""
    ).strip()
    if not name or not code:
        return None

    return {
        "off_code": str(code),
        "name": str(name).strip(),
        "brand": (item.get("brands") or "").split(",")[0].strip() or None,
        "calories_per_100g": calories_g,
        "calories_per_100ml": calories_ml,
        "protein_per_100g": protein,
        "carbs_per_100g": carbs,
        "fat_per_100g": fat,
        "image_url": item.get("image_front_small_url") or item.get("image_url"),
    }



def search_open_food_facts(query: str, page_size: int = 20) -> list[dict]:
    url = "https://world.openfoodfacts.org/cgi/search.pl"
    params = off_search_params(query, page_size)
    headers = {"User-Agent": os.getenv("OFF_USER_AGENT") or "MotiviApp/1.0"}
    try:
        response = httpx.get(url, params=params, headers=headers, timeout=12.0)
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, dict):
            raise ValueError("Open Food Facts response was not a JSON object")
    except Exception as exc:
        raise OffUnavailable from exc

    products = []
    for item in payload.get("products", []):
        product = map_off_products(item)
        if product is not None:
            products.append(product)
    return products