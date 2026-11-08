# Cloud deployment (DigitalOcean Droplet)

This document describes the production Docker Compose setup currently in the
repository and the work completed so far. The deployment target is a
DigitalOcean Droplet running Docker Compose, with Cloudflare DNS/proxy in front
of Nginx and the mobile app calling the HTTPS API.

## Production layout

`compose.prod.yaml` runs three services:

- `db`: PostgreSQL 17 with a persistent Docker volume. It is not published to
  the Droplet's network interfaces.
- `backend`: the Flask API served by Gunicorn on the private Compose network.
- `proxy`: Nginx, publishing ports 80 and 443 and forwarding `/api/` requests to
  the backend.

The API base URL is `https://motivi.fyi`. The root URL currently returns a
small JSON health response; API requests are routed under `/api/`.

## Before deploying

On the Droplet:

1. Install Docker Engine and the Docker Compose plugin.
2. Check out the repository and move into its root directory.
3. Create a root `.env` file with the Compose settings below. Do not commit or
   share this file.
4. Create `db/password.txt` with a strong PostgreSQL password. Keep it out of
   version control.
5. Put the Cloudflare Origin certificate and matching private key at:
   `.certs/cloudflare_origin_cert.pem` and
   `.certs/cloudflare_origin_key.pem`. Keep the private key secret.

The Compose file reads these variables from `.env`:

```dotenv
POSTGRES_DB=calorie
POSTGRES_USER=motivi
JWT_SECRET=replace-with-a-long-random-secret
JWT_ACCESS_MINUTES=15
JWT_REFRESH_DAYS=30
CORS_ORIGINS=
```

Generate a fresh, private `JWT_SECRET` for the server; do not use the example
value. `CORS_ORIGINS` can remain empty for native mobile clients. If browser
clients are added, set it to the exact allowed origins, comma-separated.

## Build and start the cloud stack

Run these commands from the repository root on the Droplet:

```bash
docker compose -f compose.prod.yaml config --quiet
docker compose -f compose.prod.yaml build
docker compose -f compose.prod.yaml run --rm backend flask --app app.main:app db upgrade
docker compose -f compose.prod.yaml up -d
```

The migration command runs before the backend and proxy are brought up, and
Compose starts the database dependency for it. To populate the food catalog
after migrations, run:

```bash
docker compose -f compose.prod.yaml run --rm backend flask --app app.main:app seed-foods
```

Check service health and logs with:

```bash
docker compose -f compose.prod.yaml ps
docker compose -f compose.prod.yaml logs --tail=100
```

For a later deployment after updating the checked-out code:

```bash
docker compose -f compose.prod.yaml build
docker compose -f compose.prod.yaml run --rm backend flask --app app.main:app db upgrade
docker compose -f compose.prod.yaml up -d
```

`docker compose down` stops the services without deleting the database volume.
Do not use `docker compose down -v` unless you intentionally want to delete the
database data.

## Local development

The default `compose.yaml` is for local development and starts PostgreSQL only:

```bash
docker compose up -d
```

Run Flask on the host with the local development environment and reload enabled.
The database is available on `localhost:5432`. Do not use the local Compose
file as the cloud deployment stack.

## Work completed and verification

- Split local and production Compose configurations: local runs PostgreSQL;
  production runs PostgreSQL, Flask/Gunicorn, and Nginx.
- Configured the production backend for container networking, PostgreSQL
  password-file secrets, and Gunicorn.
- Configured Nginx TLS certificate mounts and `/api/` forwarding to the backend.
- Added explicit Flask database seeding with `seed-foods`, so migrations can
  run before catalog data is inserted.
- Added app configuration tests for database settings, CORS behavior, and
  explicit seeding.

Both Compose configurations passed `docker compose config --quiet` during the
previous verification. The targeted app configuration tests passed (5 tests).
The broader backend test run had 27 passes and 2 failures in existing food-route
and catalog-seed tests; those areas were not changed. A production image build
was not verified because Docker Desktop's daemon was unavailable in the
development environment. No Git commit was created.

The mobile app's API client integration is separate work and is not included
here.
