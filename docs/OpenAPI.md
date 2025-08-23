# OpenAPI & Swagger

## Accessing Swagger UI

- In development, the interactive API docs are available at:
  - Swagger UI: `http://localhost:8080/swagger-ui/index.html`
  - Raw OpenAPI JSON: `http://localhost:8080/v3/api-docs`

If disabled in prod, enable via properties for your environment as needed.

## Auth Header

Most secured endpoints require a Bearer token:
