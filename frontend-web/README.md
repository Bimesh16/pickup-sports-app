# Pickup Sports Web Frontend (Vite + React)

This is a minimal web frontend targeting the backend defined in `docs/openapi.yaml`. It authenticates via `/auth/login`, and shows Nearby/Trending games using `/api/v1/games/nearby` or `/api/v1/games/trending`.

## Quick start

1. Install deps

```
cd frontend-web
npm install
```

2. Configure API base (optional). By default, dev server proxies to `http://localhost:8080` for `/auth`, `/api`, etc. If you prefer absolute URLs, create `.env` from `.env.example` and set `VITE_API_BASE`.

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
- CORS: Vite dev uses a proxy for `/auth`, `/api`, `/config`, etc., avoiding CORS issues during development.
- Tokens: Access token is stored in `localStorage` as `ps_token` (demo-only). For production, prefer HTTP-only refresh cookies and short-lived access tokens in memory.
- Extending: Add pages under `src/pages`, API wrappers under `src/api`, shared components under `src/components`.
