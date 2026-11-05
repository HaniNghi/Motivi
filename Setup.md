# Motivi — Installation, Setup & Docker Guide

This guide covers everything needed to install prerequisites, initialize the project structure, configure PostgreSQL and Docker, run database migrations, and set up testing for both the backend and frontend.

---

## 1. Prerequisites & Tool Installation

First, verify whether the required tools are installed on your machine:

```bash
python3 --version
node --version
npm --version
docker --version
```

If any of them are missing, install them below.

### PostgreSQL Installation (macOS via Homebrew)

1. Open Terminal and install PostgreSQL with Homebrew:
   ```bash
   brew install postgresql
   ```
2. Start the background service so PostgreSQL runs automatically:
   ```bash
   brew services start postgresql
   ```
3. Verify that the server is active and accepting connections:
   ```bash
   pg_isready
   ```
   - Expected output if healthy: `/tmp:5432 - accepting connections`
   - Access the interactive SQL shell as the default superuser:
     ```bash
     psql -U postgres
     ```
   - If you get the error `psql: error: connection to server on socket "/tmp/.s.PGSQL.5432" failed: FATAL: role "postgres" does not exist`, connect with:
     ```bash
     psql postgres
     ```
   - Quit the interactive shell when finished by typing `\q`.

### Docker Desktop Installation (macOS)

1. **Download Docker Desktop**:
   - Visit the Docker Desktop for Mac download page.
   - Download the appropriate version for your Mac (Intel or Apple Silicon).
2. **Install Docker Desktop**:
   - Open the downloaded `.dmg` file.
   - Drag the Docker icon to your **Applications** folder.
   - Double-click `Docker.app` in Applications to start Docker.
3. **Complete Setup**:
   - Accept the terms and conditions.
   - Enter your system password when prompted (Docker needs privileged access).
   - Wait for Docker to start (the whale icon in the menu bar will stop animating).
4. **Verify Installation**:
   ```bash
   docker --version
   docker run hello-world
   ```

---

## 2. Project Folder Structure

Create the main project directories:

```bash
mkdir -p Motivi/backend
mkdir -p Motivi/db
mkdir -p Motivi/proxy
cd Motivi
```

At this point, you have:
- the project root (`Motivi/`)
- `backend/` — Flask API application
- `db/` — PostgreSQL secret (`password.txt`) and optional init SQL
- `proxy/` — Nginx configuration

---

## 3. Backend Setup (Flask + SQLAlchemy)

### 3.1 Create the Python Virtual Environment & Install Dependencies

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate

pip install --upgrade pip
pip install flask flask-cors flask-sqlalchemy flask-migrate "psycopg[binary]" PyJWT bcrypt httpx python-dotenv pytest
pip freeze > requirements.txt
```

### 3.2 Create the Flask App Structure

Inside `backend/`:

```bash
mkdir -p app/routes app/models app/database
```

Core files (order matters because the app factory must exist before registering routes and models):
- `app/__init__.py` — App factory (`create_app()`), required by CLI commands like `flask --app app:create_app db migrate`
- `app/database/db.py` — Shared database & migration instances
- `app/routes/__init__.py` — Blueprint registration
- `app/routes/auth.py` — Auth routes
- `app/main.py` — Application entry point
- `app/models/__init__.py` — Model exports
- `app/models/user.py` — User model

### 3.3 Shared Database Instance (`app/database/db.py`)

```python
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()
```

### 3.4 Routes & Blueprints (`app/routes/`)

In `app/routes/__init__.py`:
```python
from .auth import auth

def register_blueprints(app):
    app.register_blueprint(auth)
```

In `app/routes/auth.py`:
```python
from flask import Blueprint

auth = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth.route("/health")
def health():
    return {"status": "ok"}
```

### 3.5 App Entry Point (`app/main.py`)

```python
from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
```

---

## 4. Database Secret & Docker Configuration

### 4.1 Create the Docker Secret File

Create the PostgreSQL password file used by Docker secrets and local backend fallback:

```bash
mkdir -p db
printf '%s\n' 'your_secure_password' > db/password.txt
chmod 600 db/password.txt
```

### 4.2 Root `compose.yaml` Structure

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

---

## 5. Docker Development Modes

This project supports **two development modes**:

1. **Full app stack in Docker** (PostgreSQL + Flask backend + proxy)
2. **Database only in Docker, backend runs locally** *(recommended for active backend development)*

### Mode 1: Full App Stack in Docker

Start all services:
```bash
docker compose down -v
docker compose up -d --build
```

Verify running containers and logs:
```bash
docker compose ps
docker compose logs backend --tail=200
```

- App URL: `http://localhost:8000/`
- Inside Docker, the backend connects to PostgreSQL using the Docker service name `db`:
  ```text
  postgresql://motivi:YOUR_PASSWORD@db:5432/calorie
  ```

