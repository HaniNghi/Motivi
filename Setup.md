1-Install the required tools

Check that your machine has the correct programs installed:

```bash
python3 --version
node --version
npm --version
docker --version
```

If any of them is missing, install them first.

2-Create the project folders

Create the main project structure first:

```bash
mkdir -p Motivi/backend
mkdir -p Motivi/db
mkdir -p Motivi/proxy
cd Motivi
```

At this point, you should have:
- the project root
- a backend folder for the Flask app
- a db folder for the PostgreSQL secret and init SQL
- a proxy folder for Nginx

3-Create the Python virtual environment

Inside the backend folder:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

Now install the dependencies:

```bash
pip install --upgrade pip
pip install flask flask-cors flask-sqlalchemy flask-migrate "psycopg[binary]" PyJWT bcrypt httpx python-dotenv pytest
```

Save them into requirements.txt:

```bash
pip freeze > requirements.txt
```

4-Create the Flask app structure

Create the following structure inside backend:

```bash
mkdir -p app/routes app/models app/database
```

Then create these files:
- app/__init__.py
- app/database/db.py
- app/routes/__init__.py
- app/routes/auth.py
- app/main.py
- app/models/__init__.py
- app/models/user.py

This order matters because the app factory must be created before you register routes and models.

5-Set up the app factory and database connection

In app/__init__.py, create the app factory:



The app factory is the first important setup step because Flask CLI commands like `flask --app app:create_app db migrate` need a callable app factory.

6-Set up the shared database object

In app/database/db.py:

```python
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate


db = SQLAlchemy()
migrate = Migrate()
```

This gives all models one shared database instance.

7-Set up routes and blueprints

In app/routes/__init__.py:

```python
from .auth import auth


def register_blueprints(app):
    app.register_blueprint(auth)
```

In app/routes/auth.py, define a sample route:

```python
from flask import Blueprint


auth = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth.route("/health")
def health():
    return {"status": "ok"}
```

This step comes after the app factory because the routes must be registered only after the app exists.

8-Create the app entry point

In app/main.py:

```python
from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
```

9-Create the Docker secret file

Create a password file for PostgreSQL:

```bash
mkdir -p db
printf '%s\n' 'your_secure_password' > db/password.txt
chmod 600 db/password.txt
```

This file is what Docker uses as a secret.

10-Create Docker Compose

Create a root-level compose.yaml file.

Example structure:

```yaml
services:
  db:
    image: postgres:18
    restart: always
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U motivi -d calorie -h 127.0.0.1 -p 5432']
      interval: 3s
      retries: 5
      start_period: 30s
    secrets:
      - db-password
    volumes:
      - db-data:/var/lib/postgresql
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    environment:
      POSTGRES_DB: calorie
      POSTGRES_USER: motivi
      POSTGRES_PASSWORD_FILE: /run/secrets/db-password
    expose:
      - 5432
    networks:
      - backnet

  backend:
    build:
      context: backend
      target: builder
    restart: always
    secrets:
      - db-password
    environment:
      FLASK_APP: app/main.py
      FLASK_ENV: development
      POSTGRES_DB: calorie
      POSTGRES_USER: motivi
      POSTGRES_PASSWORD_FILE: /run/secrets/db-password
    ports:
      - 8000:8000
    depends_on:
      db:
        condition: service_healthy
    networks:
      - backnet
      - frontnet

  proxy:
    build: proxy
    restart: always
    ports:
      - 80:80
    depends_on:
      - backend
    networks:
      - frontnet

volumes:
  db-data:

secrets:
  db-password:
    file: db/password.txt

networks:
  backnet:
  frontnet:
```

This is the Docker setup that creates the PostgreSQL database and gives your Flask app access to the secret password.

11-Start Docker and test the app

Run:

```bash
docker compose down -v
docker compose up -d --build
```

Then check if the services started:

```bash
docker compose ps
docker compose logs backend --tail=200
```

Open the app in the browser:

```text
http://localhost:8000/
```

12-Create the initial database migration

After the database and backend are both running, initialize Alembic:

```bash
cd /Users/nghivo/Motivi/backend
source .venv/bin/activate
flask --app app:create_app db init
```

This creates the migrations folder and configuration files.

Then generate the first migration based on your models:

```bash
docker compose exec backend flask --app app:create_app db migrate -m "initial schema"
```

Apply it to the database:

```bash
docker compose exec backend flask --app app:create_app db upgrade
```

13-Check migration status

Use these commands any time you want to confirm what revision is active:

```bash
docker compose exec backend flask --app app:create_app db current
```

View current migration history:

```bash
docker compose exec backend flask --app app:create_app db history
```

14-Add new changes later

When you add a new model or modify an existing table, run:

```bash
docker compose exec backend flask --app app:create_app db migrate -m "describe your change"
docker compose exec backend flask --app app:create_app db upgrade
```

15-Important notes

- Use `db` as the hostname only from inside Docker Compose.
- Use `localhost` if you run Flask locally outside Docker.
- If Alembic says `No changes in schema detected`, it usually means the database already matches your model definition.
- If the database does not exist or the app cannot connect, the migration command will fail before creating a new revision.

16-Frontend testing setup (Jest + React Native Testing Library)

To set up unit and component testing for the Expo React Native app:

1. Install testing packages in the `frontend` folder (ensure `jest-expo` version matches your Expo SDK version, e.g. SDK 57):

```bash
cd frontend
npm install --save-dev jest-expo@~57.0.0 jest @testing-library/react-native @types/jest --legacy-peer-deps
```

2. Add the test script in `frontend/package.json`:

```json
"scripts": {
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "test": "jest"
}
```

3. Update `frontend/tsconfig.json` to load Jest's global types:

```json
{
  "extends": "expo/tsconfig.base.json",
  "compilerOptions": {
    "strict": true,
    "types": ["jest"]
  }
}
```

4. Create `frontend/jest.config.js`:

```js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};
```

5. Create `frontend/jest.setup.js` for global mocks:

```js
// Mock SafeAreaContext so components wrapped in <SafeAreaProvider> render in tests
const mockSafeAreaContext = require('react-native-safe-area-context/jest/mock').default;
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
```

17-Running tests

Run frontend tests (Jest):

```bash
cd frontend
npm test                 # Run all tests once
npm test -- --watch      # Run in interactive watch mode
npm test -- --coverage   # Generate test coverage report
```

Run backend tests (Pytest):

```bash
cd backend
source .venv/bin/activate
pytest                   # Run all backend tests

# Or run via Docker:
# docker compose exec backend pytest
```
