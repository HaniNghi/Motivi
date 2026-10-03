from marshmallow import Schema, fields, validate

from app.schemas.common import GENDERS, ACTIVITY_LEVELS, GOALS

class ProfileInputSchema(Schema):
    age = fields.Integer(
        required=True,
        validate=validate.Range(min=14, max=100, error="age must be between 14 and 100.")
    )
    gender = fields.String(required=True, validate=validate.OneOf(GENDERS))
    height_cm = fields.Float(
        required=True,
        validate=validate.Range(min=100, max=250, error="height(cm) must be between 100 and 250.")
    )
    weight_kg = fields.Float(
        required=True,
        validate=validate.Range(min=30, max=300, error="weight(kg) must be between 30 and 300.")
    )
    activity_level = fields.String(required=True, validate=validate.OneOf(ACTIVITY_LEVELS))
    goal = fields.String(required=True, validate=validate.OneOf(GOALS))

    