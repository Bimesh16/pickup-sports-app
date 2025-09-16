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

## Frontend integration (mocks → real API)

The web app ships with a mock API for fast iteration. When you’re ready to connect to this backend:

- In `frontend-web/src/lib/http.ts`:
  - Set `USE_MOCK = false`
  - Ensure `BASE` reads `VITE_API_BASE` (already wired with a fallback placeholder)
- Create `frontend-web/.env.local` (see `.env.local.example`) and set:
  - `VITE_API_BASE=http://localhost:8080` (or your prod URL)
- Restart the Vite dev server.

Public REST used by the frontend:
- `POST /users/register`, `POST /auth/login`, `GET /auth/me`
- Recovery: `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/forgot-username`

## Email/SMS comms (enable & test)

Enable email (Spring Mail) and optional SMS providers (Twilio or AWS SNS) via properties:

- Email (required for reset links in email path):
  - `email.service.enabled=true`
  - `spring.mail.*` (host/port/username/password)
  - `app.mail.from`, `app.mail.from-name`
- SMS (optional; default logs to console):
  - `sms.service.enabled=true`
  - `sms.provider=LOG | TWILIO | SNS`
  - Twilio: `sms.twilio-account-sid`, `sms.twilio-auth-token`, `sms.twilio-from-number`
  - AWS SNS: `sms.aws-region`, `sms.aws-access-key-id`, `sms.aws-secret-access-key`
- Reset link base (used in emails/SMS):
  - `auth-flow.app-url=https://your-frontend.example.com`

Health/test endpoints (public):
- `GET  /auth/comms/health` → `{ emailEnabled, smsEnabled }`
- `POST /auth/comms/test/email?to=me@example.com&type=reset&link=…`
- `POST /auth/comms/test/sms?to=+97798XXXXXXX&message=Hi`

Smoke script for recovery endpoints:
```
API_BASE=http://localhost:8080 bash scripts/smoke_recovery.sh
```

## Frontend deployment (Vite)

Build the SPA and host the `dist/` folder with a static server or a CDN that supports SPA fallback.

From `frontend-web/`:

```
make build
```

Notes:
- SPA fallback: configure your host to rewrite unknown routes to `/index.html` so client-side routing works.
- Environment: set `VITE_API_BASE` at build time (see `.env.local.example`).
- Toggling mocks quickly:
  - `make mock-on`  → keep using the mock API (dev)
  - `make mock-off` → switch to real API (requires `VITE_API_BASE`)


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

### Username availability cache (Redis toggle)

- Endpoint: `GET /users/check-username?username=...` responds `{ available: boolean }`.
- Basic per-IP rate limit: ~30 requests/min; returns `429` with `Retry-After: 60` when exceeded.
- Caching to reduce DB load under bursts:
  - Redis-based short TTL (10s) cache is used when available and enabled.
  - Property flag: `user.username.cache.redis.enabled` (default `true`).
  - When disabled or Redis is not present, falls back to a 10s in-memory cache.

## Backend properties (common toggles)

Below is an example `application.yml` snippet that captures common flags used by this repo. Adjust values per environment.

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5433/pickup
    username: pickup
    password: pickup
  jpa:
    hibernate:
      ddl-auto: validate
  redis:
    host: localhost
    port: 6379

# Enable Redis-backed rate limiter for certain endpoints (if configured)
auth:
  rate-limit:
    distributed:
      enabled: true

# Username availability cache toggle (frontend username check)
user:
  username:
    cache:
      redis:
        enabled: true   # default true; set false to use in-memory fallback

# Outbound email (for recovery flows)
email:
  service:
    enabled: true
spring:
  mail:
    host: localhost
    port: 1025
app:
  mail:
    from: no-reply@pickup.local
    from-name: Pickup Sports

# Optional SMS providers (Twilio or SNS)
sms:
  service:
    enabled: false
  provider: LOG

# Frontend base URL for auth flow links (email/SMS)
auth-flow:
  app-url: http://localhost:5173
```

Other helpful flags:

- `SECURITY_JWT_SECRET`: 32+ byte secret for JWT (env var).
- `CHAT_REDIS_ENABLED`: enable Redis pub/sub fan-out for chat.
- `logging.level.com.bmessi.pickupsportsapp`: set to `DEBUG` for verbose logs while troubleshooting.

Troubleshooting:
- Port conflicts: use `docker compose ps` to check mappings; kill host processes holding 8081/5433/8026 or remap ports in compose.
- JWT secret too short: ensure `SECURITY_JWT_SECRET` is >= 32 bytes (Base64URL recommended).
- STOMP disconnects: verify `/ws/info`, use a fresh token from the same app, ensure user is creator/participant of the game.
