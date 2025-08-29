# Implementation Phases - Pickup Sports App Enhancement

## Overview

This document outlines the detailed implementation phases to transform your existing pickup sports app into a Plei/Good Rec style platform with app owner managed games and dynamic team formation.

## Phase 1: Game Template System & Dynamic Teams (Week 1-2)

### 1.1 Database Schema Updates

**New Tables:**
```sql
-- Game Templates Table
CREATE TABLE game_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sport VARCHAR(50) NOT NULL,
    format VARCHAR(20) NOT NULL,           -- "5v5", "7v7", "3v3"
    players_per_team INTEGER NOT NULL,
    total_teams INTEGER DEFAULT 2,
    min_players INTEGER NOT NULL,
    max_players INTEGER NOT NULL,
    substitute_slots INTEGER DEFAULT 0,
    duration_minutes INTEGER NOT NULL,
    default_rules TEXT,
    required_equipment TEXT,
    skill_balancing_required BOOLEAN DEFAULT true,
    captain_assignment_required BOOLEAN DEFAULT false,
    position_assignment_required BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    popularity INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams Table  
CREATE TABLE teams (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL REFERENCES game(id) ON DELETE CASCADE,
    team_name VARCHAR(50) NOT NULL,
    team_color VARCHAR(7),                 -- HEX color code
    team_number INTEGER NOT NULL,
    captain_id BIGINT REFERENCES app_user(id),
    average_skill_level DECIMAL(3,2),
    total_experience INTEGER DEFAULT 0,
    formed_at TIMESTAMPTZ DEFAULT NOW(),
    is_balanced BOOLEAN DEFAULT false,
    formation_strategy VARCHAR(50) DEFAULT 'SKILL_BALANCED'
);

-- Enhanced Game Participants Table
ALTER TABLE game_participants ADD COLUMN team_id BIGINT REFERENCES teams(id);
ALTER TABLE game_participants ADD COLUMN preferred_position VARCHAR(20);
ALTER TABLE game_participants ADD COLUMN is_substitute BOOLEAN DEFAULT false;
ALTER TABLE game_participants ADD COLUMN jersey_number INTEGER;
ALTER TABLE game_participants ADD COLUMN participation_status VARCHAR(20) DEFAULT 'REGISTERED';
ALTER TABLE game_participants ADD COLUMN registered_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE game_participants ADD COLUMN amount_owed DECIMAL(10,2);
ALTER TABLE game_participants ADD COLUMN amount_paid DECIMAL(10,2) DEFAULT 0;
ALTER TABLE game_participants ADD COLUMN payment_status VARCHAR(20) DEFAULT 'PENDING';

-- Indexes for performance
CREATE INDEX idx_game_templates_sport ON game_templates(sport);
CREATE INDEX idx_game_templates_format ON game_templates(format);
CREATE INDEX idx_teams_game_id ON teams(game_id);
CREATE INDEX idx_game_participants_team ON game_participants(team_id);
```

### 1.2 Java Entity Classes

**GameTemplate.java:**
```java
@Entity
@Table(name = "game_templates")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GameTemplate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank @Size(max = 100)
    private String name;
    
    @NotBlank @Size(max = 50) 
    private String sport;
    
    @NotBlank @Size(max = 20)
    private String format;
    
    @Min(1) @Max(50)
    private Integer playersPerTeam;
    
    @Min(2) @Max(10)
    @Builder.Default
    private Integer totalTeams = 2;
    
    @Min(2) @Max(100)
    private Integer minPlayers;
    
    @Min(2) @Max(100) 
    private Integer maxPlayers;
    
    @Min(0) @Max(20)
    @Builder.Default
    private Integer substituteSlots = 0;
    
    @Min(15) @Max(480)
    private Integer durationMinutes;
    
    @Column(columnDefinition = "TEXT")
    private String defaultRules;
    
    @Column(columnDefinition = "TEXT")
    private String requiredEquipment;
    
    @Builder.Default
    private Boolean skillBalancingRequired = true;
    
    @Builder.Default 
    private Boolean captainAssignmentRequired = false;
    
    @Builder.Default
    private Boolean positionAssignmentRequired = false;
    
    @Builder.Default
    private Boolean isActive = true;
    
    @Builder.Default
    private Integer popularity = 0;
    
    @CreationTimestamp
    private OffsetDateTime createdAt;
    
    @UpdateTimestamp 
    private OffsetDateTime updatedAt;
}
```

**Team.java:**
```java
@Entity
@Table(name = "teams")  
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Team {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;
    
    @NotBlank @Size(max = 50)
    private String teamName;
    
    @Pattern(regexp = "^#[A-Fa-f0-9]{6}$")
    private String teamColor;
    
    @Min(1) @Max(10)
    private Integer teamNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "captain_id")
    private User captain;
    
    @DecimalMin("0.0") @DecimalMax("5.0")
    private Double averageSkillLevel;
    
    @Min(0)
    @Builder.Default
    private Integer totalExperience = 0;
    
    @CreationTimestamp
    private OffsetDateTime formedAt;
    
    @Builder.Default
    private Boolean isBalanced = false;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private FormationStrategy formationStrategy = FormationStrategy.SKILL_BALANCED;
    
    // Team composition
    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL)
    private Set<TeamMember> members = new HashSet<>();
}

enum FormationStrategy {
    SKILL_BALANCED,    // Auto-balance by skill
    RANDOM,            // Random assignment  
    MANUAL,            // Manually assigned by captain/owner
    FRIEND_GROUPS      // Keep friend groups together
}
```

### 1.3 Service Layer Implementation

**GameTemplateService.java:**
```java
@Service
@RequiredArgsConstructor
@Transactional
public class GameTemplateService {
    
    private final GameTemplateRepository repository;
    private final ApiMapper mapper;
    
    public List<GameTemplateDTO> getTemplatesBySport(String sport) {
        return repository.findBySportAndIsActiveTrue(sport)
                .stream()
                .map(mapper::toGameTemplateDTO)
                .toList();
    }
    
    public GameDetailsDTO createGameFromTemplate(CreateGameFromTemplateRequest request, User owner) {
        GameTemplate template = repository.findById(request.templateId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Template not found"));
            
        // Build game from template
        Game game = Game.builder()
            .sport(template.getSport())
            .gameType(Game.GameType.PICKUP)
            .status(Game.GameStatus.DRAFT)
            .minPlayers(template.getMinPlayers())
            .maxPlayers(template.getMaxPlayers())
            .capacity(template.getMaxPlayers())
            .durationMinutes(template.getDurationMinutes())
            .rules(template.getDefaultRules())
            .equipmentRequired(template.getRequiredEquipment())
            .skillLevel(request.skillLevel())
            .location(request.location())
            .time(request.time())
            .latitude(request.latitude())
            .longitude(request.longitude())
            .pricePerPlayer(request.pricePerPlayer())
            .user(owner)
            .build();
            
        // Apply template-specific settings
        game.setTotalCost(calculateTotalCost(game));
        
        Game saved = gameRepository.save(game);
        
        // Create teams based on template
        createTeamsFromTemplate(saved, template);
        
        // Update template popularity
        template.setPopularity(template.getPopularity() + 1);
        repository.save(template);
        
        return mapper.toGameDetailsDTO(saved);
    }
    
    private void createTeamsFromTemplate(Game game, GameTemplate template) {
        List<String> teamColors = List.of("#FF0000", "#0000FF", "#00FF00", "#FFFF00", "#FF00FF", "#00FFFF");
        
        for (int i = 1; i <= template.getTotalTeams(); i++) {
            Team team = Team.builder()
                .game(game)
                .teamName("Team " + (char)('A' + i - 1))  // Team A, Team B, etc.
                .teamNumber(i)
                .teamColor(teamColors.get((i - 1) % teamColors.size()))
                .formationStrategy(FormationStrategy.SKILL_BALANCED)
                .build();
            teamRepository.save(team);
        }
    }
}
```

