# Docker setup for local backend + PostgreSQL

This project supports two development modes:

1. Full app stack in Docker
2. Database only in Docker, backend runs locally

## 1) Full app stack in Docker

Use the main file:

```bash
docker compose up -d --build
```

This runs:
- PostgreSQL database
- Flask backend
- proxy

The backend connects to PostgreSQL using the Docker service name:

```text
db
```

Example connection target:

```text
postgresql://motivi:YOUR_PASSWORD@db:5432/calorie
```

## 2) Database only in Docker, backend runs locally

This is the recommended mode for active backend development.

Use the database-only file:

```bash
docker compose -p motivi-db-only -f compose.db-only.yaml up -d
```

This runs only PostgreSQL in Docker. The backend runs on your machine.

### Local backend connection

Use localhost because the backend is running on your Mac, not inside Docker:

```text
postgresql://motivi:YOUR_PASSWORD@localhost:15432/calorie
```

Why port 15432?
- The Docker container publishes 5432 inside the container
- We mapped it to the host port 15432 in compose.db-only.yaml
- This avoids conflicts with any other local PostgreSQL service already running on port 5432

## Why localhost is different from db

- Inside Docker container: use `db`
- From your machine: use `localhost`
- From Postico: use `localhost` and the published host port

## Important note about port 5432 conflicts

If another PostgreSQL instance is already running on your machine, Docker cannot safely use the same host port 5432.

That is why the database-only setup uses:

```yaml
ports:
  - "15432:5432"
```

This prevents conflicts while still exposing the database to your local machine.

## Example Postico settings

- Host: localhost
- Port: 15432
- User: motivi
- Database: calorie
- Password: value from `db/password.txt`

## Clean reset

If the database state is broken and you want a fresh start:

```bash
docker compose -p motivi-db-only -f compose.db-only.yaml down -v
docker compose -p motivi-db-only -f compose.db-only.yaml up -d
```

This removes the database volume and creates a new PostgreSQL instance.

## Current understanding

- The app inside Docker can connect to the database using the Docker service name `db`
- Your local backend must use `localhost` and the correct host port exposed by Docker
- Postico must connect to the published host port, not the internal Docker service name
