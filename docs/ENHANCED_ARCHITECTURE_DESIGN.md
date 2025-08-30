# Enhanced Architecture Design - Pickup Sports App

## System Architecture Overview

### Current vs Enhanced Architecture

**Current Architecture (What you have):**
- Microservices-ready Spring Boot backend
- JWT-based authentication with role management  
- Comprehensive game entity with venue booking
- Real-time chat and notification systems
- AI recommendation engine
- Multi-tenant support

**Enhanced Architecture (Plei-like Features):**
- App Owner workflow for field booking and game organization
- Dynamic team formation with skill balancing
- Automated payment splitting among participants
- Game template system for common formats (5v5, 7v7)
- Enhanced mobile-first user experience

## Service Layer Architecture

### Core Services Enhancement

```
📁 Game Management
├── GameTemplateService (NEW)
│   ├── createTemplate(sport, format, rules)
│   ├── getTemplatesForSport(sport)
│   └── applyTemplate(templateId, venueId, timeSlot)
├── TeamFormationService (NEW)
│   ├── autoBalanceTeams(gameId, strategy)
│   ├── assignCaptains(gameId) 
│   └── shuffleTeams(gameId)
├── GameValidationService ✅ (enhanced)
│   ├── validateTeamFormation(game, teams)
│   └── validatePlayerEligibility(game, user)
└── GameLifecycleService (NEW)
    ├── publishGame(gameId)
    ├── startGame(gameId)
    └── completeGame(gameId, results)

📁 App Owner Management  
├── OwnerDashboardService (NEW)
│   ├── getOwnerMetrics(ownerId)
│   ├── getRevenueAnalytics(ownerId, timeRange)
│   └── getPopularGames(ownerId)
├── BulkGameService (NEW)
│   ├── createGamesFromTemplate(templateId, venues[], timeSlots[])
│   ├── bulkUpdateGames(gameIds[], updates)
│   └── cancelGameSeries(seriesId)
└── VenueOptimizationService (NEW)
    ├── suggestOptimalTimeSlots(venueId, sport)
    ├── calculateVenueUtilization(venueId)
    └── recommendPricing(venueId, sport, timeSlot)

📁 Payment & Financial
├── PaymentService ✅ (enhanced)
├── PaymentSplittingService (NEW)
│   ├── calculateSplitPayment(gameId)
│   ├── processPlayerPayments(gameId)
│   └── handleRefunds(gameId, reason)
├── RevenueService (NEW)
│   ├── calculateOwnerRevenue(ownerId, timeRange)
│   ├── generatePayoutReports(ownerId)
│   └── trackCommissionFees()
└── PricingService (NEW) 
    ├── calculateOptimalPricing(venueId, demand)
    ├── applyDynamicPricing(gameId)
    └── handleEarlyBirdDiscounts(gameId)

📁 User Experience
├── RecommendationService ✅ (enhanced with templates)
├── DiscoveryService (NEW)
│   ├── findGamesByPreferences(userId, filters)
│   ├── getQuickJoinOptions(userId, location)
│   └── getTrendingGames(location, sport)
├── SocialService (NEW)
│   ├── getFriendActivity(userId)
│   ├── createGameInvitations(gameId, userIds[])
│   └── manageUserConnections(userId)
└── OnboardingService (NEW)
    ├── collectUserPreferences(userId)
    ├── suggestInitialGames(userId)
    └── trackOnboardingProgress(userId)
```

## Data Model Enhancements

### New Entities Required

**GameTemplate Entity:**
```java
@Entity
@Table(name = "game_templates")
public class GameTemplate {
    @Id @GeneratedValue private Long id;
    
    // Template Configuration
    @Column(nullable = false) private String name;        // "5v5 Soccer"
    @Column(nullable = false) private String sport;       // "Soccer"  
    @Column(nullable = false) private String format;      // "5v5"
    @Column private String description;
    
    // Team Structure
    @Column private Integer playersPerTeam;     // 5 for 5v5
    @Column private Integer totalTeams;         // 2 for standard game
    @Column private Integer minPlayers;         // 8 (min to start)
    @Column private Integer maxPlayers;         // 12 (including subs)
    @Column private Integer substituteSlots;    // 2 subs per team
    
    // Game Settings
    @Column private Integer durationMinutes;    // 90 for soccer
    @Column private String defaultRules;
    @Column private String requiredEquipment;
    @Column private String positions;           // JSON: ["GK","DEF","MID","FWD"]
    
    // Business Rules
    @Column private Boolean skillBalancingRequired;
    @Column private Boolean captainAssignmentRequired;
    @Column private Boolean positionAssignmentRequired;
    
    // Metadata
    @CreationTimestamp private OffsetDateTime createdAt;
    @UpdateTimestamp private OffsetDateTime updatedAt;
    @Column private Boolean isActive = true;
    @Column private Integer popularity = 0;    // Usage count
}
```

