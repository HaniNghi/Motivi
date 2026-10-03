from marshmallow import Schema, fields, validate

GENDERS = ("male", "female")
ACTIVITY_LEVELS = ("sedentary", "light", "moderate", "active", "very_active")
GOALS = ("lose", "maintain", "gain")

class UserSchema(Schema):
    id = fields.UUID(required=True)
    email = fields.Email(required=True)
    display_name = fields.String(required=True)

