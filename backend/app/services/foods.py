from decimal import Decimal
from sqlalchemy import or_

from app.database import db
from app.models.food import Food
from app.models.user import User
from app.services.off import OffUnavailable, search_open_food_facts


def dump_food(food: Food) -> dict:
    return {
        "id": str(food.id),
        "off_code": food.off_code,
        "name": food.name,
        "brand": food.brand,
        "calories_per_100g": float(food.calories_per_100g),
        "protein_per_100g": float(food.protein_per_100g),
        "carbs_per_100g": float(food.carbs_per_100g),
        "fat_per_100g": float(food.fat_per_100g),
        "source": food.source,
        "image_url": food.image_url,
    }

def visible_foods_query(user: User):
    return Food.query.filter(
        Food.deleted_at.is_(None),
        or_(
            Food.source.in_(("seed", "off")),
            Food.created_by_user_id == user.id,
        )
    )

def upsert_off_product(product: dict) -> None:
    existing = Food.query.filter_by(off_code=product["off_code"]).first()
    if existing:
        return
    food = Food(
        off_code=product["off_code"],
        name=product["name"],
        brand=product.get("brand"), #optional#
        calories_per_100g=Decimal(str(product["calories_per_100g"])),
        protein_per_100g=Decimal(str(product["protein_per_100g"])),
        carbs_per_100g=Decimal(str(product["carbs_per_100g"])),
        fat_per_100g=Decimal(str(product["fat_per_100g"])),
        source="off",
        image_url=product.get("image_url"), #optional#
    )
    db.session.add(food)

def search_foods(user: User, query: str, limit: int) -> tuple[list[Food], bool]:
    limit = min(max(limit, 1), 50)
    q = (query or "").strip()
    base = visible_foods_query(user)

    if not q:
        foods = (
            base.filter(Food.source == "seed")
            .order_by(Food.name.asc())
            .limit(limit)
            .all()
        )
        return foods, False
    pattern = f"%{q}%"
    local = (
        base.filter(or_(Food.name.ilike(pattern), Food.brand.ilike(pattern)))
        .order_by(Food.name.asc())
        .limit(limit)
        .all()
    )
    if len(local) >= 5:
        return local, False
    fetched = False
    try:
        products = search_open_food_facts(q, page_size=limit)
        for product in products:
            upsert_off_product(product)
        db.session.commit()
        fetched = True
    except OffUnavailable:
        if local:
            return local, False
        raise

    foods = (
        visible_foods_query(user)
        .filter(or_(Food.name.ilike(pattern), Food.brand.ilike(pattern)))
        .order_by(Food.name.asc())
        .limit(limit)
        .all()
    )
    return foods, fetched

def create_custom_food(user: User, data: dict) -> Food:
    food = Food(
        name=data["name"].strip(),
        calories_per_100g=Decimal(str(data["calories_per_100g"])),
        protein_per_100g=Decimal(str(data["protein_per_100g"])),
        carbs_per_100g=Decimal(str(data["carbs_per_100g"])),
        fat_per_100g=Decimal(str(data["fat_per_100g"])),
        source="custom",
        created_by_user_id=user.id,
    )
    db.session.add(food)
    db.session.commit()
    return food

def get_visible_food(user: User, food_id) -> Food | None:
    return visible_foods_query(user).filter(Food.id==food_id).first()