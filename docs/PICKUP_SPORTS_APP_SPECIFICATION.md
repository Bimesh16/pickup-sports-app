# Pickup Sports App - Complete Specification & Architecture

## Executive Summary

This document outlines the complete specification and architecture for a pickup sports application similar to Plei and Good Rec, where app owners can book fields and organize games for users to join. The system enables dynamic team formation, flexible player counts, and comprehensive game management.

## Table of Contents

1. [Current Implementation Analysis](#current-implementation-analysis)
2. [Enhanced Features Specification](#enhanced-features-specification)
3. [System Architecture](#system-architecture)
4. [Data Models](#data-models)
5. [API Design](#api-design)
6. [Mobile & Web Client Features](#mobile--web-client-features)
7. [Implementation Phases](#implementation-phases)

## Current Implementation Analysis

### ✅ Already Implemented Features

Your codebase already has a sophisticated foundation:

**Core Game Management:**
- Game CRUD operations with comprehensive validation
- Dynamic player counts (min/max players, capacity)
- Multiple game types: PICKUP, TOURNAMENT, LEAGUE, TRAINING, SOCIAL, COMPETITIVE
- Game statuses: DRAFT, PUBLISHED, FULL, CANCELLED, COMPLETED, ARCHIVED
- Skill level matching (Beginner, Intermediate, Advanced, Pro)
- Geographic search with lat/lon coordinates

**Advanced Features:**
- Venue booking system with payment integration
- User authentication with JWT and role-based access control
- Real-time chat system for game coordination
- AI-powered game recommendations
- Rate limiting and security measures
- Multi-tenant architecture support
- Analytics and monitoring
- Notification system
- RSVP management with waitlists

**Technical Infrastructure:**
- Spring Boot backend with PostgreSQL
- React/TypeScript frontend
- Docker containerization
- Monitoring with Prometheus/Grafana
- Comprehensive API documentation

### 🎯 Enhancement Areas

To achieve Plei/Good Rec functionality, we need to enhance:

1. **App Owner Workflow**: Streamlined field booking and game organization
2. **Dynamic Team Templates**: Pre-configured team formations (5v5, 7v7, etc.)
3. **Game Discovery**: Enhanced filtering and recommendation system
4. **Payment Flow**: Integrated payment splitting among participants
5. **Mobile Experience**: Native mobile app features

## Enhanced Features Specification

### 1. App Owner Game Management Workflow

**Business Flow:**
1. App owner books a venue for specific time slots
2. App owner creates a game template (e.g., "5v5 Soccer at Central Park")
3. System publishes the game for user registration
4. Users discover and register for games
5. Payment is automatically split among participants
6. Real-time updates and notifications

**Key Features:**
- **Game Templates**: Pre-configured settings for common formats
- **Bulk Venue Booking**: Book multiple time slots at once
- **Auto-pricing**: Calculate cost per player based on venue cost
- **Participant Management**: Automated team balancing and formation

### 2. Dynamic Team Formation System

**Team Templates:**
```
Soccer:
- 5v5 (10 players + 2 subs)
- 7v7 (14 players + 4 subs) 
- 11v11 (22 players + 6 subs)

Basketball:
- 3v3 (6 players + 2 subs)
- 5v5 (10 players + 4 subs)

Tennis:
- Singles (2 players)
- Doubles (4 players)
```

**Features:**
- Automatic team balancing based on skill levels
- Position preferences and role assignment
- Fair play rotation for substitutes
- Team captain assignment

### 3. Enhanced Game Discovery

**Filtering Options:**
- Sport type and format (5v5, 7v7, etc.)
- Date and time preferences
- Location radius and travel time
- Price range and payment splitting
- Skill level matching
- Game type (casual, competitive, training)

**Smart Recommendations:**
- ML-powered suggestions based on user history
- Social recommendations from friends and connections
- Proximity-based suggestions with travel time
- Schedule optimization to avoid conflicts

## System Architecture

### High-Level Architecture

```
┌─────────────────┬─────────────────┬─────────────────┐
│   Mobile Apps   │    Web App      │   Admin Panel   │
│   (iOS/Android) │   (React/TS)    │   (Management)  │
└─────────────────┴─────────────────┴─────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                API Gateway                          │
│         (Rate Limiting, Auth, Routing)              │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│              Spring Boot Backend                    │
├─────────────────┬─────────────────┬─────────────────┤
│   Game Service  │  Venue Service  │  Payment Service│
├─────────────────┼─────────────────┼─────────────────┤
│   User Service  │   Chat Service  │  Notify Service │
├─────────────────┼─────────────────┼─────────────────┤
│    AI Service   │  Search Service │ Analytics Service│
└─────────────────┴─────────────────┴─────────────────┘
                         │
                         ▼
┌─────────────────┬─────────────────┬─────────────────┐
│   PostgreSQL    │     Redis       │   File Storage  │
│   (Primary DB)  │   (Cache/WS)    │   (S3/Images)   │
└─────────────────┴─────────────────┴─────────────────┘
```

### Enhanced Service Layer Architecture

```
GameManagementService
├── GameTemplateService (5v5, 7v7 templates)
├── TeamFormationService (auto-balancing)
├── GameValidationService ✓ (already implemented)
└── GameLifecycleService (status transitions)

VenueManagementService
├── VenueBookingService ✓ (already implemented)  
├── AvailabilityService (conflict detection)
├── PricingService (dynamic pricing)
└── VenueRecommendationService

PaymentManagementService
├── PaymentService ✓ (basic implementation)
├── PaymentSplittingService (divide costs)
├── RefundService (cancellation handling)
└── PaymentNotificationService

UserEngagementService
├── RecommendationService ✓ (AI-powered)
├── NotificationService ✓ (already implemented)
├── ChatService ✓ (already implemented)
└── SocialService (friend connections)
```

## Data Models

### Enhanced Game Entity

Your current `Game` entity is already comprehensive. Key enhancements needed:

```java
// Additional fields to add to existing Game entity:
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "game_template_id")
private GameTemplate gameTemplate; // Link to template (5v5, 7v7, etc.)

@Column(name = "team_formation_strategy")
@Enumerated(EnumType.STRING)
private TeamFormationStrategy teamFormationStrategy;

@Column(name = "auto_start_enabled")
private Boolean autoStartEnabled = false; // Start when min players reached

@Column(name = "skill_balancing_enabled") 
private Boolean skillBalancingEnabled = true;
```

### New Entities Needed

**GameTemplate Entity:**
```java
@Entity
public class GameTemplate {
    @Id private Long id;
    @Column private String name; // "5v5 Soccer", "7v7 Football"
    @Column private String sport;
    @Column private Integer playersPerTeam;
    @Column private Integer totalTeams; 
    @Column private Integer minPlayers;
    @Column private Integer maxPlayers;
    @Column private Integer substitutes;
    @Column private Integer durationMinutes;
    @Column private String defaultRules;
    @Column private String requiredEquipment;
    // ... positioning rules, etc.
}
```

**Team Entity:**
```java
@Entity
public class Team {
    @Id private Long id;
    @ManyToOne private Game game;
    @Column private String teamName; // "Team A", "Team B"
    @Column private String teamColor; // For identification
    @ManyToMany private Set<User> players;
    @ManyToOne private User captain;
    @Column private Double averageSkillLevel;
}
```

**GameParticipation Enhancement:**
```java
@Entity 
public class GameParticipation {
    @Id private Long id;
    @ManyToOne private Game game;
    @ManyToOne private User user;
    @ManyToOne private Team assignedTeam;
    @Column private String preferredPosition;
    @Column private ParticipationStatus status; // REGISTERED, CONFIRMED, CHECKED_IN, etc.
    @Column private OffsetDateTime joinedAt;
    @Column private BigDecimal amountPaid;
}
```

## API Design

### Enhanced Game Management APIs

**Game Template APIs:**
```
GET /games/templates                    # List available templates
GET /games/templates/{sport}           # Templates for specific sport
POST /games/templates                  # Create custom template (admin)
```

**Enhanced Game APIs:**
```
POST /games/from-template             # Create game from template
PUT /games/{id}/teams/balance         # Auto-balance teams
GET /games/{id}/teams                 # Get team assignments
POST /games/{id}/teams/shuffle        # Reshuffle teams
```

**App Owner Workflow APIs:**
```
POST /owner/venues/book               # Book venue for multiple slots
GET /owner/games/scheduled            # Games I've organized  
POST /owner/games/bulk-create         # Create multiple games
GET /owner/dashboard/metrics          # Booking analytics
```

### Mobile-First API Endpoints

**Discovery & Onboarding:**
```
GET /games/nearby?lat={}&lon={}&radius={}     # Location-based discovery
GET /games/trending?city={}                   # Popular games in city
GET /games/quick-join?sport={}                # Quick join options
GET /onboarding/sports-preferences            # Initial sport selection
```

## Mobile & Web Client Features

### Mobile App Features

**Onboarding Flow:**
1. Location permission request
2. Sport preferences selection  
3. Skill level assessment
4. Profile completion

**Core Features:**
- **Game Discovery Map**: Interactive map with game pins
- **Quick Filters**: Sport, time, distance, price range
- **One-Tap Join**: Express registration with payment
- **Team View**: See teammates and chat before game
- **Check-in System**: QR code or location-based check-in
- **Live Updates**: Real-time game status and messages

**App Owner Features:**
- **Venue Management**: Book and manage multiple venues
- **Game Creation**: Quick game setup from templates
- **Participant Overview**: Monitor registrations and payments
- **Analytics Dashboard**: Revenue, attendance, popular games

### Web App Enhancements

**Enhanced Dashboard:**
- Game calendar view with availability
- Revenue tracking and payment management
- User analytics and engagement metrics
- Bulk operations for game management

## Implementation Phases

### Phase 1: Game Template System (2 weeks)
**Deliverables:**
- GameTemplate entity and repository
- Template management APIs
- Pre-defined sport templates (Soccer 5v5, 7v7, Basketball 3v3, 5v5)
- Game creation from templates

### Phase 2: Enhanced Team Management (2 weeks) 
**Deliverables:**
- Team entity and auto-balancing algorithm
- Team assignment APIs
- Skill-based team balancing
- Captain assignment logic

### Phase 3: App Owner Workflow (3 weeks)
**Deliverables:**
- Bulk venue booking system
- Owner dashboard and analytics
- Automated game publishing
- Revenue management tools

### Phase 4: Enhanced Mobile Experience (3 weeks)
**Deliverables:**
- Mobile-optimized API endpoints
- Enhanced game discovery
- Quick join workflows  
- Push notifications

### Phase 5: Advanced Features (2 weeks)
**Deliverables:**
- Payment splitting automation
- Advanced analytics
- Social features (friends, groups)
- Performance optimizations

## Database Seeding Strategy

### Top 10 Sample Games Structure
```sql
-- Soccer Games (5v5 format)
Soccer at Central Park - 5v5 (10 players, $15/person)
Soccer at Riverside Fields - 7v7 (14 players, $12/person)

-- Basketball Games  
Basketball at Downtown Court - 3v3 (6 players, $8/person)
Basketball at Sports Complex - 5v5 (10 players, $10/person)

-- Tennis Games
Tennis at Tennis Club - Doubles (4 players, $25/person)
Tennis at Public Courts - Singles Ladder (8 players, $15/person)

-- Volleyball Games
Beach Volleyball - 4v4 (8 players, $20/person)
Indoor Volleyball - 6v6 (12 players, $18/person)

-- American Football
Flag Football - 7v7 (14 players, $15/person)
Touch Football - 5v5 (10 players, $12/person)
```

## Technical Considerations

### Performance Optimizations
- Database indexing for geo-queries
- Redis caching for popular games
- CDN for static assets
- Lazy loading for mobile

### Security & Privacy
- PII encryption for user data
- Payment tokenization 
- Location data anonymization
- GDPR compliance features

### Scalability Patterns
- Microservices architecture ready
- Database sharding by geography
- Event-driven notifications
- Horizontal scaling capabilities

## Success Metrics

### User Engagement
- Daily/Monthly Active Users
- Game completion rate
- User retention by cohort
- Average games per user per month

### Business Metrics  
- Revenue per game
- Venue utilization rates
- Payment success rates
- Customer acquisition cost

### Operational Metrics
- API response times
- System availability
- Error rates
- Support ticket volume

---

*This specification serves as the foundation for building a comprehensive pickup sports platform that rivals industry leaders while maintaining clean architecture and scalable design patterns.*