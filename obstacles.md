# Obstacles I Faced and How I Solved Them

## 1) PostgreSQL / Docker setup confusion

I had to figure out how PostgreSQL should be configured when running locally versus inside Docker.

- The database inside Compose was only reachable as `db` from the Docker network.
- Local backend code needed to connect to `localhost` with the exposed port.
- A local PostgreSQL instance already using port `5432` caused connection conflicts.

Solution:
- keep the DB in Docker
- run the backend locally against `localhost:5432`
- use the Docker-only DB stack when needed with a different exposed port like `15432:5432`
- confirm with `psql` and `docker compose exec db ...`

---

## 2) Secret/password loading issue

I wanted the PostgreSQL password to be read from a file automatically, instead of hardcoding it in the code.

Problem:
- the app sometimes did not read the env or secret file correctly
- fallback logic was unclear

Solution:
- read `POSTGRES_PASSWORD_FILE` first
- then read `POSTGRES_PASSWORD`
- then fall back to the repo secret file at `db/password.txt`

This made local backend development easier and kept the Docker secret pattern working.

---

## 3) App factory and blueprint registration issues

The app had trouble when route blueprints were registered or when the app factory was not configured correctly.

Problem:
- some routes were not loaded
- blueprint initialization was confusing
- the app sometimes failed during import

Solution:
- keep the app factory design in `create_app()`
- register blueprints in the factory
- import models and routes in the right order
- keep route registration centralized


## 5) Local backend not connecting to Docker database

I tried to run the backend locally while the database stayed in Docker.

Problem:
- host mismatch
- wrong port
- wrong password
- stale values from older environment setup

Solution:
- use `localhost` for local backend
- use the Docker-exposed port
- set the correct environment variables explicitly
- confirm with connection tests and SQL output

---

## 6) Postman body problem for /api/me

This was one of the biggest debugging moments.

I tried to send a request to:

- `POST /api/me`
- `PUT /api/me`

using Postman, but I kept receiving:

```json
{
  "error": {
    "code": "invalid_body",
    "message": "Missing data for required field."
  }
}
```

The actual JSON I sent was valid, for example:

```json
{
  "age": 25,
  "gender": "female",
  "height_cm": 165,
  "weight_kg": 55.5,
  "activity_level": "active",
  "goal": "lose"
}
```

I suspected the backend was wrong, but I did not trust the assumption.

### What I did
I added print statements in the route to inspect:

- headers
- `content_type`
- raw body
- parsed JSON

I also compared the request with `curl`.

### What I discovered
When I sent the request with curl, the body was clearly there and the server parsed it correctly.
When I sent the same payload from Postman, the server printed:

- `content_type application/json`
- `raw_json` empty
- `parsed_json None`
- `payload None`

This proved the problem was not the code or the schema.

### Root cause
The request body in Postman was effectively empty or not being sent as raw JSON.

### Fix
I checked the Postman settings and added the correct headers and body format:

- `Content-Type: application/json`
- body type: `raw`
- JSON selected
- plain JSON body filled in correctly

I also noticed the request was missing `Content-Length` in the header from Postman, and once I added it properly, the request worked.

This was the turning point: it confirmed the code was fine and the issue was the client request formatting.

---

## 7) Debugging with print statements

I used temporary prints in the route to inspect:

```python
print("headers", request.headers)
print("content_type", request.content_type)
print("raw_json", request.get_data(as_text=True))
print("parsed_json", request.get_json(silent=True))
```

This was extremely helpful because it showed whether the body existed at all.

It helped distinguish between:
- bad backend validation
- bad client request formatting

---

## 8) Confirming with curl

Once I tested the same endpoint with curl, I could compare the results directly.

This let me isolate the issue:

- curl succeeded
- Postman failed
- therefore the bug was in Postman request generation, not backend validation

This saved a lot of time and prevented me from changing working backend code unnecessarily.

---

## 9) Schema validation is okay

The schema in `ProfileInputSchema` is valid for the body I sent.

The key point is: the schema was never the real problem.
The request was empty when it arrived at the server, so Marshmallow naturally raised:

- `Missing data for required field.`

This was a client-side request issue, not a model issue.

---

## 10) Lesson learned

The biggest lesson was: when a request fails in a client like Postman, verify with curl immediately.

That comparison makes debugging much faster because it answers one question clearly:

- Is the code wrong?
- Or is the request wrong?

Once I confirmed that curl worked and Postman did not, I could focus on the actual client issue rather than breaking working backend logic.
