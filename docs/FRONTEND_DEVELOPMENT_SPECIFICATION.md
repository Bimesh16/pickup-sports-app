# 📋 Complete Backend API Specification for Pickup Sports App Frontend

## 🏗️ Backend Architecture Overview

Your backend provides a comprehensive set of APIs across multiple domains:

- **Authentication & User Management**
- **Game Management**
- **Venue Management** 
- **AI Recommendations & Analytics**
- **Performance Monitoring**
- **System Optimization**

## 🔐 Authentication & Authorization

### Base URL: http://localhost:8080

### Authentication Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Security Context
- All endpoints (except login/register) require authentication
- JWT tokens expire and need refresh
- Role-based access control implemented

## 📊 Complete API Endpoints Specification

### 1. Authentication APIs

#### POST /api/v1/auth/login
Request Body:
{
  "username": "string",
  "password": "string"
}

Response:
{
  "token": "jwt_token_string",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "skillLevel": "BEGINNER|INTERMEDIATE|ADVANCED"
  }
}

#### POST /api/v1/auth/register
Request Body:
{
  "username": "string",
  "email": "string", 
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "skillLevel": "BEGINNER|INTERMEDIATE|ADVANCED"
}

### 2. User Management APIs

#### GET /api/v1/users/profile
Response:
{
  "id": "number",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "skillLevel": "BEGINNER|INTERMEDIATE|ADVANCED",
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z"
}

#### PUT /api/v1/users/profile
Request Body:
{
  "firstName": "string",
  "lastName": "string",
  "skillLevel": "BEGINNER|INTERMEDIATE|ADVANCED"
}

#### GET /api/v1/users
Response:
[
  {
    "id": "number",
    "username": "string",
    "firstName": "string",
    "lastName": "string",
    "skillLevel": "BEGINNER|INTERMEDIATE|ADVANCED"
  }
]

### 3. Game Management APIs

#### GET /api/v1/games
Query Parameters:
- sport: string (optional)
- skillLevel: string (optional)
- venueId: number (optional)
- startDate: string (optional)
- endDate: string (optional)
- page: number (default: 0)
- size: number (default: 10)

Response:
{
  "content": [
    {
      "id": "number",
      "sport": "string",
      "venue": {
        "id": "number",
        "name": "string",
        "address": "string",
        "latitude": "number",
        "longitude": "number"
      },
      "time": "2024-01-01T10:00:00Z",
      "maxParticipants": "number",
      "currentParticipants": "number",
      "skillLevel": "BEGINNER|INTERMEDIATE|ADVANCED",
      "description": "string",
      "status": "SCHEDULED|ACTIVE|COMPLETED|CANCELLED",
      "creator": {
        "id": "number",
        "username": "string",
        "firstName": "string",
        "lastName": "string"
      },
      "participants": [
        {
          "id": "number",
          "username": "string",
          "firstName": "string",
          "lastName": "string",
          "skillLevel": "string"
        }
      ]
    }
  ],
  "totalElements": "number",
  "totalPages": "number",
  "number": "number",
  "size": "number"
}

#### POST /api/v1/games
Request Body:
{
  "sport": "string",
  "venueId": "number",
  "time": "2024-01-01T10:00:00Z",
  "maxParticipants": "number",
  "skillLevel": "BEGINNER|INTERMEDIATE|ADVANCED",
  "description": "string"
}

#### GET /api/v1/games/{id}
Response: Same as individual game object above

#### PUT /api/v1/games/{id}
Request Body: Same as POST /api/v1/games

#### DELETE /api/v1/games/{id}

#### POST /api/v1/games/{id}/join

#### POST /api/v1/games/{id}/leave

#### GET /api/v1/games/my-games
Response: Same structure as GET /api/v1/games

### 4. Venue Management APIs

#### GET /api/v1/venues
Query Parameters:
- name: string (optional)
- city: string (optional)
- sport: string (optional)
- page: number (default: 0)
- size: number (default: 10)

Response:
{
  "content": [
    {
      "id": "number",
      "name": "string",
      "description": "string",
      "address": "string",
      "city": "string",
      "latitude": "number",
      "longitude": "number",
      "phone": "string",
      "email": "string",
      "website": "string",
      "amenities": ["string"],
      "sports": ["string"],
      "pricePerHour": "number",
      "capacity": "number",
      "rating": "number",
      "images": ["string"]
    }
  ],
  "totalElements": "number",
  "totalPages": "number"
}

