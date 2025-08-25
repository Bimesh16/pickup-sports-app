# Curl Examples

## Login and refresh

## Notifications

### Mark notifications as read

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ids":[1,2,3]}' \
  http://localhost:8080/notifications/mark-read
```

### Get unread notification count

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/notifications/unread-count
```
