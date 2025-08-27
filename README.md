# Pickup Sports App (Backend)

This repository contains the backend (Java 17, Spring Boot) with WebSocket chat, REST APIs, JWT auth, and Flyway migrations. Docker Compose sets up Postgres and Mail UI (Mailpit).

## Quick start (Docker)

1. Copy env template and set secrets:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and set SECURITY_JWT_SECRET to a long random Base64URL string (>=32 bytes)
   ```

2. Start stack:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d --build
   docker logs -f pickup_app
   ```

3. Verify:
   - Health: http://localhost:8081/actuator/health
   - Swagger: http://localhost:8081/swagger-ui/index.html
- SockJS info: http://localhost:8081/ws/info
- Mail UI: http://localhost:8026

4. Chat test page:
- http://localhost:8081/chat-test.html
- Paste a fresh JWT from POST /auth/login
- Use a real Game ID (from POST /games response)
- Connect, then Send

## Observability

Grafana dashboards for RSVP and notification metrics are published under [`docs/ops`](docs/ops). Import `rsvp-metrics.json` into Grafana to visualize joins, holds, promotions, and error rates.

## Postman collection

Import the [provided collection](docs/postman/pickup-sports-api.postman_collection.json) (or the one generated from Swagger) and set:
- baseUrl: http://localhost:8081
- username/password
- gameId, userId as created.

## Guides

- [How to RSVP](docs/guides/how-to-rsvp.md)
- [Hold & Pay](docs/guides/hold-and-pay.md)

## Testing

Unit tests live under `src/test/java/unit` and run with:

```bash
./mvnw test
```

Integration tests live under `src/test/java/integration` and run during the verify phase:

```bash
./mvnw verify
```

The `verify` goal executes both unit and integration tests. To execute only integration tests, skip the unit phase:

```bash
./mvnw -DskipTests failsafe:integration-test failsafe:verify
```

## Git workflow (push to GitHub)

1. Initialize and commit:
   ```bash
   git init
   git checkout -b main
   git add .
   git commit -m "Initial setup: Flyway, Docker Compose, WS chat, security, docs"
   ```

2. Add remote and push:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

3. CI (GitHub Actions)
- This repo includes `.github/workflows/ci.yml` which builds with Maven and Docker.
- If you want to push images to GHCR, uncomment the steps and set the necessary permissions/secrets.

## Notes

- Do not commit `.env.local` (secrets) — `.gitignore` prevents that.
- Flyway manages schema from `src/main/resources/db/migration`. For a fresh DB, V1 runs first, then V2+.
- For Redis fan-out at scale, set `CHAT_REDIS_ENABLED=true` and scale app instances.

Troubleshooting:
- Port conflicts: use `docker compose ps` to check mappings; kill host processes holding 8081/5433/8026 or remap ports in compose.
- JWT secret too short: ensure `SECURITY_JWT_SECRET` is >= 32 bytes (Base64URL recommended).
- STOMP disconnects: verify `/ws/info`, use a fresh token from the same app, ensure user is creator/participant of the game.
