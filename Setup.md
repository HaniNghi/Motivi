1-Install Python, nodejs, npm, docker
    Check version by run these commands
``` 
python3 --version
node --version
npm --version
docker --version
```

2-Start Flask
```
mkdir backend
python3 -m venv .venv
-> Create a new environment -> Quick create
source .venv/bin/activate

pip install flask flask-cors flask-sqlalchemy flask-migrate "psycopg[binary]" PyJWT bcrypt httpx python-dotenv pytest

pip freeze > requirements.txt
```

3-Setup Docker
```
create compose.yaml -> add dependencies
create Dockerfile in backend folder
create proxy folder
run docker compose up -d
```

4-Connect Flask and Postgres

Create a simple Flask app in `backend/app.py`:

```python
import os
from pathlib import Path

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

app = Flask(__name__)


# Read the PostgreSQL password from the Docker secret file mounted at /run/secrets/db-password
# This keeps the password out of the source code and Compose file.
def get_db_password() -> str:
    secret_path = os.getenv("POSTGRES_PASSWORD_FILE")
    if secret_path:
        try:
            return Path(secret_path).read_text().strip()
        except FileNotFoundError:
            pass
    return os.getenv("POSTGRES_PASSWORD", "")


# These values should match the PostgreSQL service config in compose.yaml
user = os.getenv("POSTGRES_USER", "motivi")
db_name = os.getenv("POSTGRES_DB", "calorie")
password = get_db_password()

# Build the full database URL used by SQLAlchemy to connect to Postgres.
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"postgresql://{user}:{password}@db:5432/{db_name}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Create the database connection object used by Flask-SQLAlchemy.
db = SQLAlchemy(app)


@app.route("/")
def home():
    try:
        # Run a simple test query to prove the Flask app can reach PostgreSQL.
        with db.session.connection() as conn:
            conn.execute(text("SELECT 1"))
        return "Hello Motivi — connected to PostgreSQL"
    except Exception as exc:
        return f"Hello Motivi — DB error: {exc}", 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
```

Then update `compose.yaml`:

```yaml
services:
  db:
    image: postgres:18
    restart: always
    # Health check ensures the database is ready before the backend starts.
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U motivi -d calorie -h 127.0.0.1 -p 5432']
      interval: 3s
      retries: 5
      start_period: 30s
    # Secret file with the PostgreSQL password; Docker mounts it at /run/secrets/db-password.
    secrets:
      - db-password
    # Persistent database data is stored in a Docker volume.
    volumes:
      - db-data:/var/lib/postgresql
    networks:
      - backnet
    # These values create the database and user used by the backend app.
    environment:
      POSTGRES_DB: calorie
      POSTGRES_USER: motivi
      POSTGRES_PASSWORD_FILE: /run/secrets/db-password
    expose:
      - 5432

  backend:
    build:
      context: backend
      target: builder
    restart: always
    # The backend also receives the same secret file so it can read the password.
    secrets:
      - db-password
    environment:
      FLASK_APP: app.py
      FLASK_ENV: development
      POSTGRES_DB: calorie
      POSTGRES_USER: motivi
      POSTGRES_PASSWORD_FILE: /run/secrets/db-password
    ports:
      - 8000:8000
    networks:
      - backnet
      - frontnet
    depends_on:
      db:
        # Wait until the database passes the health check before starting the backend.
        condition: service_healthy
```

Create the secret file:

```bash
mkdir -p db
printf '%s\n' 'your_secure_password' > db/password.txt
chmod 600 db/password.txt
```

Finally, start the stack:

```bash
docker compose down -v
docker compose up -d --build
```

Open http://localhost:8000/ to test the connection.
