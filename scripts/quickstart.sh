#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://localhost:8080}
USER=${USER:-"demo@example.com"}
PASS=${PASS:-"Passw0rd!"}

echo "1) Login (expect failure if user not registered)"
curl -s -X POST "$BASE_URL/auth/login" -H 'Content-Type: application/json' -d "{\"username\":\"$USER\",\"password\":\"$PASS\"}" || true
echo

echo "2) Resend verification (no-op if user doesn't exist)"
curl -s -X POST "$BASE_URL/auth/resend-verification" -H 'Content-Type: application/json' -d "{\"username\":\"$USER\"}"
echo

echo "3) Forgot password"
curl -s -X POST "$BASE_URL/auth/forgot" -H 'Content-Type: application/json' -d "{\"username\":\"$USER\"}"
echo

echo "4) Health"
curl -s "$BASE_URL/actuator/health"
echo

echo "Done. For full flows, register a user via your registration endpoint, then verify the email from the link sent."
