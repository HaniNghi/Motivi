

from .auth import auth


def register_blueprints(app):
    # Register each blueprint with the Flask app using the correct API
    app.register_blueprint(auth)