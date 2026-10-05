

from .auth import auth
from .me import me
from .foods import foods
from .diary import diary
from .analytics import analytics

def register_blueprints(app):
    # Register each blueprint with the Flask app using the correct API
    app.register_blueprint(auth)
    app.register_blueprint(me)
    app.register_blueprint(foods)
    app.register_blueprint(diary)
    app.register_blueprint(analytics)

