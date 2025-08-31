#!/usr/bin/env bash
set -euo pipefail

echo "Bringing down current compose project (with volumes)..."
docker compose down -v --remove-orphans || true

echo "Force-removing any lingering containers with 'pickup_' names..."
for c in pickup_mailhog pickup_redis pickup_rabbitmq pickup_db pickup_prometheus pickup_grafana pickup_app; do
  docker rm -f "$c" >/dev/null 2>&1 || true
done

# Determine compose project name (defaults to current folder name)
project="${COMPOSE_PROJECT_NAME:-$(basename "$PWD")}"

echo "Removing project volumes for '${project}' if they exist..."
vols=$(docker volume ls -q --filter "name=${project}_")
if [ -n "${vols}" ]; then
  docker volume rm -f ${vols} || true
fi

echo "Removing default project network if it lingers..."
docker network rm "${project}_default" >/dev/null 2>&1 || true

echo "Rebuilding images without cache..."
docker compose build --no-cache

echo "Starting containers in the background..."
docker compose up -d

echo "Done. Postgres should now be reachable at jdbc:postgresql://localhost:5432/soccer_app"