**TeamFormationService.java:**
```java
@Service  
@RequiredArgsConstructor
@Transactional
public class TeamFormationService {
    
    private final TeamRepository teamRepository;
    private final GameParticipationRepository participationRepository;
    private final UserRepository userRepository;
    
    public void autoBalanceTeams(Long gameId) {
        Game game = gameRepository.findById(gameId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Game not found"));
            
        List<Team> teams = teamRepository.findByGameId(gameId);
        List<User> participants = participationRepository.findConfirmedParticipantsByGameId(gameId);
        
        if (teams.isEmpty() || participants.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No teams or participants found");
        }
        
        // Clear existing assignments
        teams.forEach(team -> team.getMembers().clear());
        
        // Sort participants by skill level (highest to lowest)
        List<User> sortedParticipants = participants.stream()
            .sorted((a, b) -> Double.compare(getSkillLevel(b), getSkillLevel(a)))
            .toList();
            
        // Snake draft algorithm for balanced teams
        int teamIndex = 0;
        int direction = 1;
        
        for (User participant : sortedParticipants) {
            Team currentTeam = teams.get(teamIndex);
            
            // Add participant to team
            TeamMember member = TeamMember.builder()
                .team(currentTeam)
                .user(participant) 
                .joinedTeamAt(OffsetDateTime.now())
                .build();
            currentTeam.getMembers().add(member);
            
            // Move to next team using snake pattern
            teamIndex += direction;
            if (teamIndex >= teams.size() || teamIndex < 0) {
                direction *= -1;
                teamIndex += direction;
            }
        }
        
        // Assign captains and calculate team stats
        teams.forEach(this::assignCaptainAndCalculateStats);
        
        // Save all teams
        teamRepository.saveAll(teams);
    }
    
    private void assignCaptainAndCalculateStats(Team team) {
        if (team.getMembers().isEmpty()) return;
        
        // Find highest skilled player for captain
        User captain = team.getMembers().stream()
            .map(TeamMember::getUser)
            .max((a, b) -> Double.compare(getSkillLevel(a), getSkillLevel(b)))
            .orElse(null);
            
        team.setCaptain(captain);
        
        // Calculate average skill level
        double avgSkill = team.getMembers().stream()
            .mapToDouble(member -> getSkillLevel(member.getUser()))
            .average()
            .orElse(0.0);
        team.setAverageSkillLevel(avgSkill);
        
        // Mark as balanced
        team.setIsBalanced(true);
    }
    
    private double getSkillLevel(User user) {
        // Convert skill level string to numeric value for calculations
        return switch (user.getSkillLevel() != null ? user.getSkillLevel().toLowerCase() : "beginner") {
            case "pro" -> 4.0;
            case "advanced" -> 3.0; 
            case "intermediate" -> 2.0;
            case "beginner" -> 1.0;
            default -> 1.0;
        };
    }
}
```

### 1.4 API Controllers

**GameTemplateController.java:**
```java
@RestController
@RequestMapping("/games/templates")
@RequiredArgsConstructor
@Tag(name = "Game Templates")
public class GameTemplateController {
    
    private final GameTemplateService gameTemplateService;
    
    @GetMapping
    public ResponseEntity<List<GameTemplateDTO>> getAllTemplates() {
        return ResponseEntity.ok(gameTemplateService.getAllActiveTemplates());
    }
    
    @GetMapping("/sport/{sport}")
    public ResponseEntity<List<GameTemplateDTO>> getTemplatesBySport(@PathVariable String sport) {
        return ResponseEntity.ok(gameTemplateService.getTemplatesBySport(sport));
    }
    
    @PostMapping("/create-game") 
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GameDetailsDTO> createGameFromTemplate(
        @Valid @RequestBody CreateGameFromTemplateRequest request,
        Principal principal
    ) {
        User owner = userService.findByUsername(principal.getName());
        GameDetailsDTO game = gameTemplateService.createGameFromTemplate(request, owner);
        return ResponseEntity.created(URI.create("/games/" + game.id())).body(game);
    }
}
```

**TeamManagementController.java:**
```java
@RestController
@RequestMapping("/games/{gameId}/teams")
@RequiredArgsConstructor  
@Tag(name = "Team Management")
public class TeamManagementController {
    
    private final TeamFormationService teamFormationService;
    private final TeamRepository teamRepository;
    
    @PostMapping("/balance")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<List<TeamDTO>> autoBalanceTeams(
        @PathVariable Long gameId,
        Principal principal
    ) {
        // Verify user has permission to balance teams (game owner or admin)
        gameService.validateGameOwnership(gameId, principal.getName());
        
        teamFormationService.autoBalanceTeams(gameId);
        List<TeamDTO> teams = teamRepository.findByGameIdWithMembers(gameId)
            .stream()
            .map(mapper::toTeamDTO)
            .toList();
            
        return ResponseEntity.ok(teams);
    }
    
    @GetMapping
    public ResponseEntity<List<TeamDTO>> getTeams(@PathVariable Long gameId) {
        List<TeamDTO> teams = teamRepository.findByGameIdWithMembers(gameId)
            .stream()
            .map(mapper::toTeamDTO)  
            .toList();
        return ResponseEntity.ok(teams);
    }
    
    @PostMapping("/shuffle")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TeamDTO>> shuffleTeams(
        @PathVariable Long gameId,
        Principal principal
    ) {
        gameService.validateGameOwnership(gameId, principal.getName());
        teamFormationService.shuffleTeams(gameId);
        return getTeams(gameId);
    }
}
```