#### POST /api/v1/venues
Request Body:
{
  "name": "string",
  "description": "string",
  "address": "string",
  "city": "string",
  "latitude": "number",
  "longitude": "number",
  "phone": "string",
  "email": "string",
  "website": "string",
  "amenities": ["string"],
  "sports": ["string"],
  "pricePerHour": "number",
  "capacity": "number"
}

#### GET /api/v1/venues/{id}
#### PUT /api/v1/venues/{id}
#### DELETE /api/v1/venues/{id}

### 5. Venue Booking APIs

#### GET /api/v1/venue-bookings
Response:
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
      "username": "string",
      "firstName": "string",
      "lastName": "string"
    },
    "startTime": "2024-01-01T10:00:00Z",
    "endTime": "2024-01-01T12:00:00Z",
    "purpose": "string",
    "participants": "number",
    "totalPrice": "number",
    "paymentStatus": "PENDING|PAID|FAILED|REFUNDED",
    "status": "CONFIRMED|CANCELLED|COMPLETED"
  }
]

#### POST /api/v1/venue-bookings
Request Body:
{
  "venueId": "number",
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-01T12:00:00Z",
  "purpose": "string",
  "participants": "number"
}

#### GET /api/v1/venue-bookings/{id}
#### PUT /api/v1/venue-bookings/{id}/cancel

### 6. AI Recommendations APIs

#### GET /api/v1/ai/recommendations/comprehensive
Query Parameters:
- userId: number (optional, defaults to current user)

Response:
{
  "gameRecommendations": [
    {
      "game": {
        "id": "number",
        "sport": "string",
        "venue": {...},
        "time": "2024-01-01T10:00:00Z",
        "skillLevel": "string"
      },
      "algorithm": "COLLABORATIVE|CONTENT_BASED|HYBRID",
      "score": "number",
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
        "skillLevel": "string"
      },
      "algorithm": "COLLABORATIVE|CONTENT_BASED|HYBRID",
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
        "sports": ["string"]
      },
      "algorithm": "COLLABORATIVE|CONTENT_BASED|HYBRID",
      "score": "number",
      "reasons": ["string"]
    }
  ]
}

#### GET /api/v1/ai/recommendations/games
Query Parameters:
- algorithm: string (COLLABORATIVE|CONTENT_BASED|HYBRID|CONTEXTUAL)
- limit: number (default: 10)

Response:
[
  {
    "game": {...},
    "algorithm": "string",
    "score": "number",
    "reasons": ["string"]
  }
]

#### GET /api/v1/ai/recommendations/players
#### GET /api/v1/ai/recommendations/venues

#### POST /api/v1/ai/recommendations/feedback
Request Body:
{
  "recommendationType": "GAME|PLAYER|VENUE",
  "recommendedItemId": "number",
  "feedback": "POSITIVE|NEGATIVE",
  "reason": "string"
}

### 7. Advanced Analytics APIs

#### GET /api/v1/ai/analytics/user-behavior/{userId}
Response:
{
  "userId": "number",
  "preferredSports": ["string"],
  "preferredTimeSlots": ["string"],
  "skillLevelProgression": {
    "current": "string",
    "trend": "IMPROVING|STABLE|DECLINING"
  },
  "activityLevel": "HIGH|MEDIUM|LOW",
  "socialConnections": "number",
  "averageGameDuration": "number",
  "predictionAccuracy": "number"
}

#### GET /api/v1/ai/analytics/demand-forecast
Query Parameters:
- sport: string (optional)
- venueId: number (optional)
- timeRange: string (NEXT_WEEK|NEXT_MONTH)

Response:
{
  "forecasts": [
    {
      "date": "2024-01-01",
      "sport": "string",
      "venueId": "number",
      "predictedDemand": "number",
      "confidence": "number",
      "factors": ["string"]
    }
  ],
  "accuracy": "number",
  "lastUpdated": "2024-01-01T10:00:00Z"
}

