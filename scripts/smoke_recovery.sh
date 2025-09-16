#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-http://localhost:8080}"

echo "== Comms health =="
curl -sS "${API_BASE}/auth/comms/health" | jq . || curl -sS "${API_BASE}/auth/comms/health"

echo
echo "== Forgot password (email) =="
curl -sS -X POST "${API_BASE}/auth/forgot-password" \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com"}' | jq . || true

echo
echo "== Reset password (mock token) =="
curl -sS -X POST "${API_BASE}/auth/reset-password" \
  -H 'Content-Type: application/json' \
  -d '{"token":"mock-token","newPassword":"StrongP@ss1"}' | jq . || true

echo
echo "== Forgot username (phone) =="
curl -sS -X POST "${API_BASE}/auth/forgot-username" \
  -H 'Content-Type: application/json' \
  -d '{"phone":"+9779800000000"}' | jq . || true

echo
echo "Done."

