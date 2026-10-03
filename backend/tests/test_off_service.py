import os

from app.services.off import search_open_food_facts


class DummyResponse:
    def raise_for_status(self):
        pass

    def json(self):
        return {
            "products": [
                {
                    "code": "123",
                    "product_name_en": "Rice",
                    "brands": "BrandX",
                    "nutriments": {
                        "energy_100g": 130,
                        "proteins_100g": 2.5,
                        "carbohydrates_100g": 28,
                        "fat_100g": 0.5,
                    },
                    "image_front_small_url": "https://example.com/rice.png",
                }
            ]
        }


def test_search_open_food_facts_returns_products(monkeypatch):
    import app.services.off as off

    monkeypatch.delenv("OFF_USER_AGENT", raising=False)
    monkeypatch.setattr(off.httpx, "get", lambda *args, **kwargs: DummyResponse())

    products = search_open_food_facts("rice", page_size=5)

    assert products == [
        {
            "off_code": "123",
            "name": "Rice",
            "brand": "BrandX",
            "calories_per_100g": 130.0,
            "protein_per_100g": 2.5,
            "carbs_per_100g": 28.0,
            "fat_per_100g": 0.5,
            "image_url": "https://example.com/rice.png",
        }
    ]
