from marshmallow import Schema, fields, validate

class DiaryEntryCreateSchema(Schema):
    food_id = fields.UUID(
        required=True,
        error_messages={"required": "food_id is required"}
    )
    date = fields.Date(
        required=True,
        error_messages={"required": "data is required"}
    )
    amount_g = fields.Float(
        required=True,
        validate=validate.Range(
            min=1, max=5000, error="amount_g must be between 1 and 5000"
        ),
        error_messages={"required": "amount_g (1-5000) is required"}
    )

class DiaryEntryPatchSchema(Schema):
    amount_g = fields.Float(
        required=True,
        validate=validate.Range(
            min=1, max=5000, error="amount_g must be between 1 and 5000"
        ),
        error_messages={"required": "amount_g is required"}
    )