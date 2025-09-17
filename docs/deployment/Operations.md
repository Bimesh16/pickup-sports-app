# Operations

## Health Probes

- Liveness: `/actuator/health/liveness`
- Readiness: `/actuator/health/readiness`
- Composite health: `/actuator/health`
- Storage: health component `storage`
- Mail: health component `mail`

## Key Metrics (suggested dashboards)

- security.login.attempts (result)
- security.login.locked
- auth.forgot.attempts (result, scope)
- auth.resend.attempts (result, scope)
- notifications.ws.sent/failed (type)
- ws.publish.sent/failed (publisher, destination)
- chat.burst.denied (destination)
- cb.state.value and cb.state.transitions (name=xai)
- recommendations.source (source)
- retention.cleanup.duration, retention.cleanup.deleted (type), retention.cleanup.lastRunEpochMs
- tokens.cleanup.deleted (type)

## Alerts (suggestions)

- Circuit breaker OPEN transitions > 0 for xai in last 5 minutes
- Storage or mail health DOWN
- Spike in auth.forgot.attempts{result="denied"} or auth.resend.attempts{result="denied"}
- Unusual retention cleanup deletions (sudden spikes)
