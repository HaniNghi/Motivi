# Auth and Me API curl commands

## 1) Register

```bash
curl -i -X POST http://127.0.0.1:5000/api/auth/register \
  -H "Content-Type: application/json" \
  --data '{
    "email": "test@example.com",
    "password": "123456789",
    "display_name": "Tester"
  }'
```

## 2) Login

```bash
curl -i -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  --data '{
    "email": "test@example.com",
    "password": "123456789"
  }'
```

## 3) Refresh token

```bash
curl -i -X POST http://127.0.0.1:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  --data '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

## 4) Get current user profile (GET /api/me)

```bash
curl -i http://127.0.0.1:5000/api/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 5) Create profile

```bash
curl -i -X POST http://127.0.0.1:5000/api/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "age": 25,
    "gender": "female",
    "height_cm": 165,
    "weight_kg": 55.5,
    "activity_level": "active",
    "goal": "lose"
  }'
```

## 6) Update profile

```bash
curl -i -X PUT http://127.0.0.1:5000/api/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "age": 28,
    "gender": "female",
    "height_cm": 165,
    "weight_kg": 58,
    "activity_level": "moderate",
    "goal": "maintain"
  }'
```

## Start backend

```bash
cd /Users/nghivo/Motivi/backend
source .venv/bin/activate
flask --app app:create_app run
```
## openfoodfacts

```
curl -sS "https://world.openfoodfacts.org/cgi/search.pl?search_terms=apple&search_simple=1&action=process&json=1&page_size=9&lc=en&tagtype_0=languages&tag_contains_0=contains&tag_0=en" | head
```
> Make sure PostgreSQL is running before testing auth or me endpoints.