#### GET /api/v1/ai/analytics/trends
Response:
{
  "sportPopularity": [
    {
      "sport": "string",
      "trend": "RISING|FALLING|STABLE",
      "growthRate": "number",
      "currentPopularity": "number"
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
  ]
}

#### GET /api/v1/ai/analytics/game-optimization
Response:
{
  "recommendations": [
    {
      "type": "SCHEDULE_OPTIMIZATION|SKILL_MATCHING|VENUE_SELECTION",
      "description": "string",
      "impact": "HIGH|MEDIUM|LOW",
      "implementation": "string"
    }
  ],
  "optimizationScore": "number",
  "potentialImprovements": {
    "participationRate": "number",
    "userSatisfaction": "number",
    "venueUtilization": "number"
  }
}

### 8. ML Model Training APIs

#### GET /api/v1/ai/ml/models
Response:
[
  {
    "id": "string",
    "name": "string",
    "type": "COLLABORATIVE_FILTERING|CONTENT_BASED|NEURAL_NETWORK",
    "version": "string",
    "status": "TRAINING|ACTIVE|DEPRECATED",
    "accuracy": "number",
    "lastTrained": "2024-01-01T10:00:00Z",
    "performance": {
      "precision": "number",
      "recall": "number",
      "f1Score": "number"
    }
  }
]

#### POST /api/v1/ai/ml/models/{modelId}/train
Request Body:
{
  "hyperparameters": {
    "learningRate": "number",
    "epochs": "number",
    "batchSize": "number"
  },
  "trainingData": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}

#### GET /api/v1/ai/ml/ab-testing/experiments
Response:
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "status": "RUNNING|COMPLETED|STOPPED",
    "variants": [
      {
        "name": "string",
        "trafficPercentage": "number",
        "performance": {
          "conversions": "number",
          "clickThroughRate": "number",
          "userSatisfaction": "number"
        }
      }
    ],
    "startDate": "2024-01-01T10:00:00Z",
    "endDate": "2024-01-31T10:00:00Z"
  }
]

### 9. Performance Monitoring APIs

#### GET /api/v1/ai/monitoring/dashboard
Response:
{
  "systemOverview": {
    "totalRecommendations": "number",
    "successRate": "number",
    "averageResponseTime": "number",
    "activeUsers": "number"
  },
  "algorithmPerformance": [
    {
      "algorithm": "string",
      "accuracy": "number",
      "responseTime": "number",
      "usage": "number"
    }
  ],
  "userEngagement": {
    "clickThroughRate": "number",
    "conversionRate": "number",
    "userSatisfaction": "number"
  },
  "systemHealth": {
    "status": "HEALTHY|DEGRADED|CRITICAL",
    "uptime": "number",
    "errorRate": "number"
  }
}

#### GET /api/v1/ai/monitoring/performance
Query Parameters:
- timeRange: string (LAST_HOUR|LAST_DAY|LAST_WEEK|LAST_MONTH)
- algorithm: string (optional)

Response:
{
  "metrics": [
    {
      "timestamp": "2024-01-01T10:00:00Z",
      "responseTime": "number",
      "accuracy": "number",
      "throughput": "number",
      "errorRate": "number"
    }
  ],
  "aggregates": {
    "averageResponseTime": "number",
    "totalRequests": "number",
    "successRate": "number"
  }
}

### 10. System Optimization APIs

#### GET /api/v1/system/dashboard
Response:
{
  "performance": {
    "cacheHitRate": "number",
    "connectionUtilization": "number",
    "queryPerformance": "number",
    "systemLoad": "number"
  },
  "loadBalancing": {
    "strategy": "ROUND_ROBIN|LEAST_CONNECTIONS|WEIGHTED|IP_HASH",
    "healthyServers": "number",
    "totalServers": "number",
    "currentLoad": "number"
  },
  "monitoring": {
    "systemStatus": "HEALTHY|DEGRADED|CRITICAL",
    "activeAlerts": "number",
    "lastHealthCheck": "2024-01-01T10:00:00Z"
  },
  "optimization": {
    "cacheOptimization": {...},
    "connectionOptimization": {...},
    "queryOptimization": {...}
  }
}

#### GET /api/v1/system/health
Response:
{
  "performance": {
    "status": "healthy|degraded",
    "cacheHitRate": "number",
    "connectionUtilization": "number"
  },
  "loadBalancing": {
    "status": "healthy|unhealthy",
    "healthyServers": "number",
    "overallSuccessRate": "number"
  },
  "monitoring": {
    "status": "healthy|degraded|critical",
    "lastHealthCheck": "2024-01-01T10:00:00Z",
    "activeAlerts": "number"
  },
  "system": {
    "status": "healthy",
    "timestamp": "number",
    "version": "5B.1.0"
  }
}

