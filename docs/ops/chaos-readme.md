# Chaos Experiments

This directory documents basic chaos engineering experiments for the Pickup Sports app.

## Database Outage

`scripts/chaos/simulate-db-outage.sh` stops the Postgres container for a short period and verifies that the application recovers once the database is restored.

## Message Broker Delay

`scripts/chaos/simulate-broker-delay.sh` pauses the RabbitMQ container to simulate message delays and ensures the application remains healthy once traffic resumes.

## Running Locally

1. Ensure Docker is running and start the dev stack:
   ```bash
   docker compose -f docker-compose.dev.yml up -d --build
   ```
2. Execute the experiments:
   ```bash
   bash scripts/chaos/simulate-db-outage.sh
   bash scripts/chaos/simulate-broker-delay.sh
   ```
3. Tear down when finished:
   ```bash
   docker compose -f docker-compose.dev.yml down -v
   ```

These scripts are also invoked in CI to provide early warning of resilience regressions.
