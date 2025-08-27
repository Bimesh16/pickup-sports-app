# Hold & Pay

Use holds to reserve a spot before completing payment.

1. Create a hold:
   ```
   POST /games/{id}/hold?ttl=120
   Authorization: Bearer <token>
   ```
   Response:
   ```json
   { "holdId": 42, "expiresAt": "2024-01-01T10:02:00Z" }
   ```
2. Collect payment using your preferred provider.
3. Confirm the hold after payment:
   ```
   POST /games/{id}/confirm
   Authorization: Bearer <token>
   Content-Type: application/json

   { "holdId": 42 }
   ```
   Response:
   ```json
   { "joined": true, "waitlisted": false, "message": "ok" }
   ```

If the hold expires before confirmation, the API returns `410`.
