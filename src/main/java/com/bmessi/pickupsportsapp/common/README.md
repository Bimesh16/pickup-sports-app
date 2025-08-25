# Common Infrastructure

This package hosts cross-cutting concerns used across the application:

- HTTP filters such as `CorrelationIdFilter` and `SecurityHeadersFilter`
- Shared configuration classes and related properties
- Lightweight utilities

These components are framework-level building blocks and are safe to reuse in any
feature module. Adding new infrastructure pieces here keeps them in a central
location for easy discovery and maintenance.
