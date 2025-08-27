# How to RSVP

1. Authenticate and obtain a JWT token.
2. Join a game:
   ```
   POST /games/{id}/join
   Authorization: Bearer <token>
   ```
   Response example:
   ```json
   { "joined": true, "waitlisted": false, "message": "ok" }
   ```
3. To leave a game:
   ```
   DELETE /games/{id}/leave
   Authorization: Bearer <token>
   ```
   Response example:
   ```json
   { "removed": true, "promoted": 1 }
   ```
4. Check your status:
   ```
   GET /games/{id}/rsvp-status
   Authorization: Bearer <token>
   ```
   Response example:
   ```json
   { "joined": true, "waitlisted": false, "capacity": 10, "openSlots": 2, "cutoff": false }
   ```
