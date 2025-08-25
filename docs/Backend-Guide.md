# Backend Guide

This guide summarizes key backend features and how to use them from clients and ops.

## Authentication and Sessions

- Login: POST /auth/login with JSON body { "username", "password" }.
  - Returns access/refresh tokens; also issues a refresh cookie (HttpOnly) if enabled.
  - Lockout: Excessive failed attempts cause temporary lockout per user and per IP (configurable).
- Refresh: POST /auth/refresh
  - Accepts a refresh token from body or cookie; returns a new pair.
- Logout: POST /auth/logout
  - Revokes refresh token; clears cookie and adds Clear-Site-Data headers.

### Email Verification

- On registration, a verification email is sent. Unverified users can be blocked from login (configurable).
- Verify: GET /auth/verify?token=...
- Resend verification: POST /auth/resend-verification with { "username" }
  - Soft rate-limited per user and per IP; always returns 200 if payload is valid.

### Password Reset

- Forgot password: POST /auth/forgot with { "username" }
  - Soft rate-limited per user and per IP; always returns 200.
- Validate reset token: GET /auth/reset/validate?token=...
- Reset password: POST /auth/reset with { "token", "newPassword" }
  - Enforces password policy (length, letters/digits, blacklist). Policy is configurable.

### Change Password / Change Email

- Change password: POST /auth/change-password
  - Requires authentication, currentPassword and newPassword; returns 200 on success.
- Change email: POST /auth/change-email with { "newEmail", "currentPassword" }
  - Sends confirmation to the new email; confirm via GET /auth/change-email/confirm?token=...
  - Optionally revokes existing sessions (configurable).

## WebSocket

- Notifications: Subscribe to /user/queue/notifications to receive notification events.
- Errors: Subscribe to /user/queue/errors to receive structured error payloads (WsErrorDTO).
- Chat: Clients send to /app/games/{id}/chat; server broadcasts on /topic/games/{id}/chat.
- Rate limiting:
  - Per-channel rate limiter.
  - Per-user burst limiter (sliding window).
    - Server rejects on violation and emits a structured error to /user/queue/errors.

## Notifications

- Unread badge count: GET /notifications/unread-count -> { "count" }

## Notifications

- Get notifications: `GET /notifications`
- Mark multiple as read: `POST /notifications/mark-read` with `{ "ids": [1,2,3] }`
- Mark all as read: `PUT /notifications/mark-all-read`
- Quick unread count: `GET /notifications/unread-count`

## Moderation

- Profanity filter can sanitize or reject messages (configurable).
- Dictionary source:
  - Inline word list from properties and optional external file (classpath or file path).
  - Optional hot-reload with a file watcher.
- Admin endpoints (ROLE_ADMIN):
  - GET /admin/moderation, GET /admin/moderation/words
  - POST /admin/moderation/words (replace list)
  - POST /admin/moderation/words/add with { "word" }
  - DELETE /admin/moderation/words/{word}
  - POST /admin/moderation/toggle with { "enabled": bool, "reject": bool }
  - POST /admin/moderation/reload

## Media / Avatars

- Upload avatar: PUT/POST /profiles/me/avatar (multipart/form-data)
  - Validates MIME type, size, magic number, and absolute dimensions (configurable).
  - Re-encodes PNG/JPEG to strip metadata and downscale if needed.
  - Generates a thumbnail alongside original (suffix _thumb).
- Thumbnail URL:
  - GET /profiles/me/avatar/thumbnail (auth) -> { "thumbnailUrl" }
  - GET /profiles/{id}/avatar/thumbnail -> { "thumbnailUrl" }
  - Opt-in: add X-Avatar-Thumbnail-Url response header in profile responses (configurable).
- HEAD /profiles/{id}/avatar returns redirection metadata (Location, ETag, Last-Modified) for CDNs.

## Health and Metrics

- Health probes: /actuator/health, /actuator/health/liveness, /actuator/health/readiness
- Storage health: validates writing to media storage provider.
- Mail health: tests mail connection when supported.
- Metrics highlights:
  - security.login.attempts {result=success|failure}
  - security.login.locked (user lockouts)
  - tokens.cleanup.deleted {type=refresh|verification|reset}
  - ws.publish.sent/failed {publisher=local|redis, destination=...}
  - chat.burst.denied {destination=...}
  - notifications.ws.sent/failed {type=created|read|deleted}
  - recommendations.source {source=xai|fallback}
  - cb.state.value {name=xai}, cb.state.transitions {to=OPEN|...}
  - retention.cleanup.duration, retention.cleanup.deleted {type=...}, retention.cleanup.lastRunEpochMs

## Configuration Summary

- Auth flows: auth.verification-required, auth.verification-ttl-hours, auth.reset-ttl-hours, auth.app-url
- Login policy: auth.login.max-failures-per-user, max-failures-per-ip, lockout-minutes, ip-window-minutes
- Resend limits: auth.resend.max-per-user-per-minute, max-per-ip-per-minute
- Password policy: auth.password-min-length, auth.require-letter, auth.require-digit, auth.password-blacklist
- Chat moderation: chat.moderation.enabled, reject, words, dictionaryPath, reloadOnChange
- Media storage: app.media.storage.provider=local|s3
- Avatars: media.avatar.allowed-types, max-bytes, max-width/height, absolute-max-width/height, strip-metadata, thumbnail.enabled/width/height, include-thumbnail-header
- Retention: retention.chat.messages.days, retention.chat.read-receipts.days, retention.notifications.days
