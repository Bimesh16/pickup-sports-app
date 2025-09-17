# Curl Examples

## Login and refresh

```bash
# After logging in, capture both refreshToken and refreshNonce from the response
TOKEN="..."    # refreshToken value
NONCE="..."    # refreshNonce value

curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Refresh-Nonce: $NONCE" \
  -d '{"refreshToken":"'$TOKEN'"}' \
  http://localhost:8080/auth/refresh
```

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

## Search and Explore

### Search games with filters

```bash
curl 'http://localhost:8080/search/games?sport=Basketball&skillLevel=Intermediate&fromDate=2025-01-01T00:00:00Z&toDate=2025-01-31T23:59:59Z&lat=37.7749&lng=-122.4194&radiusKm=10'
```

### Explore paginated games

```bash
curl 'http://localhost:8080/games/explore?page=0&size=20&sort=time,asc'
```

### Find nearby games

```bash
curl 'http://localhost:8080/games/nearby?lat=37.7749&lon=-122.4194&radiusKm=5&page=0&size=10&sort=time,asc'
```
