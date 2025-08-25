# Integration Layer

This source set contains clients and adapters used to integrate with
external systems. Each integration is organized by package under
`src/integration/java` and kept separate from the main application
code.

Placing these components in their own source set keeps external
concerns isolated and makes it clear which classes act as
boundaries to other services.