## Phase 2: App Owner Dashboard & Bulk Operations (Week 3-4)

### 2.1 App Owner Service Layer

**OwnerDashboardService.java:**
```java
@Service
@RequiredArgsConstructor
@Transactional
public class OwnerDashboardService {
    
    private final GameRepository gameRepository;
    private final VenueBookingRepository venueBookingRepository;
    private final PaymentService paymentService;
    
    public OwnerDashboardDTO getOwnerDashboard(Long ownerId, LocalDate fromDate, LocalDate toDate) {
        // Get owner's games
        List<Game> ownerGames = gameRepository.findByUserIdAndTimeRange(ownerId, fromDate, toDate);
        
        // Calculate metrics
        OwnerMetrics metrics = calculateOwnerMetrics(ownerGames);
        
        // Get upcoming games
        List<GameSummaryDTO> upcomingGames = ownerGames.stream()
            .filter(g -> g.getTime().isAfter(OffsetDateTime.now()))
            .limit(10)
            .map(mapper::toGameSummaryDTO)
            .toList();
            
        // Get revenue data
        RevenueData revenueData = calculateRevenueData(ownerGames);
        
        return OwnerDashboardDTO.builder()
            .metrics(metrics)
            .upcomingGames(upcomingGames)  
            .revenueData(revenueData)
            .build();
    }
    
    public BulkGameCreationResult createGamesFromTemplate(BulkGameCreationRequest request, User owner) {
        GameTemplate template = gameTemplateRepository.findById(request.templateId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Template not found"));
            
        List<Game> createdGames = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        
        for (BulkGameSlot slot : request.timeSlots()) {
            try {
                // Check venue availability
                boolean available = venueBookingService.checkAvailability(
                    slot.venueId(), slot.startTime(), slot.endTime()).isAvailable();
                    
                if (!available) {
                    errors.add("Venue " + slot.venueId() + " not available for " + slot.startTime());
                    continue;
                }
                
                // Create game from template
                Game game = buildGameFromTemplate(template, slot, owner, request);
                Game saved = gameRepository.save(game);
                
                // Create venue booking
                VenueBooking booking = createVenueBooking(slot, saved, owner);
                venueBookingRepository.save(booking);
                
                // Create teams
                createTeamsFromTemplate(saved, template);
                
                createdGames.add(saved);
                
            } catch (Exception e) {
                errors.add("Failed to create game for " + slot.startTime() + ": " + e.getMessage());
            }
        }
        
        return BulkGameCreationResult.builder()
            .createdGames(createdGames.stream().map(mapper::toGameSummaryDTO).toList())
            .errors(errors)
            .totalRequested(request.timeSlots().size())
            .totalCreated(createdGames.size())
            .build();
    }
}
```

### 2.2 App Owner APIs