**Team Entity:**
```java
@Entity
@Table(name = "teams")
public class Team {
    @Id @GeneratedValue private Long id;
    
    @ManyToOne @JoinColumn(name = "game_id") private Game game;
    @Column private String teamName;           // "Team A", "Team B", "Red Team"
    @Column private String teamColor;          // HEX color for identification
    @Column private Integer teamNumber;        // 1, 2, 3 for multi-team games
    
    // Players
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(name = "team_players",
        joinColumns = @JoinColumn(name = "team_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> players = new HashSet<>();
    
    @ManyToOne @JoinColumn(name = "captain_id") private User captain;
    
    // Team Stats (calculated)
    @Column private Double averageSkillLevel;
    @Column private Integer totalExperience;
    @Column private OffsetDateTime formedAt;
    
    // Team Formation Metadata
    @Column private Boolean isBalanced;
    @Column private String formationStrategy; // SKILL_BALANCED, RANDOM, MANUAL
}
```

**Enhanced GameParticipation:**
```java
@Entity
@Table(name = "game_participants")
public class GameParticipation {
    @Id @GeneratedValue private Long id;
    
    // Core Relationships
    @ManyToOne private Game game;
    @ManyToOne private User user;  
    @ManyToOne private Team assignedTeam;
    
    // Participation Details
    @Enumerated(EnumType.STRING) private ParticipationStatus status;
    @Column private String preferredPosition;     // "GK", "DEF", "MID", "ATT"
    @Column private Boolean isSubstitute = false;
    @Column private Integer jerseyNumber;
    
    // Payment & Financial
    @Column private BigDecimal amountOwed;
    @Column private BigDecimal amountPaid;
    @Column private String paymentIntentId;
    @Enumerated(EnumType.STRING) private PaymentStatus paymentStatus;
    
    // Timestamps
    @Column private OffsetDateTime registeredAt;
    @Column private OffsetDateTime checkedInAt;
    @Column private OffsetDateTime paidAt;
    
    // Experience Tracking
    @Column private Boolean attended;
    @Column private Integer performanceRating;  // 1-5 rating post-game
    @Column private String feedback;            // Player feedback
}
```

### Enhanced Relationships

**User Entity Additions:**
```java
// Add to existing User entity:
@Column private String primarySport;           // Main sport interest
@Column private Set<String> preferredPositions; // JSON array
@Column private String skillAssessment;        // JSON with skills per sport
@Column private Double averageRating;          // Community rating
@Column private Integer gamesCompleted;        // Total games finished
@Column private BigDecimal totalSpent;         // Lifetime spending
@Column private String paymentMethodId;        // Stored payment method
```

## Enhanced Workflow Diagrams

### App Owner Game Creation Flow
```
1. Owner logs into dashboard
2. Selects venue and time slots
3. Chooses game template (5v5 Soccer, 7v7 Football, etc.)
4. Sets pricing and house rules
5. System creates game and opens registration
6. Automated notifications sent to relevant users
7. Payment processing and team formation
8. Game day management and check-ins
```

### User Game Discovery & Registration Flow  
```
1. User opens app and sees location-based games
2. Filters by sport, time, skill level, price
3. Views game details and team composition
4. Registers with one-tap payment
5. Gets added to game chat channel
6. Receives team assignment and game details
7. Check-in on game day with QR code/location
8. Post-game rating and feedback
```

### Automatic Team Formation Algorithm
```python
def balance_teams(game, participants):
    # 1. Sort participants by skill level
    sorted_participants = sort_by_skill(participants)
    
    # 2. Create teams based on template
    teams = create_empty_teams(game.template)
    
    # 3. Snake draft allocation for balance
    team_index = 0
    direction = 1
    
    for participant in sorted_participants:
        teams[team_index].add(participant) 
        team_index += direction
        if team_index >= len(teams) or team_index < 0:
            direction *= -1
            team_index = max(0, min(len(teams)-1, team_index))
    
    # 4. Assign captains (highest skill on each team)
    for team in teams:
        team.captain = get_highest_skill_player(team)
        
    return teams
```

## Technology Stack Enhancements

### Backend Additions
- **Spring Cloud Gateway**: API routing and rate limiting
- **Spring Cloud Config**: Centralized configuration
- **Spring Cache**: Redis-based caching layer
- **Spring Events**: Async event processing
- **Mapstruct**: Enhanced DTO mapping
- **Testcontainers**: Integration testing

### Mobile Development
- **React Native** or **Flutter** for cross-platform
- **Push Notifications**: Firebase Cloud Messaging
- **Offline Support**: Local storage with sync
- **Geolocation**: High-accuracy positioning
- **Payment SDKs**: Stripe/PayPal mobile SDKs

### DevOps & Monitoring
- **Kubernetes**: Container orchestration
- **Helm Charts**: Deployment management  
- **Prometheus**: Metrics collection
- **Grafana**: Dashboards and alerting
- **ELK Stack**: Centralized logging
- **Chaos Engineering**: Resilience testing

## Quality Assurance Strategy

### Testing Pyramid
```
E2E Tests (10%)
├── User journey testing
├── Payment flow testing 
└── Mobile app testing

Integration Tests (30%)
├── API contract testing
├── Database integration testing
└── External service integration

Unit Tests (60%)
├── Service layer testing
├── Entity validation testing
└── Business logic testing
```

### Performance Targets
- **API Response Time**: < 200ms (95th percentile)
- **Mobile App Load Time**: < 3 seconds
- **Search Response Time**: < 500ms for geo queries
- **Payment Processing**: < 5 seconds end-to-end
- **Real-time Updates**: < 1 second delivery

---

This enhanced architecture builds upon your existing solid foundation while adding the sophisticated features needed to compete with Plei and Good Rec. The modular design ensures scalability and maintainability as your platform grows.