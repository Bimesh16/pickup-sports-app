# Pickup Sports Web Frontend (Vite + React)

This is a minimal web frontend targeting the backend defined in `docs/openapi.yaml`. It authenticates via `/auth/login`, and shows Nearby/Trending games using `/api/v1/games/nearby` or `/api/v1/games/trending`.

## Quick start

1. Install deps

```
cd frontend-web
npm install
```

2. Mock mode (default). The app uses a full mock API so you can test without a backend.
   - To keep mock mode: do nothing (default on). See `.env.example` -> `VITE_USE_MOCK=true`.
   - To hit a real backend: set `VITE_USE_MOCK=false` and configure `VITE_API_BASE`.

3. Run dev server

```
npm run dev
```

- App: http://localhost:5173
- Backend: http://localhost:8080

Login with seeded users from the backend README (e.g. `jane@example.com` / `password`).

## Build

```
npm run build
npm run preview
```

## Notes
- Mock API: Located in `src/lib/mockApi.ts`, routed by `src/lib/http.ts` when `VITE_USE_MOCK=true`.
- CORS: Vite dev uses a proxy for `/auth`, `/api`, `/config`, etc., avoiding CORS issues during development.
- Tokens: Access token is stored in `localStorage` as `ps_token` (demo-only). For production, prefer HTTP-only refresh cookies and short-lived access tokens in memory.
- Extending: Add pages under `src/pages`, API wrappers under `src/api`, shared components under `src/components`.
# E2E Testing and Dev Test Route

This frontend includes lightweight Playwright end-to-end tests and a dev-only route to mount the Registration flow directly.

## Run the app and tests

1. Install dependencies:

```
npm ci
```

2. Install Playwright (once):

```
npx playwright install
```

3. Run the dev server and tests:

```
npx playwright test
```

The Playwright config will auto-start the dev server (port 5173) if it isn't running.

## Dev-only registration route

- Route: `/test-registration`
- Only available in `import.meta.env.DEV` builds. The component is conditionally imported in `src/App.tsx` so it is not bundled in production.

## Included tests

- `country-dropdown.spec.ts`: keyboard navigation, debounce, and selection.
- `defense-key.spec.ts`: password generator meets rules (≥12 chars, class mix).
- `sticky-bar.spec.ts`: sticky CTA and trust pills visible; no overlap.
- `username-availability.spec.ts`: network interception for available/unavailable; suggestions apply.

## CI (GitHub Actions)

This repo includes a Playwright workflow at `.github/workflows/e2e.yml` that:
- Checks out the repo
- Installs Node deps in `frontend-web/`
- Installs Playwright browsers
- Runs `npx playwright test`

It uses the Playwright config in `frontend-web/playwright.config.ts`, which auto-starts the dev server on port `5173`. No extra steps needed.
