# Monitoring Stack

This directory contains configuration for the monitoring stack including Prometheus and Grafana.

## Services

### Prometheus
- **URL**: http://localhost:9090
- **Description**: Metrics collection and monitoring
- **Targets**: 
  - Spring Boot app metrics (`app:8080/actuator/prometheus`)
  - PostgreSQL (if postgres_exporter is added)
  - RabbitMQ metrics
  - Redis metrics (if redis_exporter is added)

### Grafana
- **URL**: http://localhost:3000
- **Default Credentials**: admin / admin123 (configurable via .env)
- **Description**: Metrics visualization and dashboards
- **Auto-configured**: Prometheus datasource

### RabbitMQ Management
- **URL**: http://localhost:15672
- **Default Credentials**: admin / admin123 (configurable via .env)
- **Description**: RabbitMQ management interface

## Configuration Files

- `prometheus.yml`: Prometheus scraping configuration
- `grafana/datasources/prometheus.yml`: Auto-provisioned Prometheus datasource
- `grafana/dashboards/dashboard.yml`: Dashboard provisioning configuration

## Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
# Edit .env with your preferred passwords
```

## Starting the Stack

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Accessing Services

1. **Application**: http://localhost:8080
2. **Swagger UI**: http://localhost:8080/swagger-ui/index.html
3. **Grafana**: http://localhost:3000 (admin/admin123)
4. **Prometheus**: http://localhost:9090
5. **RabbitMQ**: http://localhost:15672 (admin/admin123)
6. **MailHog**: http://localhost:8026

## Spring Boot Actuator Endpoints

Your application exposes these monitoring endpoints:

- `/actuator/health` - Health check
- `/actuator/metrics` - Application metrics
- `/actuator/prometheus` - Prometheus formatted metrics
- `/actuator/info` - Application information