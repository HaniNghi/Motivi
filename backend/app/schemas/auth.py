from marshmallow import Schema, fields, validate

class RegisterSchema(Schema):
    email = fields.Email(
        required=True, 
        error_messages={"required": "Email and password are required."}
    )
    password = fields.String(
        required=True,
        validate=validate.Length(min=8, error="Password must be at least 8 characters."),
        error_messages={"required": "Email and password are required."},
    )
    display_name = fields.String(load_default=None, allow_none=True)

class LoginSchema(Schema):
    email = fields.Email(
            required=True, 
            error_messages={"required": "Email and password are required."}
    )
    password = fields.String(
            required=True, 
            error_messages={"required": "Email and password are required."}
    )

# class GoogleSchema(Schema):
#     id_token = fields.String(required=True, error_messages={"required": "id_token is required."})

class RefreshSchema(Schema):
    refresh_token = fields.String(required=True, error_messages={"required": "refresh_token is required."})