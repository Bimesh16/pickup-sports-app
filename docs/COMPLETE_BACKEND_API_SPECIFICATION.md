# 🏗️ Complete Backend API Specification for Pickup Sports App

## 📋 Overview

This is the comprehensive backend API specification for developing the pickup sports app frontend. The backend provides a full-featured REST API with WebSocket support, AI recommendations, advanced analytics, and enterprise-grade monitoring capabilities.

**Base URL:** `http://localhost:8080`

**Architecture:** Spring Boot, PostgreSQL, Redis, WebSocket, JWT Authentication

---

## 🔐 Authentication & Authorization

### Authentication Flow

All API endpoints (except public ones) require JWT authentication via the `Authorization: Bearer <token>` header.

#### POST `/auth/login`
Authenticate user and receive JWT tokens.

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "accessToken": "string",
  "refreshToken": "string", 
  "refreshNonce": "string",
  "expiresIn": "number",
  "tokenType": "Bearer"
}
```

#### POST `/auth/refresh`
Refresh JWT tokens using refresh token.

**Headers:**
```
X-Refresh-Nonce: <nonce_value>
```

**Request:**
```json
{
  "refreshToken": "string"
}
```

**Response (200):** Same as login response

#### POST `/auth/logout`
Revoke refresh token and clear authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** 204 No Content

#### GET `/auth/me`
Get current authenticated user info.

**Response (200):**
```json
{
  "username": "string",
  "roles": ["string"],
  "authenticated": "boolean",
  "timestamp": "number"
}
```

### Email Verification

#### GET `/auth/verify?token=<verification_token>`
Verify email address.

#### POST `/auth/resend-verification`
**Request:**
```json
{
  "username": "string"
}
```

### Password Reset

#### POST `/auth/forgot`
**Request:**
```json
{
  "username": "string"
}
```

#### GET `/auth/reset/validate?token=<reset_token>`
Validate password reset token.

#### POST `/auth/reset`
**Request:**
```json
{
  "token": "string",
  "newPassword": "string"
}
```

#### POST `/auth/change-password`
**Request:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

#### POST `/auth/change-email`
**Request:**
```json
{
  "newEmail": "string",
  "currentPassword": "string"
}
```

---

## 👤 User Management APIs

### User Registration

#### POST `/users/register`
Register a new user account.

**Request:**
```json
{
  "username": "string",
  "password": "string",
  "preferredSport": "string",
  "location": "string"
}
```

**Response (201):**
```json
{
  "id": "number",
  "username": "string",
  "preferredSport": "string",
  "location": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### User Profile Management

#### GET `/profiles/me`
Get current user's complete profile.

**Response (200):**
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "bio": "string",
  "skillLevel": "BEGINNER|INTERMEDIATE|ADVANCED|PRO",
  "preferredSport": "string",
  "location": "string",
  "latitude": "number",
  "longitude": "number",
  "phone": "string",
  "age": "number",
  "avatarUrl": "string",
  "rating": "number",
  "ratingCount": "number",
  "verified": "boolean",
  "roles": ["string"],
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### PUT `/profiles/me`
Update user profile.

**Request:**
```json
{
  "firstName": "string",
  "lastName": "string", 
  "bio": "string",
  "skillLevel": "string",
  "preferredSport": "string",
  "location": "string",
  "latitude": "number",
  "longitude": "number",
  "phone": "string",
  "age": "number"
}
```

#### GET `/profiles/{id}`
Get public profile of any user.

#### PUT `/profiles/me/avatar`
Upload user avatar image (multipart/form-data).

#### GET `/profiles/me/avatar/thumbnail`
Get avatar thumbnail URL.

#### GET `/profiles/{id}/avatar/thumbnail`
Get user's avatar thumbnail URL.

---

## 🏃 Game Management APIs

### Game Discovery

#### GET `/games`
Get paginated list of games with filtering.

**Query Parameters:**
- `sport`: Filter by sport (optional)
- `location`: Filter by location (optional)
- `skillLevel`: Filter by skill level (optional)
- `fromTime`: Start of time range (ISO-8601)
- `toTime`: End of time range (ISO-8601)
- `page`: Page number (default: 0)
- `size`: Page size (default: 10, max: 50)
- `sort`: Sort criteria (e.g., "time,asc")

**Response (200):**
```json
{
  "content": [
    {
      "id": "number",
      "sport": "string",
      "location": "string", 
      "time": "string",
      "skillLevel": "string",
      "latitude": "number",
      "longitude": "number",
      "venue": {
        "id": "number",
        "name": "string",
        "address": "string"
      },
      "gameType": "PICKUP|TOURNAMENT|LEAGUE|TRAINING|SOCIAL|COMPETITIVE",
      "description": "string",
      "minPlayers": "number",
      "maxPlayers": "number",
      "currentParticipants": "number",
      "pricePerPlayer": "number",
      "totalCost": "number",
      "durationMinutes": "number",
      "status": "DRAFT|PUBLISHED|FULL|CANCELLED|COMPLETED|ARCHIVED",
      "creator": {
        "id": "number",
        "username": "string",
        "firstName": "string",
        "lastName": "string"
      },
      "rsvpCutoff": "string",
      "capacity": "number",
      "waitlistEnabled": "boolean",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "totalElements": "number",
  "totalPages": "number",
  "number": "number",
  "size": "number",
  "first": "boolean",
  "last": "boolean"
}
```

#### GET `/games/explore`
Explore games with advanced pagination and caching.

**Query Parameters:**
- `page`: Page number (default: 0)
- `size`: Page size (default: 20)
- `sort`: Sort criteria (default: "time,asc")

#### GET `/games/nearby`
Find games near a location.

**Query Parameters:**
- `lat`: Latitude (required)
- `lon`: Longitude (required)
- `radiusKm`: Radius in kilometers (default: 5)
- `page`: Page number
- `size`: Page size
- `sort`: Sort criteria

#### GET `/games/search/advanced`
Advanced search with multiple filters.

**Query Parameters:**
- `sport`: Sport type (partial match)
- `location`: Location (partial match)
- `fromTime`: Start time range
- `toTime`: End time range
- `skillLevel`: Skill level
- `gameType`: Game type
- `minCapacity`: Minimum capacity
- `maxCapacity`: Maximum capacity
- `maxPrice`: Maximum price per player
- `freeOnly`: Only free games (boolean)
- `venueId`: Specific venue ID
- `page`, `size`, `sort`

### Game CRUD Operations

#### GET `/games/{id}`
Get detailed game information.

**Response (200):** Single game object (same structure as games list)

#### POST `/games`
Create a new game.

**Request:**
```json
{
  "sport": "string",
  "location": "string",
  "time": "string",
  "skillLevel": "string",
  "latitude": "number",
  "longitude": "number",
  "venueId": "number",
  "gameType": "PICKUP|TOURNAMENT|LEAGUE|TRAINING|SOCIAL|COMPETITIVE",
  "description": "string",
  "minPlayers": "number",
  "maxPlayers": "number", 
  "pricePerPlayer": "number",
  "totalCost": "number",
  "durationMinutes": "number",
  "rsvpCutoff": "string",
  "capacity": "number",
  "waitlistEnabled": "boolean"
}
```

**Headers:**
- `Idempotency-Key`: Prevent duplicate submissions

**Response (201):** Created game object

#### PUT `/games/{id}`
Update existing game (full update).

**Request:** Same as POST request

#### PATCH `/games/{id}`
Partial game update.

**Request:**
```json
{
  "sport": "string",
  "location": "string", 
  "time": "string",
  "skillLevel": "string",
  "latitude": "number",
  "longitude": "number"
}
```

#### DELETE `/games/{id}`
Delete/cancel a game.

**Response:** 204 No Content

### Game Participation (RSVP)

#### POST `/games/{id}/rsvp` OR `/games/{id}/join`
RSVP to a game (join). The backend supports both endpoints.

**Response (200):**
```json
{
  "status": "confirmed|waitlisted",
  "position": "number",
  "message": "string"
}
```

#### DELETE `/games/{id}/rsvp` OR `/games/{id}/unrsvp` OR `/games/{id}/leave`
Cancel RSVP (leave game). Multiple endpoint variants supported.

#### GET `/games/{id}/rsvp-status`
Check current RSVP status for a game.

#### GET `/games/{id}/waitlist`
Get waitlist information for a game.

#### GET `/games/me`
Get current user's games (created and joined).

### Two-Phase RSVP (Hold & Confirm)

#### POST `/games/{id}/hold`
Create temporary hold on game slot.

**Query Parameters:**
- `ttl`: Hold duration in seconds (default: 120)

**Headers:**
- `Idempotency-Key`: Prevent duplicate holds

**Response (201):**
```json
{
  "holdId": "string",
  "expiresAt": "string",
  "position": "number"
}
```

#### POST `/games/{id}/confirm`
Confirm hold and complete RSVP.

**Request:**
```json
{
  "holdId": "string"
}
```

### Additional Game Endpoints

#### GET `/games/near`
Alternative nearby games endpoint.

#### GET `/games/recommend`  
Get game recommendations.

#### GET `/games/sports`
Get available sports for games.

#### GET `/games/skills`
Get available skill levels.

#### GET `/games/explore`
Explore games with advanced caching.

### Game Search Variants

#### GET `/games/search/advanced`
Advanced search with comprehensive filters.

#### GET `/games/search/nearby` 
Spatial proximity search.

#### GET `/games/search/available`
Search only available games.

#### GET `/games/search/trending`
Get trending games.

#### GET `/games/search/upcoming`
Get upcoming games.

#### GET `/games/search/recommendations`
Search-based recommendations.

---

## 🏢 Venue Management APIs

### Venue Discovery

#### GET `/venues`
Get paginated list of venues.

**Query Parameters:**
- `name`: Filter by name
- `city`: Filter by city
- `sport`: Filter by supported sport
- `page`: Page number
- `size`: Page size

**Response (200):**
```json
{
  "content": [
    {
      "id": "number",
      "name": "string",
      "description": "string",
      "address": "string",
      "city": "string",
      "state": "string",
      "country": "string",
      "latitude": "number",
      "longitude": "number",
      "phone": "string",
      "email": "string",
      "website": "string",
      "venueType": "INDOOR_FIELD|OUTDOOR_FIELD|COURT|POOL|GYM|TRACK|MULTI_PURPOSE|SPECIALIZED",
      "maxCapacity": "number",
      "minCapacity": "number",
      "basePricePerHour": "number",
      "status": "ACTIVE|INACTIVE|MAINTENANCE|TEMPORARILY_CLOSED|PERMANENTLY_CLOSED",
      "verified": "boolean",
      "rating": "number",
      "reviewCount": "number",
      "supportedSports": ["string"],
      "amenities": ["string"],
      "images": ["string"],
      "businessHours": {
        "monday": {"open": "string", "close": "string"},
        "tuesday": {"open": "string", "close": "string"}
        // ... other days
      },
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "totalElements": "number",
  "totalPages": "number",
  "number": "number",
  "size": "number"
}
```

#### GET `/venues/{id}`
Get detailed venue information.

#### POST `/venues`
Create a new venue (admin/venue owner only).

**Request:**
```json
{
  "name": "string",
  "description": "string",
  "address": "string",
  "city": "string",
  "state": "string", 
  "country": "string",
  "latitude": "number",
  "longitude": "number",
  "phone": "string",
  "email": "string",
  "website": "string",
  "venueType": "INDOOR_FIELD|OUTDOOR_FIELD|COURT|POOL|GYM|TRACK|MULTI_PURPOSE|SPECIALIZED",
  "maxCapacity": "number",
  "minCapacity": "number",
  "basePricePerHour": "number",
  "supportedSports": ["string"],
  "amenities": ["string"]
}
```

#### PUT `/venues/{id}`
Update venue information.

#### DELETE `/venues/{id}`
Delete venue.

### Venue Booking

#### GET `/venue-bookings`
Get user's venue bookings.

**Response (200):**
```json
[
  {
    "id": "number",
    "venue": {
      "id": "number",
      "name": "string",
      "address": "string"
    },
    "user": {
      "id": "number", 
      "username": "string"
    },
    "startTime": "string",
    "endTime": "string",
    "costPerPlayer": "number",
    "notes": "string",
    "status": "CONFIRMED|CANCELLED|COMPLETED",
    "paymentStatus": "PENDING|PAID|FAILED|REFUNDED",
    "totalCost": "number"
  }
]
```

#### POST `/venue-bookings`
Book a venue.

**Request:**
```json
{
  "venueId": "number",
  "startTime": "string",
  "endTime": "string", 
  "costPerPlayer": "number",
  "notes": "string"
}
```

#### GET `/venue-bookings/{id}`
Get booking details.

#### PUT `/venue-bookings/{id}/cancel`
Cancel a booking.

---

## 🏃 Sports Management APIs

#### GET `/api/v1/sports`
Get all active sports.

**Response (200):**
```json
[
  {
    "id": "number",
    "name": "string",
    "category": "TEAM_SPORT|INDIVIDUAL_SPORT|RACQUET_SPORT|WATER_SPORT|COMBAT_SPORT|EXTREME_SPORT|WINTER_SPORT",
    "description": "string",
    "minPlayers": "number",
    "maxPlayers": "number",
    "equipmentRequired": "string",
    "difficulty": "EASY|MODERATE|HARD",
    "physicalIntensity": "LOW|MEDIUM|HIGH|EXTREME",
    "skillCategories": ["string"],
    "popularityScore": "number",
    "active": "boolean"
  }
]
```

#### GET `/api/v1/sports/{id}`
Get sport by ID.

#### GET `/api/v1/sports/name/{name}`
Get sport by name.

#### GET `/api/v1/sports/category/{category}`
Get sports by category.

---

## 🤖 AI Recommendations APIs

### Comprehensive Recommendations

#### GET `/ai/recommendations/comprehensive`
Get personalized recommendations for games, players, and venues.

**Query Parameters:**
- `userId`: User ID (optional, defaults to current user)

**Response (200):**
```json
{
  "gameRecommendations": [
    {
      "game": {
        "id": "number",
        "sport": "string",
        "venue": {"id": "number", "name": "string"},
        "time": "string",
        "skillLevel": "string",
        "participants": "number",
        "maxParticipants": "number"
      },
      "algorithm": "COLLABORATIVE|CONTENT_BASED|HYBRID|CONTEXTUAL",
      "score": "number",
      "confidence": "number",
      "reasons": ["string"]
    }
  ],
  "playerRecommendations": [
    {
      "player": {
        "id": "number",
        "username": "string",
        "firstName": "string",
        "lastName": "string",
        "skillLevel": "string",
        "preferredSport": "string",
        "rating": "number"
      },
      "algorithm": "string",
      "score": "number",
      "reasons": ["string"]
    }
  ],
  "venueRecommendations": [
    {
      "venue": {
        "id": "number", 
        "name": "string",
        "address": "string",
        "supportedSports": ["string"],
        "rating": "number"
      },
      "algorithm": "string",
      "score": "number",
      "reasons": ["string"]
    }
  ]
}
```

#### GET `/ai/recommendations/games`
Get game recommendations only.

**Query Parameters:**
- `algorithm`: Algorithm type (optional)
- `limit`: Number of results (default: 10)

#### GET `/ai/recommendations/players`
Get player recommendations only.

#### GET `/ai/recommendations/venues`
Get venue recommendations only.

#### POST `/ai/recommendations/feedback`
Provide feedback on recommendations.

**Request:**
```json
{
  "recommendationType": "GAME|PLAYER|VENUE",
  "recommendedItemId": "number",
  "feedback": "POSITIVE|NEGATIVE|NEUTRAL",
  "reason": "string"
}
```

---

## 📊 User Dashboard APIs

#### GET `/api/dashboard/summary`
Get comprehensive user dashboard.

**Response (200):**
```json
{
  "userStats": {
    "gamesPlayed": "number",
    "gamesCreated": "number", 
    "totalDistance": "number",
    "favoritesSport": "string",
    "averageRating": "number"
  },
  "upcomingGames": [
    {
      "id": "number",
      "sport": "string",
      "time": "string",
      "venue": "string",
      "participants": "number"
    }
  ],
  "recentActivity": [
    {
      "type": "GAME_JOINED|GAME_CREATED|RSVP_CONFIRMED",
      "description": "string", 
      "timestamp": "string",
      "gameId": "number"
    }
  ],
  "achievements": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "progress": "number",
      "total": "number",
      "unlocked": "boolean"
    }
  ],
  "recommendations": {
    "games": ["game_object"],
    "players": ["player_object"],
    "venues": ["venue_object"]
  }
}
```

#### GET `/api/dashboard/game-history`
Get detailed game history with analytics.

**Query Parameters:**
- `page`, `size`, `sort`
- `sport`: Filter by sport
- `timeRange`: Time period filter

#### GET `/api/dashboard/performance-metrics`
Get user performance analytics.

#### GET `/api/dashboard/achievement-progress`
Get achievement progress details.

---

## 🔍 Additional Search & Discovery APIs

### Global Search

#### GET `/search/games`
Global search for games across all data.

**Query Parameters:**
- `sport`: Sport filter
- `skillLevel`: Skill level filter  
- `fromDate`: Start date filter
- `toDate`: End date filter
- `lat`: Latitude for proximity search
- `lng`: Longitude for proximity search
- `radiusKm`: Search radius

#### GET `/search/users`
Search for players/users.

#### GET `/search/filters`
Get available search filter options.

### Statistics & Analytics

#### GET `/stats/games/overview`
Game statistics overview.

#### GET `/stats/users/me`
Current user statistics.

#### GET `/stats/users/{userId}`
Specific user statistics.

#### GET `/stats/dashboard`
Statistics dashboard.

---

## 💬 Chat & Messaging APIs

### Game Chat

#### GET `/games/{id}/chat/history`
Get chat history for a game.

**Query Parameters:**
- `page`: Page number
- `size`: Messages per page
- `since`: Get messages since timestamp

**Response (200):**
```json
{
  "messages": [
    {
      "id": "number",
      "gameId": "number",
      "user": {
        "id": "number",
        "username": "string",
        "firstName": "string"
      },
      "message": "string",
      "timestamp": "string",
      "edited": "boolean",
      "editedAt": "string"
    }
  ],
  "totalElements": "number",
  "hasMore": "boolean"
}
```

#### POST `/games/{id}/chat/messages`
Send chat message.

**Request:**
```json
{
  "message": "string"
}
```

### WebSocket Chat Endpoints

**Connect:** `/ws` (with JWT token authentication)

**Subscribe to game chat:** `/topic/games/{gameId}/chat`

**Send chat message:** `/app/games/{gameId}/chat`

**Chat message format:**
```json
{
  "user": {
    "id": "number",
    "username": "string"
  },
  "message": "string",
  "timestamp": "string",
  "type": "CHAT|SYSTEM|ANNOUNCEMENT"
}
```

---

## 🔔 Notifications APIs

#### GET `/notifications`
Get user notifications.

**Query Parameters:**
- `read`: Filter by read status (true/false)
- `page`, `size`

**Response (200):**
```json
{
  "content": [
    {
      "id": "number",
      "title": "string",
      "message": "string",
      "type": "GAME_INVITATION|BOOKING_CONFIRMATION|RECOMMENDATION|SYSTEM_ALERT",
      "priority": "LOW|NORMAL|HIGH|URGENT",
      "read": "boolean",
      "imageUrl": "string",
      "clickUrl": "string",
      "actions": [
        {
          "label": "string",
          "url": "string",
          "style": "PRIMARY|SECONDARY|DANGER"
        }
      ],
      "metadata": "object",
      "createdAt": "string"
    }
  ],
  "totalElements": "number"
}
```

#### GET `/notifications/unread-count`
Get unread notification count.

**Response (200):**
```json
{
  "count": "number"
}
```

#### POST `/notifications/mark-read`
Mark notifications as read.

**Request:**
```json
{
  "ids": ["number"]
}
```

#### PUT `/notifications/mark-all-read`
Mark all notifications as read.

### WebSocket Notifications

**Subscribe:** `/user/queue/notifications`

**Notification format:**
```json
{
  "id": "number",
  "type": "notification", 
  "eventType": "CREATED|UPDATED|DELETED",
  "title": "string",
  "message": "string",
  "priority": "string",
  "imageUrl": "string",
  "clickUrl": "string",
  "actions": ["object"],
  "metadata": "object",
  "timestamp": "number"
}
```

---

## 📈 Analytics & Monitoring APIs

### User Analytics

#### GET `/ai/analytics/user-behavior/{userId}`
Get user behavior analysis.

**Response (200):**
```json
{
  "userId": "number",
  "preferredSports": ["string"],
  "preferredTimeSlots": ["string"], 
  "skillLevelProgression": {
    "current": "string",
    "trend": "IMPROVING|STABLE|DECLINING",
    "progressRate": "number"
  },
  "activityLevel": "HIGH|MEDIUM|LOW",
  "socialConnections": "number",
  "averageGameDuration": "number",
  "predictionAccuracy": "number",
  "engagementMetrics": {
    "gamesPerWeek": "number",
    "chatActivity": "number",
    "rsvpSuccessRate": "number"
  }
}
```

### Demand Forecasting

#### GET `/ai/analytics/demand-forecast`
Get demand predictions.

**Query Parameters:**
- `sport`: Sport filter (optional)
- `venueId`: Venue filter (optional)
- `timeRange`: NEXT_WEEK|NEXT_MONTH

**Response (200):**
```json
{
  "forecasts": [
    {
      "date": "string",
      "sport": "string",
      "venueId": "number",
      "predictedDemand": "number",
      "confidence": "number",
      "factors": ["string"],
      "recommendations": ["string"]
    }
  ],
  "accuracy": "number",
  "lastUpdated": "string"
}
```

#### GET `/ai/analytics/trends`
Get trend analysis.

**Response (200):**
```json
{
  "sportPopularity": [
    {
      "sport": "string",
      "trend": "RISING|FALLING|STABLE",
      "growthRate": "number", 
      "currentPopularity": "number",
      "seasonalFactors": ["string"]
    }
  ],
  "timeSlotPopularity": [
    {
      "timeSlot": "string",
      "popularity": "number",
      "trend": "string"
    }
  ],
  "venueUtilization": [
    {
      "venueId": "number",
      "venueName": "string",
      "utilizationRate": "number",
      "trend": "string"
    }
  ],
  "geographicTrends": [
    {
      "region": "string",
      "growth": "number",
      "popularSports": ["string"]
    }
  ]
}
```

### ML Model Management

#### GET `/ai/ml/models`
Get ML model status.

**Response (200):**
```json
[
  {
    "id": "string",
    "name": "string",
    "type": "COLLABORATIVE_FILTERING|CONTENT_BASED|NEURAL_NETWORK|HYBRID",
    "version": "string",
    "status": "TRAINING|ACTIVE|DEPRECATED|FAILED",
    "accuracy": "number",
    "lastTrained": "string",
    "performance": {
      "precision": "number",
      "recall": "number", 
      "f1Score": "number",
      "trainingTime": "number"
    },
    "hyperparameters": "object"
  }
]
```

#### POST `/ai/ml/models/{modelId}/train`
Trigger model training.

---

## ⚡ System Performance & Monitoring APIs

### System Health

#### GET `/api/v1/system/health`
Get comprehensive system health.

**Response (200):**
```json
{
  "performance": {
    "status": "HEALTHY|DEGRADED|CRITICAL",
    "cacheHitRate": "number",
    "connectionUtilization": "number",
    "averageResponseTime": "number"
  },
  "loadBalancing": {
    "status": "HEALTHY|UNHEALTHY", 
    "healthyServers": "number",
    "totalServers": "number",
    "currentLoad": "number",
    "strategy": "ROUND_ROBIN|LEAST_CONNECTIONS|WEIGHTED|IP_HASH"
  },
  "monitoring": {
    "status": "HEALTHY|DEGRADED|CRITICAL",
    "lastHealthCheck": "string",
    "activeAlerts": "number",
    "uptime": "number"
  },
  "database": {
    "status": "HEALTHY|DEGRADED|DOWN",
    "connectionCount": "number",
    "queryPerformance": "number"
  },
  "redis": {
    "status": "HEALTHY|DEGRADED|DOWN",
    "memory": "number",
    "connectedClients": "number"
  },
  "system": {
    "status": "HEALTHY",
    "timestamp": "number",
    "version": "string"
  }
}
```

#### GET `/api/v1/system/performance/metrics`
Get detailed performance metrics.

#### POST `/api/v1/system/optimize`
Trigger system optimization.

**Response (200):**
```json
{
  "cache": {
    "optimizations": ["string"],
    "improvementPotential": "number"
  },
  "connectionPool": {
    "optimizations": ["string"],
    "recommendedSettings": "object"
  },
  "queries": {
    "slowQueries": ["string"],
    "optimizations": ["string"]
  },
  "scaling": {
    "action": "SCALE_UP|SCALE_DOWN|MAINTAIN",
    "currentInstances": "number",
    "recommendedInstances": "number"
  }
}
```

### System Dashboard

#### GET `/api/v1/system/dashboard`
Get system overview dashboard.

**Response (200):**
```json
{
  "overview": {
    "totalUsers": "number",
    "activeGames": "number",
    "totalVenues": "number",
    "systemLoad": "number"
  },
  "performance": {
    "cacheHitRate": "number",
    "connectionUtilization": "number",
    "queryPerformance": "number",
    "averageResponseTime": "number"
  },
  "loadBalancing": {
    "strategy": "string",
    "healthyServers": "number",
    "totalServers": "number",
    "currentLoad": "number"
  },
  "monitoring": {
    "systemStatus": "string",
    "activeAlerts": "number",
    "lastHealthCheck": "string"
  },
  "realtimeMetrics": {
    "activeConnections": "number",
    "messagesPerSecond": "number",
    "subscriptionCount": "number"
  }
}
```

---

## 🔍 Search & Discovery APIs

### Global Search

#### GET `/search/games`
Search games with comprehensive filters.

**Query Parameters:**
- `sport`: Sport filter
- `skillLevel`: Skill level filter
- `fromDate`: Start date filter
- `toDate`: End date filter  
- `lat`: Latitude for proximity search
- `lng`: Longitude for proximity search
- `radiusKm`: Search radius in kilometers

#### GET `/search/venues` 
Search venues.

#### GET `/search/users`
Search users/players.

### Spatial Queries

#### GET `/games/nearby`
Find nearby games using spatial queries.

**Query Parameters:**
- `lat`: Latitude (required)
- `lon`: Longitude (required)
- `radiusKm`: Radius (default: 5)
- `page`, `size`, `sort`

---

## 💳 Payment & Financial APIs

### Payment Processing

#### POST `/payments/process`
Process game or venue payment.

**Request:**
```json
{
  "type": "GAME_RSVP|VENUE_BOOKING",
  "itemId": "number",
  "amount": "number",
  "currency": "string",
  "paymentMethod": "object"
}
```

#### GET `/payments/history`
Get payment history.

#### GET `/payments/status/{paymentId}`
Get payment status.

---

## 🏆 Achievements & Gamification APIs

#### GET `/achievements`
Get user achievements.

#### GET `/achievements/progress`
Get achievement progress.

#### POST `/achievements/{id}/claim`
Claim achievement reward.

---

## 🛡️ Admin APIs

### Admin Dashboard

#### GET `/admin/dashboard`
Get admin overview (ROLE_ADMIN required).

#### GET `/admin/users`
Get user management interface.

#### GET `/admin/games`
Get game moderation interface.

#### GET `/admin/system/metrics`
Get detailed system metrics.

### Moderation

#### GET `/admin/moderation`
Get moderation settings.

#### POST `/admin/moderation/words`
Update profanity filter words.

#### POST `/admin/moderation/toggle`
Toggle moderation features.

---

## 📱 Real-time Features (WebSocket)

### Connection
- **Endpoint:** `/ws`
- **Authentication:** JWT token via query parameter or header
- **Protocol:** STOMP over WebSocket with SockJS fallback

### Subscriptions

#### Game Updates
- **Topic:** `/topic/games/{gameId}`
- **Events:** Player joins/leaves, game updates, status changes

#### Chat Messages  
- **Topic:** `/topic/games/{gameId}/chat`
- **Send:** `/app/games/{gameId}/chat`

#### Personal Notifications
- **Topic:** `/user/queue/notifications`
- **Events:** New notifications, game invitations

#### User Presence
- **Topic:** `/topic/user/{userId}/presence`
- **Events:** Online/offline status, current activity

#### Real-time Game Subscriptions
- **Subscribe:** `/app/realtime/games/{gameId}/subscribe`
- **Unsubscribe:** `/app/realtime/games/{gameId}/unsubscribe`

### Event Types
```json
{
  "type": "GAME_UPDATE|CHAT_MESSAGE|NOTIFICATION|PRESENCE|SYSTEM_ALERT",
  "data": "object",
  "timestamp": "string",
  "source": "string"
}
```

---

## 📊 Data Models

### Core Entities

#### User
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PRO';
  preferredSport: string;
  location: string;
  latitude: number;
  longitude: number;
  phone: string;
  age: number;
  avatarUrl: string;
  rating: number;
  ratingCount: number;
  verified: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}
