# Pickup Sports App - Backend API Specification

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Authentication & Authorization](#authentication--authorization)
7. [Configuration](#configuration)
8. [Security](#security)
9. [Caching](#caching)
10. [Monitoring & Logging](#monitoring--logging)
11. [Deployment](#deployment)

## Overview

The Pickup Sports App backend is a comprehensive Spring Boot application designed to facilitate local sports game discovery, participation, and community building. The system supports multiple sports, real-time features, AI-powered recommendations, and market-specific functionality for different regions.

### Key Features
- **Multi-Sport Support**: Soccer, Basketball, Tennis, Futsal, and more
- **Real-time Communication**: WebSocket-based chat and notifications
- **AI Recommendations**: ML-powered game and player recommendations
- **Location Services**: GPS-based game discovery and venue management
- **Payment Integration**: Support for game fees and venue bookings
- **Multi-Market Support**: Specialized features for Nepal and other markets
- **Social Features**: User ratings, reviews, and community building

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Mobile App    │    │   Admin Panel   │
│   (React)       │    │   (React Native)│    │   (Web)         │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │     API Gateway          │
                    │   (Spring Boot)          │
                    └─────────────┬─────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼────────┐    ┌───────────▼──────────┐    ┌────────▼────────┐
│   PostgreSQL   │    │      Redis           │    │    RabbitMQ     │
│   (Primary DB) │    │    (Caching)         │    │   (Messaging)   │
└────────────────┘    └──────────────────────┘    └─────────────────┘
```

### Microservices Architecture
- **Core Service**: Main application with all business logic
- **AI Service**: Machine learning and recommendation engine
- **Notification Service**: Real-time notifications and messaging
- **Payment Service**: Payment processing and financial transactions
- **Analytics Service**: Data analytics and reporting

## Technology Stack

### Core Framework
- **Spring Boot 3.5.4**: Main application framework
- **Java 17**: Programming language
- **Maven**: Build and dependency management

### Database & Persistence
- **PostgreSQL 15**: Primary relational database
- **Hibernate/JPA**: Object-relational mapping
- **Flyway**: Database migration management
- **Redis**: Caching and session storage

### Security
- **Spring Security 6**: Authentication and authorization
- **JWT (JSON Web Tokens)**: Stateless authentication
- **BCrypt**: Password hashing
- **CORS**: Cross-origin resource sharing

### Messaging & Real-time
- **WebSocket**: Real-time communication
- **RabbitMQ**: Message queuing
- **Redis Pub/Sub**: Real-time notifications

### Monitoring & Observability
- **Spring Actuator**: Health checks and metrics
- **Micrometer**: Application metrics
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization

### API Documentation
- **OpenAPI 3**: API specification
- **Swagger UI**: Interactive API documentation
- **SpringDoc**: OpenAPI integration

## Database Schema

### Core Entities

#### User Entity (`app_user`)
```sql
CREATE TABLE app_user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(512),
    skill_level VARCHAR(50),
    age INTEGER CHECK (age >= 13 AND age <= 120),
    position VARCHAR(100),
    contact_preference VARCHAR(50),
    location VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    preferred_sport_id BIGINT REFERENCES sport(id),
    rating_average DECIMAL(3, 2) DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    locale VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Game Entity (`game`)
```sql
CREATE TABLE game (
    id BIGSERIAL PRIMARY KEY,
    sport VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    game_time TIMESTAMP WITH TIME ZONE NOT NULL,
    skill_level VARCHAR(50),
    description TEXT,
    min_players INTEGER DEFAULT 1,
    max_players INTEGER DEFAULT 10,
    current_players INTEGER DEFAULT 0,
    price_per_player DECIMAL(10, 2) DEFAULT 0.0,
    total_cost DECIMAL(10, 2) DEFAULT 0.0,
    duration_minutes INTEGER DEFAULT 90,
    capacity INTEGER DEFAULT 10,
    waitlist_enabled BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    weather_dependent BOOLEAN DEFAULT FALSE,
    cancellation_policy TEXT,
    rules TEXT,
    equipment_provided TEXT,
    equipment_required TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_by BIGINT REFERENCES app_user(id),
    venue_id BIGINT REFERENCES venue(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Venue Entity (`venue`)
```sql
CREATE TABLE venue (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    capacity INTEGER,
    hourly_rate DECIMAL(10, 2),
    amenities TEXT[],
    rules TEXT,
    operating_hours JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### User Roles (`user_roles`)
```sql
CREATE TABLE user_roles (
    user_id BIGINT REFERENCES app_user(id),
    role INTEGER NOT NULL, -- 0=USER, 1=ADMIN, 2=MODERATOR
    PRIMARY KEY (user_id, role)
);
```

#### Game Participants (`game_participants`)
```sql
CREATE TABLE game_participants (
    game_id BIGINT REFERENCES game(id),
    user_id BIGINT REFERENCES app_user(id),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, CONFIRMED, CANCELLED
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (game_id, user_id)
);
```

#### Notifications (`notification`)
```sql
CREATE TABLE notification (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES app_user(id) NOT NULL,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Supporting Tables

#### Sports (`sport`)
```sql
CREATE TABLE sport (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    min_players INTEGER DEFAULT 1,
    max_players INTEGER DEFAULT 10,
    equipment_required TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Refresh Tokens (`refresh_token`)
```sql
CREATE TABLE refresh_token (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES app_user(id) NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    device_id VARCHAR(255),
    user_agent TEXT,
    issued_ip INET,
    replaced_by_token_hash VARCHAR(255),
    revoked_at TIMESTAMP WITH TIME ZONE
);
```

#### Revoked Tokens (`revoked_token`)
```sql
CREATE TABLE revoked_token (
    jti VARCHAR(255) PRIMARY KEY,
    revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason VARCHAR(100)
);
```

## API Endpoints

### Authentication Endpoints

#### POST `/auth/login`
**Description**: Authenticate user and return JWT tokens
**Request Body**:
```json
{
  "username": "jane@example.com",
  "password": "password"
}
```
**Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzM4NCJ9...",
  "refreshToken": "uuid-refresh-token",
  "refreshNonce": "uuid-nonce",
  "tokenType": "Bearer",
  "expiresInSeconds": 7200
}
```

#### POST `/auth/refresh`
**Description**: Refresh access token using refresh token
**Request Body**:
```json
{
  "refreshToken": "uuid-refresh-token"
}
```

#### POST `/auth/logout`
**Description**: Logout user and revoke tokens
**Headers**: `Authorization: Bearer <token>`

### User Management Endpoints

#### POST `/users/register`
**Description**: Register new user
**Request Body**:
```json
{
  "username": "jane@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com"
}
```

#### GET `/profiles/me`
**Description**: Get current user profile
**Headers**: `Authorization: Bearer <token>`
**Response**:
```json
{
  "id": 1,
  "username": "jane@example.com",
  "bio": "Soccer enthusiast",
  "avatarUrl": "https://example.com/avatar.jpg",
  "skillLevel": "INTERMEDIATE",
  "age": 25,
  "position": "Midfielder",
  "contactPreference": "EMAIL"
}
```

#### PUT `/profiles/me`
**Description**: Update current user profile
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "bio": "Updated bio",
  "skillLevel": "ADVANCED",
  "age": 26,
  "position": "Forward"
}
```

### Game Management Endpoints

#### GET `/api/v1/games`
**Description**: Get list of games with filtering
**Query Parameters**:
- `sport`: Filter by sport
- `latitude`: User latitude for distance filtering
- `longitude`: User longitude for distance filtering
- `radius`: Search radius in kilometers (default: 10)
- `skillLevel`: Filter by skill level
- `dateFrom`: Start date filter
- `dateTo`: End date filter
- `page`: Page number (default: 0)
- `size`: Page size (default: 20)

**Response**:
```json
{
  "content": [
    {
      "id": 1,
      "sport": "Soccer",
      "location": "Central Park",
      "latitude": 40.7829,
      "longitude": -73.9654,
      "gameTime": "2025-08-25T18:00:00Z",
      "skillLevel": "INTERMEDIATE",
      "description": "Friendly soccer game",
      "minPlayers": 6,
      "maxPlayers": 10,
      "currentPlayers": 4,
      "pricePerPlayer": 5.00,
      "durationMinutes": 90,
      "capacity": 10,
      "isPrivate": false,
      "status": "ACTIVE",
      "createdBy": {
        "id": 1,
        "username": "jane@example.com"
      }
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 1,
  "totalPages": 1
}
```

#### POST `/api/v1/games`
**Description**: Create new game
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "sport": "Soccer",
  "location": "Central Park",
  "latitude": 40.7829,
  "longitude": -73.9654,
  "gameTime": "2025-08-25T18:00:00Z",
  "skillLevel": "INTERMEDIATE",
  "description": "Friendly soccer game",
  "minPlayers": 6,
  "maxPlayers": 10,
  "pricePerPlayer": 5.00,
  "durationMinutes": 90,
  "capacity": 10,
  "isPrivate": false
}
```

#### GET `/api/v1/games/{gameId}`
**Description**: Get game details by ID
**Headers**: `Authorization: Bearer <token>`

#### PUT `/api/v1/games/{gameId}`
**Description**: Update game details
**Headers**: `Authorization: Bearer <token>`

#### DELETE `/api/v1/games/{gameId}`
**Description**: Delete game
**Headers**: `Authorization: Bearer <token>`

#### POST `/api/v1/games/{gameId}/join`
**Description**: Join a game
**Headers**: `Authorization: Bearer <token>`

#### DELETE `/api/v1/games/{gameId}/leave`
**Description**: Leave a game
**Headers**: `Authorization: Bearer <token>`

### Venue Management Endpoints

#### GET `/api/v1/venues`
**Description**: Get list of venues
**Query Parameters**:
- `latitude`: User latitude for distance filtering
- `longitude`: User longitude for distance filtering
- `radius`: Search radius in kilometers
- `sport`: Filter by supported sports
- `amenities`: Filter by amenities

#### POST `/api/v1/venues`
**Description**: Create new venue
**Headers**: `Authorization: Bearer <token>`

#### GET `/api/v1/venues/{venueId}`
**Description**: Get venue details

#### POST `/api/v1/venues/{venueId}/book`
**Description**: Book venue
**Headers**: `Authorization: Bearer <token>`

### AI Recommendation Endpoints

#### GET `/api/v1/ai/recommendations/comprehensive`
**Description**: Get comprehensive AI recommendations
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `limit`: Number of recommendations (default: 10)

#### GET `/api/v1/ai/enhanced/recommendations`
**Description**: Get enhanced AI recommendations with algorithm selection
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `limit`: Number of recommendations (default: 10)
- `algorithm`: Algorithm type (collaborative, content, hybrid, contextual)

### Nepal Market Endpoints

#### GET `/api/v1/nepal/futsal/nearby`
**Description**: Find futsal games near user location in Nepal
**Query Parameters**:
- `latitude`: User latitude (required)
- `longitude`: User longitude (required)
- `radiusKm`: Search radius in kilometers (default: 5.0)
- `timeSlot`: Time slot preference

#### GET `/api/v1/nepal/futsal/popular-areas`
**Description**: Get popular futsal areas in Kathmandu Valley

#### GET `/api/v1/nepal/sports/localized`
**Description**: Get localized sports information for Nepal

### Notification Endpoints

#### GET `/api/v1/notifications`
**Description**: Get user notifications
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `unreadOnly`: Filter unread notifications only
- `page`: Page number
- `size`: Page size

#### PUT `/api/v1/notifications/{notificationId}/read`
**Description**: Mark notification as read
**Headers**: `Authorization: Bearer <token>`

#### PUT `/api/v1/notifications/read-all`
**Description**: Mark all notifications as read
**Headers**: `Authorization: Bearer <token>`

### System Endpoints

#### GET `/api/v1/system/performance/metrics`
**Description**: Get system performance metrics
**Headers**: `Authorization: Bearer <token>`

#### GET `/status`
**Description**: Application health check
**Response**:
```json
{
  "name": "Pickup Sports API",
  "version": "1.0.0",
  "status": "ok",
  "timestamp": 1757300925246
}
```

#### GET `/actuator/health`
**Description**: Detailed health check

#### GET `/actuator/metrics`
**Description**: Application metrics

## Authentication & Authorization

### JWT Token Structure
```json
{
  "sub": "jane@example.com",
  "iss": "pickup-sports-app",
  "aud": ["pickup-sports-clients"],
  "iat": 1757300925,
  "exp": 1757308125,
  "jti": "unique-token-id"
}
```

### Token Configuration
- **Access Token Expiry**: 2 hours (7200 seconds)
- **Refresh Token Expiry**: 14 days
- **Algorithm**: HMAC SHA-384
- **Header Name**: `Authorization`
- **Header Prefix**: `Bearer `

### Role-Based Access Control
- **USER**: Basic user permissions
- **ADMIN**: Full administrative access
- **MODERATOR**: Content moderation permissions

### Security Features
- Password hashing with BCrypt
- JWT token validation
- Refresh token rotation
- Token revocation support
- Rate limiting on login attempts
- CORS configuration
- CSRF protection (disabled for API)

## Configuration

### Application Profiles

#### Development Profile (`local-dev`)
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/soccer_app
spring.datasource.username=postgres
spring.datasource.password=password

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Security
security.jwt.secret=local-development-secret-key
security.jwt.expiration-minutes=120

# CORS
app.cors.allowed-origins=http://localhost:3000,http://localhost:8081,http://localhost:8082
app.cors.allow-credentials=true
```

#### Staging Profile (`staging`)
```properties
# Database
spring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}

# Security
security.jwt.secret=${JWT_SECRET}
security.jwt.expiration-minutes=120

# CORS
app.cors.allowed-origins=https://staging.pickupsports.com
app.cors.allow-credentials=true

# Redis
spring.data.redis.host=${REDIS_HOST}
spring.data.redis.port=${REDIS_PORT}
```

#### Production Profile (`prod`)
```properties
# Database
spring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}

# Security
security.jwt.secret=${JWT_SECRET}
security.jwt.expiration-minutes=60

# CORS
app.cors.allowed-origins=https://pickupsports.com
app.cors.allow-credentials=true

# Monitoring
management.endpoints.web.exposure.include=health,info,metrics
```

### Environment Variables
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: JWT signing secret
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port
- `RABBITMQ_HOST`: RabbitMQ host
- `RABBITMQ_PORT`: RabbitMQ port

## Security

### Authentication Flow
1. User submits credentials to `/auth/login`
2. Server validates credentials against database
3. Server generates JWT access token and refresh token
4. Tokens returned to client
5. Client includes access token in subsequent requests
6. Server validates token on each request

### Password Security
- Minimum 8 characters
- Maximum 128 characters
- BCrypt hashing with salt rounds: 10
- Password strength validation

### Token Security
- JWT tokens signed with HMAC SHA-384
- Access tokens expire in 2 hours
- Refresh tokens expire in 14 days
- Token revocation support
- Secure token storage recommendations

### API Security
- HTTPS required in production
- CORS properly configured
- Rate limiting on authentication endpoints
- Input validation on all endpoints
- SQL injection prevention through JPA
- XSS protection headers

## Caching

### Redis Configuration
```properties
# Redis connection
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.password=

# Cache configuration
spring.cache.type=redis
spring.cache.redis.time-to-live=300000
spring.cache.redis.cache-null-values=false
```

### Cache Keys
- `user-profiles`: User profile data (TTL: 5 minutes)
- `game-details`: Game details (TTL: 30 seconds)
- `nearby-games`: Location-based game search (TTL: 30 seconds)
- `sports-list`: Available sports (TTL: 10 minutes)
- `search-filters`: Search filter options (TTL: 5 minutes)

### Cache Strategies
- **Write-through**: Write to cache and database simultaneously
- **Write-behind**: Write to cache first, then database asynchronously
- **Cache-aside**: Application manages cache manually
- **Read-through**: Cache loads data from database on miss

## Monitoring & Logging

### Health Checks
- **Liveness Probe**: `/actuator/health/liveness`
- **Readiness Probe**: `/actuator/health/readiness`
- **Database Health**: Connection and query health
- **Redis Health**: Cache connectivity
- **RabbitMQ Health**: Message queue health

### Metrics
- **Application Metrics**: Request count, response time, error rate
- **Database Metrics**: Connection pool, query performance
- **JVM Metrics**: Memory usage, GC performance
- **Custom Metrics**: Business-specific metrics

### Logging Configuration
```properties
# Log levels
logging.level.root=WARN
logging.level.com.bmessi.pickupsportsapp=INFO
logging.level.org.springframework.web=WARN
logging.level.org.springframework.security=WARN
logging.level.org.hibernate.SQL=DEBUG

# Log format
logging.pattern.level=%5p [%X{requestId}]
```

### Log Aggregation
- Structured JSON logging
- Request correlation IDs
- Error tracking and alerting
- Performance monitoring

## Deployment

### Docker Configuration
```dockerfile
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=staging
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: soccer_app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pickup-sports-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pickup-sports-api
  template:
    metadata:
      labels:
        app: pickup-sports-api
    spec:
      containers:
      - name: api
        image: pickup-sports-api:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: host
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
```

### Environment-Specific Configurations

#### Development
- Local PostgreSQL database
- In-memory Redis (optional)
- Detailed logging enabled
- H2 console enabled
- Swagger UI enabled

#### Staging
- Staging PostgreSQL database
- Redis cluster
- Production-like configuration
- Monitoring enabled
- Limited logging

#### Production
- Production PostgreSQL cluster
- Redis cluster with persistence
- Full monitoring and alerting
- Security hardening
- Performance optimization

### Scaling Considerations
- **Horizontal Scaling**: Multiple application instances
- **Database Scaling**: Read replicas, connection pooling
- **Cache Scaling**: Redis cluster
- **Load Balancing**: Application load balancer
- **CDN**: Static content delivery

### Backup & Recovery
- **Database Backups**: Daily automated backups
- **Configuration Backups**: Version-controlled configurations
- **Disaster Recovery**: Multi-region deployment
- **Data Retention**: Configurable retention policies

---

This specification provides a comprehensive overview of the Pickup Sports App backend system, covering all aspects from architecture to deployment. The system is designed to be scalable, secure, and maintainable while providing rich functionality for sports game discovery and community building.
