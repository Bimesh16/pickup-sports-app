# Pickup Sports App

## Overview

This is a comprehensive pickup sports application backend built with Java 17 and Spring Boot, designed to facilitate sports game discovery, organization, and participation. The app features location-based game discovery, real-time chat, payment processing, and advanced analytics, with specialized features for the Nepal market including futsal integration and local payment gateways (eSewa, Khalti).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Backend Framework
- **Java 17** with Spring Boot microservices architecture
- **PostgreSQL** as primary database with spatial query support for location-based features
- **Redis** for caching and distributed rate limiting
- **Docker** containerization for development and deployment

### Authentication & Security
- JWT-based authentication with refresh token mechanism
- Role-based access control (USER, ADMIN roles)
- Distributed rate limiting and user lockout protection
- Email verification and password reset workflows
- Security audit trails and admin monitoring

### Game Management System
- Comprehensive game entity supporting multiple formats (PICKUP, TOURNAMENT, LEAGUE)
- Dynamic player capacity management with waitlist functionality
- Geographic proximity search using latitude/longitude coordinates
- Game lifecycle management (DRAFT → PUBLISHED → FULL → COMPLETED)
- Real-time RSVP system with hold-and-confirm payment flow

### Real-time Communication
- WebSocket-based chat system for game coordination
- Real-time notifications for game updates and promotions
- SockJS/STOMP protocol implementation with connection management
- Rate limiting on chat messages to prevent spam

### Data Architecture
- **Game Entity**: Core game management with venue booking integration
- **User Management**: Comprehensive user profiles with skill levels and preferences
- **Venue System**: Location-based venue discovery and booking
- **Payment Integration**: Multi-gateway payment processing
- **Analytics Layer**: User behavior tracking and game analytics

### Nepal-Specific Features
- **Futsal Sport Integration**: 5v5 indoor soccer with FIFA futsal rules
- **Local Payment Gateways**: eSewa and Khalti integration for Nepal market
- **Localization Support**: Nepali language support and country-specific features
- **Popular Areas**: Kathmandu futsal centers and venue recommendations

### Performance & Monitoring
- Micrometer metrics with Prometheus integration
- Grafana dashboards for system monitoring
- Circuit breaker pattern for external service resilience
- Comprehensive health checks (liveness, readiness, custom health endpoints)
- Performance optimization engine with cache management

### Mobile Frontend
- React Native/Expo mobile application
- TypeScript for type safety
- Theme system supporting Nepal (red/blue) and global (blue/green) color schemes
- Location-based features with maps integration
- Real-time updates using WebSocket connections

## External Dependencies

### Databases & Storage
- **PostgreSQL**: Primary relational database for game, user, and venue data
- **Redis**: Caching layer and distributed session storage
- **H2**: In-memory database for development and testing

### Payment Processing
- **eSewa**: Nepal's leading mobile wallet integration
- **Khalti**: Digital payment gateway for Nepal market
- **Stripe**: International payment processing capability
- **PayPal**: Global payment option integration

### Communication Services
- **Email Service**: SMTP integration for notifications and verification
- **WebSocket**: Real-time chat and notification delivery
- **Push Notifications**: Mobile app notification system

### Development & Operations
- **Docker Compose**: Local development environment setup
- **Prometheus**: Metrics collection and monitoring
- **Grafana**: Visualization and alerting dashboards
- **Swagger/OpenAPI**: API documentation generation
- **Postman**: API testing collections and environments

### Geographic & Location Services
- **Spatial Queries**: PostgreSQL PostGIS for location-based searches
- **Maps Integration**: React Native Maps for mobile location features
- **Geocoding**: Address to coordinate conversion capabilities

### Security & Infrastructure
- **JWT**: Stateless authentication token management
- **BCrypt**: Password hashing and security
- **Rate Limiting**: Redis-backed distributed rate limiting
- **CORS**: Cross-origin resource sharing configuration
- **SSL/TLS**: Secure communication protocols