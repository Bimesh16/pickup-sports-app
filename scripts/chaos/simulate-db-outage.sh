#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.dev.yml}
DB_SERVICE=${DB_SERVICE:-db}
APP_HEALTH_URL=${APP_HEALTH_URL:-http://localhost:8080/actuator/health/readiness}

echo "Simulating database outage..."
docker compose -f "$COMPOSE_FILE" stop "$DB_SERVICE"

# Allow some time for outage effects
sleep 5

status=$(curl -s -o /dev/null -w "%{http_code}" "$APP_HEALTH_URL" || true)
echo "App status during outage: $status"

docker compose -f "$COMPOSE_FILE" start "$DB_SERVICE"

echo "Waiting for database recovery..."
for i in {1..30}; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$APP_HEALTH_URL" || true)
  if [ "$status" = "200" ]; then
    echo "App recovered after DB outage."
    exit 0
  fi
  sleep 2
done

echo "App failed to recover after DB outage." >&2
exit 1