### Mode 2: Database Only in Docker + Local Backend (Recommended)

Run only PostgreSQL in Docker while running Flask locally in `.venv`:

```bash
# Using the main compose file (db service only):
docker compose up -d db

# Or using a dedicated db-only compose file if configured:
docker compose -p motivi-db-only -f compose.db-only.yaml up -d
```

- Because the backend runs on your Mac (outside Docker), connect using `localhost`:
  ```text
  postgresql://motivi:YOUR_PASSWORD@localhost:5432/calorie
  # Or if mapped to host port 15432 to avoid local port 5432 conflicts:
  postgresql://motivi:YOUR_PASSWORD@localhost:15432/calorie
  ```

### Understanding `localhost` vs `db` & Port 5432 Conflicts

| Where you connect from | Host to use | Port to use |
| :--- | :--- | :--- |
| Inside a Docker container | `db` | `5432` |
| Local backend on your Mac | `localhost` | Published host port (`5432` or `15432`) |
| Database GUI (e.g., Postico) | `localhost` | Published host port (`5432` or `15432`) |

> **Why port `15432`?**
> If another PostgreSQL service is already running on your Mac on port `5432`, mapping `ports: ["15432:5432"]` in Docker avoids host port conflicts while still exposing the container's port `5432` to your machine.

**Example Postico Settings:**
- **Host**: `localhost`
- **Port**: `5432` (or `15432` if using `compose.db-only.yaml`)
- **User**: `motivi`
- **Database**: `calorie`
- **Password**: value from `db/password.txt`

**Clean Database Reset:**
If the database state is broken and you want a fresh start (removes the database volume):
```bash
docker compose down -v
docker compose up -d db
```
*(Or with `compose.db-only.yaml`: `docker compose -p motivi-db-only -f compose.db-only.yaml down -v && docker compose -p motivi-db-only -f compose.db-only.yaml up -d`)*

---

## 6. Database Migrations (Alembic / Flask-Migrate)

### 6.1 Initialize Alembic (One-Time)

```bash
cd backend
source .venv/bin/activate
flask --app app:create_app db init
```

### 6.2 Generate & Apply Migrations

**When running the backend locally (Mode 2):**
```bash
cd backend
source .venv/bin/activate
set -a && source ../.env && set +a

flask --app app:create_app db migrate -m "describe your change"
flask --app app:create_app db upgrade
```

**When running the backend container in Docker (Mode 1):**
```bash
docker compose exec backend flask --app app:create_app db migrate -m "describe your change"
docker compose exec backend flask --app app:create_app db upgrade
```

### 6.3 Check Migration Status & History

```bash
# Local:
flask --app app:create_app db current
flask --app app:create_app db history

# Inside Docker:
docker compose exec backend flask --app app:create_app db current
docker compose exec backend flask --app app:create_app db history
```

**Migration Troubleshooting Notes:**
- If Alembic says `No changes in schema detected`, the database already matches your SQLAlchemy model definitions.
- If the database does not exist or the app cannot connect, the migration command will fail before creating a new revision.

---

## 7. Frontend Testing Setup (Jest + React Native Testing Library)

To set up unit and component testing for the Expo React Native app:

### 7.1 Install Testing Packages

Ensure `jest-expo` matches your Expo SDK version:
```bash
cd frontend
npm install --save-dev jest-expo@~57.0.0 jest @testing-library/react-native @types/jest --legacy-peer-deps
```

### 7.2 Add the `test` Script in `frontend/package.json`

```json
"scripts": {
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "test": "jest"
}
```

### 7.3 Update `frontend/tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base.json",
  "compilerOptions": {
    "strict": true,
    "types": ["jest"]
  }
}
```

### 7.4 Create `frontend/jest.config.js`

```js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};
```

### 7.5 Create `frontend/jest.setup.js`

```js
// Mock SafeAreaContext so components wrapped in <SafeAreaProvider> render in tests
const mockSafeAreaContext = require('react-native-safe-area-context/jest/mock').default;
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
```

---

## 8. Running Tests

### Frontend Tests (Jest)

```bash
cd frontend
npm test                 # Run all tests once
npm test -- --watch      # Run in interactive watch mode
npm test -- --coverage   # Generate test coverage report
```

### Backend Tests (Pytest)

```bash
cd backend
source .venv/bin/activate
pytest                   # Run all backend tests

# Or run via Docker:
# docker compose exec backend pytest
```