#### POST /api/v1/system/optimize
Response:
{
  "cache": {
    "optimizations": ["string"],
    "improvementPotential": "number"
  },
  "connectionPool": {
    "optimizations": ["string"],
    "recommendedSettings": {...}
  },
  "queries": {
    "slowQueries": ["string"],
    "optimizations": ["string"]
  },
  "scaling": {
    "action": "SCALE_UP|SCALE_DOWN|MAINTAIN",
    "currentInstances": "number",
    "recommendedInstances": "number"
  },
  "healthCheck": {
    "overall": "HEALTHY|DEGRADED|CRITICAL",
    "details": {...}
  }
}

## 📋 Data Models

### User Model
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  createdAt: string;
  updatedAt: string;
}
```

### Game Model
```typescript
interface Game {
  id: number;
  sport: string;
  venue: Venue;
  time: string;
  maxParticipants: number;
  currentParticipants: number;
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  description: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  creator: User;
  participants: User[];
}
```

### Venue Model
```typescript
interface Venue {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string;
  amenities: string[];
  sports: string[];
  pricePerHour: number;
  capacity: number;
  rating: number;
  images: string[];
}
```

### Venue Booking Model
```typescript
interface VenueBooking {
  id: number;
  venue: Venue;
  user: User;
  startTime: string;
  endTime: string;
  purpose: string;
  participants: number;
  totalPrice: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}
```

### Recommendation Model
```typescript
interface Recommendation<T> {
  item: T;
  algorithm: 'COLLABORATIVE' | 'CONTENT_BASED' | 'HYBRID' | 'CONTEXTUAL';
  score: number;
  reasons: string[];
}

interface GameRecommendation {
  game: Game;
  algorithm: string;
  score: number;
  reasons: string[];
}

interface PlayerRecommendation {
  player: User;
  algorithm: string;
  score: number;
  reasons: string[];
}

interface VenueRecommendation {
  venue: Venue;
  algorithm: string;
  score: number;
  reasons: string[];
}
```

### Analytics Models
```typescript
interface UserBehaviorAnalysis {
  userId: number;
  preferredSports: string[];
  preferredTimeSlots: string[];
  skillLevelProgression: {
    current: string;
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  };
  activityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  socialConnections: number;
  averageGameDuration: number;
  predictionAccuracy: number;
}

interface DemandForecast {
  date: string;
  sport: string;
  venueId: number;
  predictedDemand: number;
  confidence: number;
  factors: string[];
}

interface TrendAnalysis {
  sportPopularity: Array<{
    sport: string;
    trend: 'RISING' | 'FALLING' | 'STABLE';
    growthRate: number;
    currentPopularity: number;
  }>;
  timeSlotPopularity: Array<{
    timeSlot: string;
    popularity: number;
    trend: string;
  }>;
  venueUtilization: Array<{
    venueId: number;
    venueName: string;
    utilizationRate: number;
    trend: string;
  }>;
}
```

## 🔧 Frontend Technology Stack Recommendations

### React Web App
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "typescript": "^4.9.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "axios": "^1.3.0",
    "@tanstack/react-query": "^4.20.0",
    "react-hook-form": "^7.43.0",
    "react-hot-toast": "^2.4.0",
    "framer-motion": "^10.0.0",
    "tailwindcss": "^3.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "lucide-react": "^0.263.0",
    "date-fns": "^2.29.0",
    "react-datepicker": "^4.8.0",
    "react-select": "^5.7.0",
    "recharts": "^2.5.0",
    "@googlemaps/react-wrapper": "^1.1.35"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^3.1.0",
    "vite": "^4.1.0",
    "eslint": "^8.34.0",
    "prettier": "^2.8.0"
  }
}
```

### iOS App (Swift)
- **SwiftUI** for modern UI development
- **Combine** for reactive programming
- **Core Data** for local storage
- **URLSession** for networking
- **MapKit** for venue mapping
- **UserNotifications** for push notifications

## �� Environment Variables

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_API_TIMEOUT=30000

# Authentication
REACT_APP_JWT_STORAGE_KEY=pickup_sports_token
REACT_APP_USER_STORAGE_KEY=pickup_sports_user

# Features
REACT_APP_ENABLE_AI_RECOMMENDATIONS=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_SYSTEM_MONITORING=true

# Maps (if using Google Maps)
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here

