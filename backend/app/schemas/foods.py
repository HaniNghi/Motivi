from marshmallow import Schema, fields, validate

class CustomFoodSchema(Schema):
    name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=120),
        error_messages={
            "required": "name is required."
        }
    )
    calories_per_100g = fields.Float(
        required=True,
        validate=validate.Range(min=0, max=900),
        error_messages={
            "required": "calories_per_100g is required."
        }
    )
    protein_per_100g = fields.Float(
        required=True,
        validate=validate.Range(min=0, max=100),
        error_messages={
            "required": "protein_per_100g is required."
        }
    )
    carbs_per_100g = fields.Float(
        required=True,
        validate=validate.Range(min=0, max=100),
        error_messages={
            "required": "carbs_per_100g is required."
        }
    )
    fat_per_100g = fields.Float(
        required=True,
        validate=validate.Range(min=0, max=100),
        error_messages={
            "required": "fat_per_100g is required."
        }
    )
