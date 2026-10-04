from decimal import Decimal

from app.database import db
from app.models.food import Food

SEED_FOODS = [
    ('Bok Choy', 18, 1, 1.4, 0),
    ('Spinach', 19, 2.6, 0.6, 0),
    ('Tomato', 21, 0, 3, 0),
    ('Aubergine', 24, 0.9, 2.2, 0),
    ('Lime', 26, 0.7, 0.8, 0),
    ('Apple', 27, 0.6, 12, 0.5),
    ('Bamboo Shoots', 27, 1.5, 0.7, 0),
    ('Lemon', 27, 0.8, 2.2, 0),
    ('Artichokes', 29, 2.8, 2.7, 0),
    ('Turnips', 30, 0.9, 3.7, 0),
    ('Asparagus', 32, 2.9, 2, 0.6),
    ('Melon (Watermelon)', 33, 0, 6.9, 0),
    ('Apricot', 36, 1.5, 12, 0),
    ('Bean Sprouts', 38, 2.9, 3.8, 0.5),
    ('Grapefruit', 38, 0.8, 6.7, 0),
    ('Peach', 41, 1, 7.4, 0),
    ('Squash (Butternut)', 41, 1.1, 7.9, 0),
    ('Strawberry', 42, 0.6, 6.1, 0.5),
    ('Blackberry', 43, 1.1, 6.1, 0),
    ('Carrots', 43, 0, 7.5, 0),
    ('Orange', 43, 0.8, 8, 0),
    ('Beetroot', 45, 1.7, 7.2, 0),
    ('Blueberry', 45, 0.9, 9.1, 0),
    ('Plum', 46, 0.6, 8.7, 0),
    ('Raspberry', 46, 1.4, 4.6, 0),
    ('Broccoli', 47, 4.3, 3.1, 0.6),
    ('Nectarine', 48, 1.4, 8.7, 0),
    ('Satsuma', 49, 0.7, 9.3, 0),
    ('Pineapple', 50, 0, 9.9, 0),
    ('Pear', 52, 0, 11, 0),
    ('Cherry', 56, 0.9, 12, 0),
    ('Passionfruit', 57, 2.8, 5.7, 0),
    ('Kiwi', 59, 1.1, 11, 0.5),
    ('Chicken Broth', 63, 2.4, 0, 1.7),
    ('Lychee', 64, 0.9, 14, 0),
    ('Monkfish', 66, 15.7, 0, 0.4),
    ('Oysters', 66, 10.8, 0, 1.3),
    ('Mango', 67, 0.7, 14, 0),
    ('Persimmon', 71, 0.6, 15, 0),
    ('Parsnips', 73, 1.8, 12, 1.1),
    ('Sole (Lemon)', 73, 16.7, 0, 0.7),
    ('Grape', 74, 0.6, 16, 0),
    ('Mussels', 74, 12.1, 0, 1.8),
    ('Cod', 75, 17.5, 0, 0.6),
    ('Haddock', 75, 17.8, 0, 0.4),
    ('Plaice', 76, 16.4, 0, 1.2),
    ('Lobster', 77, 17, 0, 1),
    ('Prawns', 77, 17.6, 0, 0.7),
    ('Squid', 77, 15.4, 0, 1.7),
    ('Cod (Smoked)', 79, 18.3, 0, 0.6),
    ('Potatoes', 84, 1.9, 18, 0),
    ('Yoghurt (Plain, Full Fat)', 84, 5.6, 7.6, 3),
    ('Scallops', 88, 17, 0, 1),
    ('Sole (Dover)', 89, 18.1, 0, 1.8),
    ('Banana', 90, 1.1, 20, 0),
    ('Sweet Potatoes', 91, 1.2, 20, 0),
    ('Hake', 92, 18, 2.2, 0),
    ('Amaranth', 102, 14, 59, 7),
    ('Halibut', 103, 21.5, 0, 1.9),
    ('Venison', 103, 22.2, 0, 1.6),
    ('Turkey Dark Meat', 104, 20.4, 0, 2.5),
    ('Turkey Light Meat', 105, 24.4, 0, 0.8),
    ('Chicken Light Meat', 106, 24, 0, 1.1),
    ('Chicken Dark Meat', 109, 20.9, 0, 2.8),
    ('Beef Broth', 111, 7.8, 0, 3.5),
    ('Olives (Green)', 114, 0.9, 0, 11),
    ('Boar', 116, 21.5, 0, 3.3),
    ('Wild Trout', 116, 20.8, 0, 3.6),
    ('Yams', 119, 1.6, 26, 0),
    ('Beef Rump Steak', 125, 22, 0, 4.1),
    ('Lean Minced Beef', 125, 22, 0, 4.2),
    ('Eggs', 131, 13, 0, 9),
    ('Beef Sirloin Steak', 134, 23, 0, 4.5),
    ('Duck Breast (No Skin)', 137, 19.7, 0, 6.5),
    ('Pheasant', 144, 24.4, 0, 3.3),
    ('Beef Stewing Steak', 146, 22, 0, 6.4),
    ('Lean Minced Lamb', 156, 19.1, 0, 8.8),
    ('Duck Eggs', 163, 14, 0, 12),
    ('Minced Pork', 164, 19.2, 0, 9.7),
    ('Wild Salmon', 179, 22.1, 0, 10.1),
    ('Pork Ribs', 195, 18.7, 0, 13.4),
    ('Minced Lamb', 196, 19.1, 0, 13.3),
    ('Avocado', 201, 1.9, 1.9, 20),
    ('Lamb Neck', 203, 19.4, 0, 13.9),
    ('Bacon', 215, 16.5, 0, 16.5),
    ('Coconut Yoghurt', 219, 2.5, 3.9, 21),
    ('Minced Beef', 225, 19.7, 0, 16.2),
    ('Pork Loin Steak', 225, 19.9, 0, 16.1),
    ('Feta Cheese', 253, 15, 1.4, 20),
    ('Streaky Bacon', 276, 15.8, 0, 23.6),
    ('Lamb Breast', 287, 16, 0, 25),
    ('Beans (Red Kidney)', 295, 22, 41, 1.4),
    ('Date (Dried)', 295, 3.3, 68, 0),
    ('Sultana', 300, 2.7, 69, 0),
    ('Quinoa', 319, 14, 51, 5),
    ('Lentils', 323, 24, 52, 1.3),
    ('Chickpeas', 338, 21, 46, 5.4),
    ('Millet', 345, 12, 64, 3.9),
    ('White Rice', 345, 8.5, 76, 0),
    ('Brown Rice', 354, 9.3, 71, 3.1),
    ('Rice Protein', 354, 77.4, 9.6, 0),
    ('Collagen Powder', 358, 91.6, 0, 0),
    ('Buckwheat', 362, 8.1, 77, 1.5),
    ('Rye', 363, 10, 69, 1.6),
    ('Pea Protein', 366, 66, 10, 5),
    ('Coconut', 378, 3.8, 3.5, 36),
    ('Whey Protein Isolate', 379, 90, 1.4, 1.5),
    ('Duck Breast (With Skin)', 388, 13.1, 0, 37.3),
    ('Whey Protein Concentrate', 402, 78, 6.1, 6.8),
    ('Chia Seed', 469, 18, 7.8, 31),
    ('Cashew', 597, 21, 17, 48),
    ('Almond', 620, 21, 7, 53),
    ('Nut Butter (Peanut)', 640, 29, 7.2, 53),
    ('Brazil Nuts', 711, 16, 2.9, 68),
    ('Walnuts', 714, 17, 3.1, 69),
    ('Butter', 749, 0.6, 0.6, 82),
    ('Macadamia Nuts', 762, 7.9, 4.5, 78),
    ('Ghee', 883, 0, 0, 98),
    ('Coconut Oil', 903, 0, 0, 100),
    ('Olive Oil', 0, 0, 0, 100, 903),
    ('Coconut Milk', 0, 0, 1.9, 2, 32),

]

def seed_foods() -> int:
    created = 0
    for item in SEED_FOODS:
        if len(item) == 5:
            name, calories, protein, carbs, fat = item
            calories_ml = None
        elif len(item) == 6:
            name, calories, protein, carbs, fat, calories_ml = item
        else:
            raise ValueError(f"Wrong seed format: {item}")
        exists = Food.query.filter_by(name=name, source="seed").first()
        if exists:
            continue
        db.session.add(
            Food(
                name=name,
                calories_per_100g=Decimal(str(calories)),
                calories_per_100ml=(Decimal(str(calories_ml)) if calories_ml is not None else None),
                protein_per_100g=Decimal(str(protein)),
                carbs_per_100g=Decimal(str(carbs)),
                fat_per_100g=Decimal(str(fat)),
                source="seed"
            )
        )
        created += 1
    if created:
        db.session.commit()
    return created