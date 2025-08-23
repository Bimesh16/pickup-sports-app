# Rate Limiting & Lockout

The app supports two layers of protection:

1) In-memory (node-local) windows
- Login: per-user lockout with auto-unlock; per-IP sliding window deny.
- Forgot/Resend: per-user and per-IP soft-deny (always 200 but email not sent).
- Suitable for single-node or as a fallback when Redis is unavailable.

2) Redis-backed distributed limits (recommended for multi-node)
- Enable with:
  ```
  auth.rate-limit.distributed.enabled: true
  ```
- Keys:
  - Login: `rl:login:ip:<ip>`
  - Forgot: `rl:forgot:user:<user>`, `rl:forgot:ip:<ip>`
  - Resend: `rl:resend:user:<user>`, `rl:resend:ip:<ip>`
- TTL: 60 seconds; keys expire automatically.

## User Lockout (distributed)

- Enable via:
  ```
  auth.login.distributed-enabled: true
  ```
- Keys:
  - Fail counter: `fail:user:<user>` (expires slightly beyond lockout window)
  - Lock flag: `lock:user:<user>` (expires after lockoutMinutes)
- Behavior: if lock flag is present, login is blocked with a helpful message.

## Observability

- Metrics:
  - `auth.forgot.attempts{result,scope}`
  - `auth.resend.attempts{result,scope}`
  - `security.login.attempts{result}`
  - `security.login.locked`

Monitor denied attempts and lockouts to tune policies and detect abuse.