**OwnerDashboardController.java:**
```java
@RestController
@RequestMapping("/owner")
@RequiredArgsConstructor
@PreAuthorize("hasRole('GAME_OWNER') or hasRole('ADMIN')")
@Tag(name = "App Owner Dashboard")
public class OwnerDashboardController {
    
    private final OwnerDashboardService dashboardService;
    private final BulkGameService bulkGameService;
    
    @GetMapping("/dashboard")
    public ResponseEntity<OwnerDashboardDTO> getDashboard(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        Principal principal
    ) {
        User owner = userService.findByUsername(principal.getName());
        LocalDate from = fromDate != null ? fromDate : LocalDate.now().minusMonths(1);
        LocalDate to = toDate != null ? toDate : LocalDate.now().plusMonths(1);
        
        OwnerDashboardDTO dashboard = dashboardService.getOwnerDashboard(owner.getId(), from, to);
        return ResponseEntity.ok(dashboard);
    }
    
    @PostMapping("/games/bulk-create")
    @RateLimiter(name = "bulk-operations")
    public ResponseEntity<BulkGameCreationResult> bulkCreateGames(
        @Valid @RequestBody BulkGameCreationRequest request,
        Principal principal  
    ) {
        User owner = userService.findByUsername(principal.getName());
        BulkGameCreationResult result = dashboardService.createGamesFromTemplate(request, owner);
        
        // Return 207 Multi-Status if some games failed
        HttpStatus status = result.errors().isEmpty() ? HttpStatus.CREATED : HttpStatus.MULTI_STATUS;
        return ResponseEntity.status(status).body(result);
    }
    
    @GetMapping("/venues/recommendations")
    public ResponseEntity<List<VenueRecommendationDTO>> getVenueRecommendations(
        @RequestParam String sport,
        @RequestParam String city,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime preferredTime
    ) {
        List<VenueRecommendationDTO> recommendations = venueRecommendationService
            .getRecommendationsForOwner(sport, city, preferredTime);
        return ResponseEntity.ok(recommendations);
    }
}
```

## Phase 3: Enhanced Payment & Financial System (Week 5-6)

### 3.1 Payment Splitting Implementation

**PaymentSplittingService.java:**
```java
@Service
@RequiredArgsConstructor
@Transactional  
public class PaymentSplittingService {
    
    public PaymentSplitResult calculateGamePaymentSplit(Long gameId) {
        Game game = gameRepository.findById(gameId).orElseThrow();
        List<User> participants = getConfirmedParticipants(gameId);
        
        BigDecimal totalCost = game.getTotalCost();
        BigDecimal baseAmount = totalCost.divide(BigDecimal.valueOf(participants.size()), 2, RoundingMode.HALF_UP);
        
        // Calculate individual amounts (could include dynamic pricing)
        List<PlayerPayment> payments = participants.stream()
            .map(participant -> PlayerPayment.builder()
                .userId(participant.getId())
                .username(participant.getUsername()) 
                .baseAmount(baseAmount)
                .finalAmount(calculateFinalAmount(participant, baseAmount, game))
                .paymentStatus(PaymentStatus.PENDING)
                .build())
            .toList();
            
        return PaymentSplitResult.builder()
            .gameId(gameId)
            .totalGameCost(totalCost)
            .playerPayments(payments)
            .splitCalculatedAt(OffsetDateTime.now())
            .build();
    }
    
    public void processPlayerPayments(Long gameId) {
        PaymentSplitResult split = calculateGamePaymentSplit(gameId);
        
        for (PlayerPayment payment : split.playerPayments()) {
            try {
                String paymentIntentId = paymentService.createPaymentIntent(
                    payment.userId(), payment.finalAmount(), gameId);
                    
                // Update participant record with payment details
                updateParticipantPayment(gameId, payment.userId(), payment.finalAmount(), paymentIntentId);
                
            } catch (Exception e) {
                log.error("Failed to create payment for user {} in game {}: {}", 
                    payment.userId(), gameId, e.getMessage());
            }
        }
    }
}
```

### 3.2 Financial Management APIs

**PaymentSplittingController.java:**
```java
@RestController
@RequestMapping("/games/{gameId}/payments")  
@RequiredArgsConstructor
@Tag(name = "Payment Management")
public class PaymentSplittingController {
    
    private final PaymentSplittingService paymentSplittingService;
    
    @GetMapping("/split")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentSplitResult> getPaymentSplit(@PathVariable Long gameId, Principal principal) {
        // Verify user can view payment info (game owner or participant)
        gameAccessService.validateGameAccess(gameId, principal.getName());
        
        PaymentSplitResult split = paymentSplittingService.calculateGamePaymentSplit(gameId);
        return ResponseEntity.ok(split);
    }
    
    @PostMapping("/process")
    @PreAuthorize("isAuthenticated()")
    @RateLimiter(name = "payment-processing")
    public ResponseEntity<PaymentProcessingResult> processPayments(@PathVariable Long gameId, Principal principal) {
        // Only game owner can trigger payment processing
        gameService.validateGameOwnership(gameId, principal.getName());
        
        PaymentProcessingResult result = paymentSplittingService.processPlayerPayments(gameId);
        return ResponseEntity.ok(result);
    }
}
```

