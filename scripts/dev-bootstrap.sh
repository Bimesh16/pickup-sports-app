#!/usr/bin/env bash
set -euo pipefail

DC="docker compose -f docker-compose.dev.yml"

# Start database first
$DC up -d db

# Wait for database to be ready
until $DC exec -T db pg_isready -U postgres -d soccer_app >/dev/null 2>&1; do
  echo "Waiting for database..."
  sleep 2
done

echo "Running migrations"
./mvnw -q -Dflyway.url=jdbc:postgresql://localhost:5432/soccer_app -Dflyway.user=postgres -Dflyway.password=postgres flyway:migrate

echo "Seeding users"
$DC exec -T db psql -U postgres -d soccer_app -f scripts/seed/users.sql

echo "Seeding games"
$DC exec -T db psql -U postgres -d soccer_app -f scripts/seed/games.sql

# Start full stack
$DC up -d --build

echo "Stack is up."
