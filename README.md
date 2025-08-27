# Pickup Sports App (Backend)

This repository contains the backend (Java 17, Spring Boot) with WebSocket chat, REST APIs, JWT auth, and Flyway migrations. Docker Compose sets up Postgres and Mail UI (Mailpit).

## Quick start

The `scripts/dev-bootstrap.sh` helper spins up the dev stack, applies Flyway
migrations, seeds demo users and games, and starts Docker Compose services.

```bash
./scripts/dev-bootstrap.sh
```

After the containers are up, hit a few endpoints using a seeded user:

```bash
USER=jane@example.com PASS=password ./scripts/quickstart.sh
```

The backend listens on [http://localhost:8080](http://localhost:8080) and the
frontend on [http://localhost:3000](http://localhost:3000).

Seeded users:

- `jane@example.com` / `password`
- `john@example.com` / `password`
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
