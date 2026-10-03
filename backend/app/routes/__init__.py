

from .auth import auth
from .me import me


def register_blueprints(app):
    # Register each blueprint with the Flask app using the correct API
    app.register_blueprint(auth)
    app.register_blueprint(me)