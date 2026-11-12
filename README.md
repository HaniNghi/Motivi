# Motivi

Motivi is a calorie and nutrition tracking application built to help people monitor what they eat, set realistic daily targets, and keep a clear view of their progress over time.

The project combines a Python Flask API with a React Native mobile client and a PostgreSQL database, with Docker support for local development.

<img width="120" height="262" alt="Simulator Screenshot - iPhone 17 - 2026-11-11 at 09 47 41" src="https://github.com/user-attachments/assets/ec7162f1-e30f-4649-be95-b4d0413684b2" />
<img width="120" height="262" alt="Simulator Screenshot - iPhone 17 - 2026-11-11 at 09 51 02" src="https://github.com/user-attachments/assets/da0a761e-c56d-4eac-837a-b10278b342a9" />
<img width="120" height="262" alt="Simulator Screenshot - iPhone 17 - 2026-11-11 at 09 53 40" src="https://github.com/user-attachments/assets/1027c280-4068-40be-927d-34be4919275f" />
<img width="120" height="262" alt="Simulator Screenshot - iPhone 17 - 2026-11-11 at 09 51 17" src="https://github.com/user-attachments/assets/80f65282-0b4a-4af6-bfc2-26e3cc81aaab" />
<img width="120" height="262" alt="Simulator Screenshot - iPhone 17 - 2026-11-11 at 09 51 24" src="https://github.com/user-attachments/assets/a80bffc6-7c1a-41e7-bc9c-bcf3986d0ea5" />
<img width="120" height="262" alt="Simulator Screenshot - iPhone 17 - 2026-11-11 at 09 51 32" src="https://github.com/user-attachments/assets/e6b9a4bf-b92a-4f1e-a994-ea59eb8091c1" />





## Overview

Motivi supports:

- user signup and authentication
- profile setup with personal metrics and target goals
- daily food and meal logging
- calorie and macro tracking
- progress summaries and analytics
- backend integration for food lookup and nutrition data

## Key features

- Personal target calculation based on profile information
- Diary entries for meals and food portions
- Daily balance tracking between consumed and remaining calories
- Food records with calorie, protein, carbohydrate, and fat data
- Secure API authentication using JWT
- Dockerized local database setup for development

## Tech stack

### Backend
- Python
- Flask
- Flask-SQLAlchemy
- Flask-Migrate
- PostgreSQL
- JWT-based authentication

### Frontend
- React Native
- Expo
- TypeScript

### Infrastructure
- Docker Compose
- Nginx proxy folder included for future API routing

## Repository structure

```text
Motivi/
├── backend/
│   ├── app/
│   ├── migrations/
│   ├── requirements.txt
│   └── pytest.ini
├── frontend/
│   ├── App.tsx
│   ├── screens/
│   ├── styles/
│   └── package.json
├── db/
│   └── password.txt
├── proxy/
├── compose.yaml
├── Setup.md
├── Intallation.md
├── README.md
└── curl_commands.md
```

## Prerequisites

Before running locally, make sure you have:

- Python 3
- Node.js and npm
- Docker and Docker Compose

## Quick start

### 1. Set up the database secret

Create the database password file if it does not already exist:

```bash
mkdir -p db
printf '%s\n' 'your_secure_password' > db/password.txt
chmod 600 db/password.txt
```

### 2. Start PostgreSQL with Docker

```bash
docker compose up -d db
```

### 3. Set up the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Set the environment variables for the database connection and run the app:

```bash
export POSTGRES_USER=motivi
export POSTGRES_DB=calorie
export POSTGRES_PASSWORD=$(cat ../db/password.txt)
flask --app app.main run --host 0.0.0.0 --port 8000
```

### 4. Run the frontend

From the project root:

```bash
cd frontend
npm install
npm start
```

## Environment notes

The project expects a PostgreSQL database named `calorie` with a user named `motivi`, as configured in the Docker setup and app factory.

The database password is read from `db/password.txt` via the secret configuration in `compose.yaml`.

## Useful documents

- [Setup.md](Setup.md) for environment and project setup notes
- [Intallation.md](Intallation.md) for installation guidance
- [curl_commands.md](curl_commands.md) for API testing examples

## License

This project is currently structured as a local development app and does not yet define a formal open-source license.

## Status

Motivi is actively being developed as a nutrition-tracking MVP with a backend API, mobile app front end, and supporting database tooling.

## Images
https://www.flaticon.com/
