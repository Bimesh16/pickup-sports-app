# Dashboards & Alerts

## Panels (Prometheus/Micrometer)

- Auth
  - security.login.attempts{result} (stacked)
  - security.login.locked (rate)
  - auth.forgot.attempts{result,scope}
  - auth.resend.attempts{result,scope}
- WebSocket
  - ws.publish.sent{publisher,destination}
  - ws.publish.failed{publisher,destination}
  - chat.burst.denied{destination}
  - notifications.ws.sent/failed{type}
- Recommendations
  - cb.state.value{name="xai"} (state mapping), cb.state.transitions{to}
  - recommendations.source{source}
- Retention & Tokens
  - retention.cleanup.duration (timer)
  - retention.cleanup.deleted{type}
  - retention.cleanup.lastRunEpochMs (last run)
  - tokens.cleanup.deleted{type}
- Health
  - storage and mail health (up/down)

## Alerts

- Circuit breaker OPEN transitions > 0 within 5m
- Storage or mail health DOWN
- Spikes in denied auth attempts for forgot/resend
- Unusual spikes in retention deletions
