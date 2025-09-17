# WebSocket Guide

## Subscriptions

- Chat: Subscribe to `/topic/games/{gameId}/chat`.
- Notifications: Subscribe to `/user/queue/notifications`.
- Errors: Subscribe to `/user/queue/errors`.

## Sending

- Chat message: SEND to `/app/games/{gameId}/chat` with JSON body (content, clientId optional).
- Typing: SEND to `/app/games/{gameId}/typing` with JSON body (sender optional; server infers auth user).
- Read receipts: SEND to `/app/games/{gameId}/read` with JSON body (messageId required).

### Example payloads

Chat message:

## Events

- Capacity updates: clients subscribed to `/topic/games/{gameId}` receive `{ "type": "capacity_update", "data": { "remainingSlots": number, "hint": "optional" } }` when game availability changes.