## Phase 4: Enhanced Mobile Experience (Week 7-8)

### 4.1 Mobile-Optimized APIs

**MobileGameDiscoveryController.java:**
```java
@RestController
@RequestMapping("/mobile/games")
@RequiredArgsConstructor
@Tag(name = "Mobile Game Discovery")
public class MobileGameDiscoveryController {
    
    @GetMapping("/quick-join")
    public ResponseEntity<List<QuickJoinGameDTO>> getQuickJoinOptions(
        @RequestParam Double lat,
        @RequestParam Double lon, 
        @RequestParam(required = false) String sport,
        @RequestParam(defaultValue = "10") Integer radiusKm,
        @RequestParam(defaultValue = "10") Integer limit
    ) {
        List<QuickJoinGameDTO> games = gameDiscoveryService.findQuickJoinGames(lat, lon, sport, radiusKm, limit);
        return ResponseEntity.ok(games);
    }
    
    @GetMapping("/trending")
    public ResponseEntity<List<TrendingGameDTO>> getTrendingGames(
        @RequestParam String city,
        @RequestParam(required = false) String sport,
        @RequestParam(defaultValue = "24") Integer hoursAhead
    ) {
        List<TrendingGameDTO> trending = gameDiscoveryService.getTrendingGames(city, sport, hoursAhead);
        return ResponseEntity.ok(trending);
    }
    
    @PostMapping("/{gameId}/quick-join")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<QuickJoinResult> quickJoinGame(
        @PathVariable Long gameId,
        @RequestBody QuickJoinRequest request,
        Principal principal
    ) {
        User user = userService.findByUsername(principal.getName());
        QuickJoinResult result = gameService.quickJoinGame(gameId, user, request);
        return ResponseEntity.ok(result);
    }
}
```

### 4.2 Real-time Updates Enhancement

**GameUpdateWebSocketController.java:**
```java
@Controller
@RequiredArgsConstructor
public class GameUpdateWebSocketController {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final GameAccessService gameAccessService;
    
    @MessageMapping("/games/{gameId}/team-balance")
    @SendTo("/topic/games/{gameId}/teams")
    public TeamBalanceUpdate handleTeamBalance(@DestinationVariable Long gameId, Principal principal) {
        // Validate access
        gameAccessService.validateGameAccess(gameId, principal.getName());
        
        // Trigger team balancing
        teamFormationService.autoBalanceTeams(gameId);
        
        // Send update to all game participants
        List<TeamDTO> teams = teamRepository.findByGameIdWithMembers(gameId)
            .stream()
            .map(mapper::toTeamDTO)
            .toList();
            
        return TeamBalanceUpdate.builder()
            .gameId(gameId)
            .teams(teams)
            .balancedAt(OffsetDateTime.now())
            .balancedBy(principal.getName())
            .build();
    }
    
    @EventListener
    public void handleGameRegistration(GameRegistrationEvent event) {
        // Notify all game participants when someone joins
        messagingTemplate.convertAndSend(
            "/topic/games/" + event.getGameId() + "/participants",
            ParticipantUpdateMessage.builder()
                .gameId(event.getGameId())
                .participantAdded(event.getParticipant())
                .currentCount(event.getCurrentCount())
                .maxCapacity(event.getMaxCapacity())
                .timestamp(OffsetDateTime.now())
                .build()
        );
    }
}
```

## Phase 5: Advanced Features & Optimization (Week 9-10)

### 5.1 AI-Enhanced Recommendations

**EnhancedRecommendationService.java:**
```java
@Service
@RequiredArgsConstructor
public class EnhancedRecommendationService {
    
    public Page<GameSummaryDTO> getPersonalizedRecommendations(User user, PersonalizationRequest request) {
        // Analyze user history
        UserGameHistory history = analyzeUserGameHistory(user);
        
        // Get template preferences  
        List<GameTemplate> preferredTemplates = getPreferredTemplates(user, history);
        
        // Find games matching preferences
        List<Game> candidateGames = findCandidateGames(user, preferredTemplates, request);
        
        // Apply ML scoring
        List<GameRecommendation> scoredGames = mlRecommendationService.scoreGames(user, candidateGames);
        
        // Sort by score and return top results
        List<GameSummaryDTO> recommendations = scoredGames.stream()
            .sorted((a, b) -> Double.compare(b.getScore(), a.getScore()))
            .limit(request.limit())
            .map(rec -> mapper.toGameSummaryDTO(rec.getGame()))
            .toList();
            
        return new PageImpl<>(recommendations);
    }
}
```

