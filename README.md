# English Center — Minimal runnable setup

This repository contains a Spring Boot backend and a React + Vite frontend for a minimal English center management MVP. The goal of this update is to make it easy to run locally (H2 in-memory) and to run the full stack via Docker Compose with sensible defaults.

## What I changed
- Fixed container networking for the frontend in `docker-compose.yml` so it reaches the backend service when run under Docker Compose.
- Rewrote this README with clear local and Docker run instructions and a short changelog.

No behavioral changes were made to the application code. The backend still defaults to an in-memory H2 database when no external DB is provided; the original MySQL + Flyway setup is preserved for Docker runs.

## Quick start — Local (developer)
Prerequisites: Java 17 + Maven, Node.js (18+) and npm or yarn.

1) Backend (H2 in-memory):

```bash
cd backend
mvn -DskipTests package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

The backend starts on port 8080 and exposes APIs under `/api`.

2) Frontend (Vite dev server):

```bash
cd frontend
npm install
npm run dev
```

Open the frontend at the URL printed by Vite (default `http://localhost:5173`) — the frontend uses `VITE_API_URL` to locate the backend (default `http://localhost:8080/api`).

Tip: to override the API URL in your shell before running the dev server:

```bash
export VITE_API_URL=http://localhost:8080/api      # macOS / Linux
set VITE_API_URL=http://localhost:8080/api         # Windows PowerShell
```

## Quick start — Docker Compose
The repository includes a `docker-compose.yml` that brings up a MySQL database, the backend, and the frontend.

Run the full stack (build images the first time):

```bash
docker compose up --build
```

Notes:
- Frontend service runs the Vite dev server on container port `3000` and is mapped to host `3000`.
- Backend runs on port `8080` and connects to the `db` service.
- The frontend now uses `http://backend:8080/api` inside the Docker network (this was corrected).

If you want Flyway to run migrations in Docker, enable it by setting `FLYWAY_ENABLED=true` in the backend service environment (or create a `docker-compose.override.yml`).

## Environment variables
- `DB_URL` — JDBC URL for the DB (default: H2 in-memory if not provided)
- `DB_USERNAME`, `DB_PASSWORD` — DB credentials
- `FLYWAY_ENABLED` — `true`/`false` to enable Flyway migrations (disabled by default)
- `VITE_API_URL` — frontend API base URL (dev server). When using Docker Compose the frontend container reads `http://backend:8080/api`.

## Files I modified
- `docker-compose.yml` — fixed `VITE_API_URL` for the frontend container (use the backend service hostname inside Docker network).
- `README.md` — replaced with this clearer run guide and changelog.

## Next suggestions (optional)
- Add `docker-compose.override.yml` to toggle Flyway (`FLYWAY_ENABLED=true`) for compose runs.
- Add `application-dev.yml` and `application-prod.yml` Spring profiles to separate local H2 settings from production MySQL.
- Add a simple `Makefile` or scripts to streamline common tasks (build, run, compose-up).

If you'd like, I can apply any of the suggestions above (example: add `docker-compose.override.yml` to enable Flyway). Reply with which one you prefer and I will implement it.
