#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.dev.yml}
BROKER_SERVICE=${BROKER_SERVICE:-rabbitmq}
APP_HEALTH_URL=${APP_HEALTH_URL:-http://localhost:8080/actuator/health/readiness}

echo "Simulating message broker delay..."
docker compose -f "$COMPOSE_FILE" pause "$BROKER_SERVICE"
# Introduce artificial delay
sleep 10
docker compose -f "$COMPOSE_FILE" unpause "$BROKER_SERVICE"

echo "Checking app health after broker delay..."
for i in {1..30}; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$APP_HEALTH_URL" || true)
  if [ "$status" = "200" ]; then
    echo "App healthy after broker delay."
    exit 0
  fi
  sleep 2
done

echo "App failed health check after broker delay." >&2
exit 1