# Push Notifications
REACT_APP_VAPID_PUBLIC_KEY=your_vapid_key_here
```

## 📨 Error Handling

### Standard Error Response
```json
{
  "timestamp": "2024-01-01T10:00:00Z",
  "status": "number",
  "error": "string",
  "message": "string",
  "path": "string"
}
```

### Validation Error Response
```json
{
  "timestamp": "2024-01-01T10:00:00Z",
  "status": 400,
  "error": "Validation Failed",
  "message": "Invalid input",
  "path": "/api/v1/games",
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
- **400 Bad Request** - Validation errors
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Access denied
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

## 📱 Key Frontend Features to Implement

### 1. Authentication Flow
- Login/Register forms
- JWT token management
- Protected routes
- Auto logout on token expiry

### 2. Dashboard
- User overview
- Recommended games/players/venues
- Recent activity
- System health status (for admins)

### 3. Game Management
- Browse available games
- Create new games
- Join/leave games
- Game details view
- My games list

### 4. Venue Management
- Browse venues
- Venue details with maps
- Book venues
- My bookings

### 5. AI Recommendations
- Personalized game recommendations
- Player suggestions
- Venue recommendations
- Feedback system

### 6. Analytics Dashboard
- User behavior insights
- Demand forecasts
- Trend analysis
- Performance metrics

### 7. System Monitoring (Admin)
- System health overview
- Performance metrics
- Load balancing status
- Optimization controls

## 🔔 Push Notifications

### Notification Types
- **Game Invitations** - When invited to join a game
- **Booking Confirmations** - Venue booking confirmations
- **AI Recommendations** - New personalized recommendations
- **Game Reminders** - Upcoming game notifications
- **System Alerts** - Important system updates

### Implementation
- Web: Service Workers + Push API
- iOS: APNs (Apple Push Notification service)
- Android: FCM (Firebase Cloud Messaging)

## 🗺️ Maps Integration

### Features Needed
- Venue location display
- Distance calculations
- Route directions
- Nearby venue search
- Interactive venue markers

### Options
- **Google Maps** - Most comprehensive
- **Apple Maps** - iOS native
- **OpenStreetMap** - Free alternative

## 💾 Local Storage Strategy

### Cache Strategy
- **Authentication**: JWT tokens, user data
- **Games**: Recent games, user's games
- **Venues**: Nearby venues, bookings
- **Recommendations**: AI recommendations
- **Offline**: Basic functionality when offline

### Storage Options
- **localStorage** - Simple key-value storage
- **IndexedDB** - Structured database storage
- **Core Data** - iOS native storage

## 🧪 Testing Strategy

### Unit Tests
- API service functions
- Utility functions
- Component logic

### Integration Tests
- API integration
- Authentication flow
- Navigation flow

### E2E Tests
- Complete user journeys
- Critical business flows

## �� Deployment Strategy

### Web App
- **Vercel** - Easy React deployment
- **Netlify** - Static site hosting
- **AWS S3 + CloudFront** - Scalable hosting

### Mobile Apps
- **iOS** - App Store deployment
- **Android** - Google Play Store
- **PWA** - Progressive Web App for mobile web

---

## 📋 Quick Start Checklist

### Setup Phase
- [ ] Create React project with TypeScript
- [ ] Set up routing with React Router
- [ ] Configure API client with Axios
- [ ] Set up state management with React Query
- [ ] Configure styling with Tailwind CSS

### Authentication
- [ ] Implement login/register forms
- [ ] Set up JWT token management
- [ ] Create protected route component
- [ ] Implement logout functionality

### Core Features
- [ ] Build game browsing/creation
- [ ] Implement venue management
- [ ] Add AI recommendations display
- [ ] Create user dashboard

### Advanced Features
- [ ] Add analytics dashboard
- [ ] Implement system monitoring
- [ ] Set up push notifications
- [ ] Add maps integration

### Polish
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Add animations
- [ ] Optimize performance

---

## 🎯 Next Steps for You

1. **Create the file**: `docs/FRONTEND_DEVELOPMENT_SPECIFICATION.md`
2. **Copy the content above** into that file
3. **Start your React project** in your other workspace
4. **Use this specification** as your complete API reference
5. **Build the frontend** step by step following the checklist

This comprehensive specification provides everything you need to build a complete frontend that leverages all the powerful backend capabilities you've implemented. The backend supports a full-featured sports app with AI recommendations, advanced analytics, and enterprise-grade system monitoring.

**You now have everything needed to start building your React frontend and iOS app!** 🚀

---

**File Location**: `docs/FRONTEND_DEVELOPMENT_SPECIFICATION.md`

**Next**: Copy the entire content above into that new file in your docs directory!