```

#### Game
```typescript
interface Game {
  id: number;
  sport: string;
  location: string;
  time: string;
  skillLevel: string;
  latitude: number;
  longitude: number;
  venue?: Venue;
  gameType: 'PICKUP' | 'TOURNAMENT' | 'LEAGUE' | 'TRAINING' | 'SOCIAL' | 'COMPETITIVE';
  description: string;
  minPlayers: number;
  maxPlayers: number;
  currentParticipants: number;
  pricePerPlayer: number;
  totalCost: number;
  durationMinutes: number;
  status: 'DRAFT' | 'PUBLISHED' | 'FULL' | 'CANCELLED' | 'COMPLETED' | 'ARCHIVED';
  creator: User;
  participants: User[];
  rsvpCutoff: string;
  capacity: number;
  waitlistEnabled: boolean;
  weatherDependent: boolean;
  equipmentProvided: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### Venue
```typescript
interface Venue {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string;
  venueType: 'INDOOR_FIELD' | 'OUTDOOR_FIELD' | 'COURT' | 'POOL' | 'GYM' | 'TRACK' | 'MULTI_PURPOSE' | 'SPECIALIZED';
  maxCapacity: number;
  minCapacity: number;
  basePricePerHour: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'TEMPORARILY_CLOSED' | 'PERMANENTLY_CLOSED';
  verified: boolean;
  rating: number;
  reviewCount: number;
  supportedSports: string[];
  amenities: string[];
  images: string[];
  businessHours: BusinessHours;
  createdAt: string;
  updatedAt: string;
}
```

#### Sport
```typescript
interface Sport {
  id: number;
  name: string;
  category: 'TEAM_SPORT' | 'INDIVIDUAL_SPORT' | 'RACQUET_SPORT' | 'WATER_SPORT' | 'COMBAT_SPORT' | 'EXTREME_SPORT' | 'WINTER_SPORT';
  description: string;
  minPlayers: number;
  maxPlayers: number;
  equipmentRequired: string;
  difficulty: 'EASY' | 'MODERATE' | 'HARD';
  physicalIntensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  skillCategories: string[];
  popularityScore: number;
  active: boolean;
}
```

#### Notification
```typescript
interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'GAME_INVITATION' | 'BOOKING_CONFIRMATION' | 'RECOMMENDATION' | 'SYSTEM_ALERT';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  read: boolean;
  imageUrl?: string;
  clickUrl?: string;
  actions: NotificationAction[];
  metadata: object;
  createdAt: string;
}

interface NotificationAction {
  label: string;
  url: string;
  style: 'PRIMARY' | 'SECONDARY' | 'DANGER';
}
```

---

## ❌ Error Handling

### Standard Error Response
```json
{
  "timestamp": "string",
  "status": "number",
  "error": "string", 
  "message": "string",
  "path": "string",
  "requestId": "string"
}
```

### Validation Error Response
```json
{
  "timestamp": "string",
  "status": 400,
  "error": "Validation Failed",
  "message": "string",
  "path": "string",
  "validationErrors": [
    {
      "field": "string",
      "message": "string",
      "rejectedValue": "any"
    }
  ]
}
```

### HTTP Status Codes
- **200 OK** - Successful GET, PUT
- **201 Created** - Successful POST
- **204 No Content** - Successful DELETE
- **400 Bad Request** - Validation errors, malformed request
- **401 Unauthorized** - Authentication required/failed
- **403 Forbidden** - Access denied, insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource conflict (e.g., game full)
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error

---

## 📊 Special Features

### Rate Limiting
- Most endpoints have rate limiting
- Different limits for different endpoint types
- Rate limit headers returned: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Caching
- ETags and Last-Modified headers for cache validation
- Cache-Control headers for client-side caching
- Redis-based server-side caching

### Pagination
- Standard Spring Boot pagination
- Default page size: 10
- Maximum page size: 50
- Sort support on most list endpoints

### Idempotency
- POST endpoints support `Idempotency-Key` header
- Prevents duplicate operations

### Spatial Queries
- Location-based search and filtering
- Distance calculations
- Proximity-based recommendations

---

## 🎯 Frontend Integration Guidelines

### Authentication Setup
1. Store JWT tokens securely (localStorage/sessionStorage)
2. Include Bearer token in all authenticated requests  
3. Implement token refresh logic
4. Handle 401 responses with automatic logout

### WebSocket Integration
1. Connect to `/ws` with JWT authentication
2. Subscribe to relevant topics based on user context
3. Handle connection failures and reconnection
4. Implement presence management

### Error Handling
1. Parse structured error responses
2. Show user-friendly error messages
3. Handle validation errors per field
4. Implement retry logic for transient failures

### Real-time Features
1. Subscribe to game updates for games user is interested in
2. Implement chat functionality with real-time messaging
3. Show live notification badges and updates
4. Display user presence information

### Performance Optimization
1. Use ETags for cache validation
2. Implement pagination for large lists
3. Lazy load non-critical data
4. Batch API calls where possible

---

## 🔧 Development & Testing

### Local Development
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- API Docs: http://localhost:8080/v3/api-docs
- Health Check: http://localhost:8080/actuator/health

### Environment Variables for Frontend
```env
# API Configuration  
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_WS_URL=ws://localhost:8080/ws
REACT_APP_API_TIMEOUT=30000

# Authentication
REACT_APP_JWT_STORAGE_KEY=pickup_sports_token
REACT_APP_USER_STORAGE_KEY=pickup_sports_user

# Features
REACT_APP_ENABLE_WEBSOCKET=true
REACT_APP_ENABLE_AI_RECOMMENDATIONS=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_PUSH_NOTIFICATIONS=true

# Maps Integration
REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here

# Real-time Features
REACT_APP_ENABLE_CHAT=true
REACT_APP_ENABLE_PRESENCE=true
```

### API Testing
- Use Postman collections in `/docs/postman/`
- Curl examples in `/docs/CurlExamples.md`
- Comprehensive test data available via seed scripts

---

## 📱 Mobile App Considerations

### iOS App Specific
- Use URLSession for HTTP requests
- Implement WebSocket using URLSessionWebSocketTask
- Handle background app states for WebSocket connections
- Use UserNotifications framework for push notifications

### Android App Specific  
- Use Retrofit for HTTP requests
- Implement WebSocket using OkHttp
- Handle WebSocket reconnection on network changes
- Use Firebase Cloud Messaging for push notifications

### Offline Support
- Cache critical data locally
- Implement offline-first patterns where possible
- Sync data when connection restored
- Show offline indicators

---

## 🚀 Advanced Features

### AI & Machine Learning
- Personalized game recommendations
- Player matching algorithms
- Demand forecasting
- Trend analysis
- Performance predictions

### Real-time Capabilities
- Live chat in games
- Real-time game updates
- User presence tracking
- Instant notifications
- Live dashboard updates

### Analytics & Intelligence
- User behavior tracking
- Game performance analytics
- Venue utilization metrics
- Revenue analytics
- Engagement metrics

### Enterprise Features
- Multi-tenancy support
- Advanced monitoring
- Performance optimization
- Load balancing
- System health monitoring

---

This specification provides everything needed to build a comprehensive frontend that leverages all the powerful backend capabilities. The backend is production-ready with enterprise-grade features including AI recommendations, real-time communications, advanced analytics, and robust monitoring.

**Start with authentication, then game management, and progressively add advanced features!** 🚀