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

---

## 11) Expo / Node startup failure: `EPERM: process.cwd failed with error operation not permitted, uv_cwd`

I encountered a frontend startup issue where running:

```bash
cd ~/Motivi/frontend
npx expo start
```

or even:

```bash
npm i
```

failed before the project booted.

### Error seen

```bash
Error: EPERM: process.cwd failed with error operation not permitted, uv_cwd
```

### What I verified

- the folder existed and was readable
- the shell could run `pwd` and list the directory
- but Node itself crashed when calling `process.cwd()`

### Root cause

This was not an Expo or app-level code issue. The error happened in the Node runtime before npm/expo could initialize.

The strongest clue was the runtime version:

```bash
Node.js v26.0.0
```

This version appears to trigger a runtime environment problem on this machine, causing `uv_cwd` to fail even though the folder itself is valid.

### Fix attempted

- checked directory permissions
- verified the project directory exists
- moved to a cleaner shell location
- tried a different Node version path

### Working direction

The likely fix is to switch to a stable LTS Node version such as 22 or 20 and reinstall npm tools in a clean environment.

This is a toolchain issue rather than a frontend code issue, so it must be resolved before `npx expo start` can work.


## Restructure to Expo Router
### Root cause
- Align project with new way of navigation

## Bug in backend weight_cm -> weight_kg
### Root cause
 typo in Profile model -> have to reset database and have to upgrade backend
 docker compose down -v 
Why -v? Without -v, Docker preserves your old database data and tables across restarts. -v wipes the db-data volume so PostgreSQL is brand new.

 docker compose up -d

 cd backend
source .venv/bin/activate
flask db upgrade
flask run --port=5000

  
## Diary
Have to format the food name before display
Picture link can not be displayed => 
  In backend/app/services/diary.py, the dump_entry serializer was returning calories and macros, but omitted image_url. Because of this, GET /api/diary was returning entry.image_url as undefined, so EntryFood was receiving nothing.

  OpenFoodFacts' image CDN (images.openfoodfacts.org) often blocks or rate-limits image requests that lack a descriptive User-Agent header (which happens on mobile native image loaders).

  Need to update EntryFood.tsx to automatically attach the required header and clean any whitespace from the URL

Passing params between Diary and addfood
onPress={() =>
  router.push({
    pathname: "/(food)/addfood",
    params: { date: getDate(currentDate) },
  })
}

export default function AddFood() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const selectedDate = date ?? getDate(); 
}
## Food
Add delay when user searching, prevent spaming to openfoodfact
Change to v2 of openfoodfact but then change back to cgi/search because v2 cannot search brands-> cgi/search supports it better

search for "Korean noodle", call off -> write in db -> second time search for "Korean noodle" -> only 4 results -> because the filtering foods in db too strict, it ignored every for example 
"Korean Spicy Noodle" ❌ rejected (because "Spicy" is in the middle)
  
"Korean Chicken Noodle" ❌ rejected (because "Chicken" is in the middle)
  
"Korean Noodle Soup" ✅ kept!

## Deploy frontend with Expo Go app
On my phone, the installed version was for SDK 58.0.0 but my project ran on SDK 57
-> 
  
```
cd frontend
# 1. Install Expo SDK 58
npx expo install expo@^58.0.0
# 2. Automatically upgrade all Expo & React Native packages to versions compatible with SDK 58
npx expo install --fix
# 3. Verify with doctor
npx expo-doctor
# 4. Clear old Metro cache
```

after checking with doctor
```
18/20 checks passed. 2 checks failed. Possible issues detected:
Use the --verbose flag to see more details about passed checks.

✖ Check that required peer dependencies are installed
Missing peer dependency: expo-constants
Required by: expo-router
Advice:
Install missing required peer dependency with "npx expo install expo-constants"
Your app may crash outside of Expo Go without this dependency. Native module peer dependencies must be installed directly.

✖ Validate packages against React Native Directory package metadata
The following issues were found when validating your dependencies against React Native Directory:
  Unmaintained: @react-native-community/blur
Advice:
Use libraries that are actively maintained and support the New Architecture. Find alternative libraries with https://reactnative.directory.
Add packages to expo.doctor.reactNativeDirectoryCheck.exclude in package.json to selectively skip validations, if the warning is not relevant.

2 checks failed, indicating possible issues with the project.
```
Ask AI -> 
npx expo install expo-constants
npm uninstall @react-native-community/blur

-> 20/20 checks passed. No issues detected!

-> failed because only for developer, if anyone want to access to the app through Expo Go, has to be logged in with account 
-> 2 options to deploy frontend 1 with Expo's EAS Hosting one with Vercel

-> chose Vercel because "Auto-deploy on git push", larger Free Tier Limits	

-> how to do :
modify storage so when Platform.OS === 'web' then use localStorage instead of SecureStore
-> next
```
create vercel.json inside frontend/ with the build command (npx expo export --platform web), output directory (dist), and SPA routing rules, and added .vercel to frontend/.gitignore.
```
-> next
```
cd frontend
npx expo install react-dom react-native-web
```
-> next
```
- Go to vercel.com and click Sign Up / Log In with GitHub.
- Click Add New... -> Project, and select your Motivi repository (Import).
- On the configuration screen, set these 2 settings:
- Root Directory: Click Edit and select frontend (Very important since your Expo app is inside the frontend/ folder!)
- Environment Variables: Expand this section and add:
- Key: EXPO_PUBLIC_BACKEND_API_URL
- Value: Your deployed backend URL
- Click Deploy!
```