### 5.2 Performance Optimizations

**Caching Strategy:**
```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        RedisCacheManager.Builder builder = RedisCacheManager.RedisCacheManagerBuilder
            .fromConnectionFactory(redisConnectionFactory())
            .cacheDefaults(cacheConfiguration());
            
        return builder.build();
    }
    
    private RedisCacheConfiguration cacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30))
            .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));
    }
}

// Apply caching annotations
@Service
public class CachedGameService {
    
    @Cacheable(cacheNames = "game-templates", key = "#sport")
    public List<GameTemplateDTO> getTemplatesBySport(String sport) { /* ... */ }
    
    @Cacheable(cacheNames = "nearby-games", key = "#lat + ':' + #lon + ':' + #radiusKm")
    public List<GameSummaryDTO> findNearbyGames(double lat, double lon, double radiusKm) { /* ... */ }
    
    @CacheEvict(cacheNames = {"game-details", "nearby-games"}, allEntries = true)
    public Game updateGame(Game game) { /* ... */ }
}
```

## Implementation Timeline

### Week 1: Foundation
- [ ] Create GameTemplate entity and repository
- [ ] Implement basic template CRUD operations
- [ ] Create Team entity and relationships
- [ ] Add database migration scripts

### Week 2: Team Formation
- [ ] Implement TeamFormationService with balancing algorithm
- [ ] Create team management APIs
- [ ] Add team assignment to game registration flow
- [ ] Unit tests for team formation logic

### Week 3: App Owner Dashboard  
- [ ] Implement OwnerDashboardService
- [ ] Create owner-specific APIs and controllers
- [ ] Add bulk game creation functionality
- [ ] Owner analytics and reporting

### Week 4: Bulk Operations
- [ ] Venue booking integration with game creation
- [ ] Bulk venue availability checking
- [ ] Error handling and partial success scenarios  
- [ ] Owner workflow optimization

### Week 5: Payment Enhancement
- [ ] Implement payment splitting logic
- [ ] Create payment processing APIs
- [ ] Add payment status tracking
- [ ] Refund and cancellation handling

### Week 6: Financial Management
- [ ] Owner revenue tracking
- [ ] Commission and fee management
- [ ] Financial reporting and analytics
- [ ] Payment method management

### Week 7: Mobile APIs
- [ ] Mobile-optimized discovery endpoints
- [ ] Quick join functionality
- [ ] Push notification integration
- [ ] Offline support preparation

### Week 8: Real-time Features
- [ ] Enhanced WebSocket events
- [ ] Live team balancing updates  
- [ ] Real-time payment status
- [ ] Live game status updates

### Week 9: ML & Recommendations
- [ ] Enhanced recommendation algorithms
- [ ] User behavior analysis
- [ ] Template popularity tracking
- [ ] Personalization engine

### Week 10: Performance & Polish  
- [ ] Cache optimization
- [ ] Database query optimization
- [ ] Load testing and performance tuning
- [ ] Final integration testing

## Success Criteria

### Technical Metrics
- [ ] API response times < 200ms (95th percentile)
- [ ] Database queries optimized with proper indexing
- [ ] 99.9% uptime for critical user flows
- [ ] Mobile app load time < 3 seconds

### Business Metrics  
- [ ] Game creation time reduced by 70%
- [ ] User registration conversion rate > 85%
- [ ] Payment processing success rate > 95%
- [ ] Team balance satisfaction score > 4.0/5.0

### User Experience
- [ ] One-tap game joining from discovery
- [ ] Real-time team updates without refresh
- [ ] Automated payment splitting
- [ ] Personalized game recommendations

---

This implementation plan builds systematically on your existing strong foundation while adding the sophisticated features needed to compete with industry leaders like Plei and Good Rec. Each phase delivers tangible value while maintaining code quality and system reliability.