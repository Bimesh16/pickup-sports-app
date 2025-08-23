# Multi-Node Deployment Checklist

- Rate limits & lockout
  - Enable Redis-backed distributed limits: `auth.rate-limit.distributed.enabled: true`
  - Enable distributed user lockout: `auth.login.distributed-enabled: true`
  - Monitor `auth.*` and `security.login.*` metrics

- WebSocket scaling
  - Prefer a shared message broker (e.g., external STOMP broker) or Redis pub/sub for fan-out
  - Ensure `chat.redis.enabled: true` in multi-node deployments

- Sessions & tokens
  - Stateless JWT access tokens; revoke refresh tokens on logout/change-email as needed
  - If using sessions elsewhere, consider sticky sessions or distributed session store

- Storage
  - Use S3 (or compatible) with CDN or presigned URLs
  - Monitor storage health, latency, and error rates

- Observability
  - Deploy metrics/health dashboards and alerts
  - Trace correlation IDs across logs and WS

- Configuration & secrets
  - Provide env-specific config; store secrets in a manager (not VCS)
