package com.bmessi.pickupsportsapp.service.game;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.game.GameTemplate;
import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.repository.GameTemplateRepository;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing game templates that define standard game formats.
 * 
 * <p>This service provides functionality for:</p>
 * <ul>
 *   <li>Creating and managing reusable game templates</li>
 *   <li>Applying templates to create new games</li>
 *   <li>Template validation and business rule enforcement</li>
 *   <li>Popular template tracking and recommendations</li>
 * </ul>
 * 
 * <p><strong>Key Features:</strong></p>
 * <ul>
 *   <li><strong>Template Management:</strong> CRUD operations for game templates</li>
 *   <li><strong>Game Creation:</strong> Create games from templates with venue and pricing</li>
 *   <li><strong>Popularity Tracking:</strong> Track template usage for recommendations</li>
 *   <li><strong>Validation:</strong> Ensure templates meet business requirements</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GameTemplateService {

    private final GameTemplateRepository gameTemplateRepository;
    private final GameRepository gameRepository;
    private final VenueRepository venueRepository;

    /**
     * Create a new game template.
     */
    @Transactional
    @CacheEvict(cacheNames = {"game-templates", "popular-templates"}, allEntries = true)
    public GameTemplate createTemplate(CreateTemplateRequest request) {
        log.info("Creating new game template: {}", request.getName());
        
        // Validate template configuration
        validateTemplateRequest(request);
        
        GameTemplate template = GameTemplate.builder()
                .name(request.getName())
                .sport(request.getSport())
                .format(request.getFormat())
                .description(request.getDescription())
                .playersPerTeam(request.getPlayersPerTeam())
                .totalTeams(request.getTotalTeams())
                .minPlayers(request.getMinPlayers())
                .maxPlayers(request.getMaxPlayers())
                .substituteSlots(request.getSubstituteSlots())
                .durationMinutes(request.getDurationMinutes())
                .defaultRules(request.getDefaultRules())
                .requiredEquipment(request.getRequiredEquipment())
                .positions(request.getPositions())
                .skillBalancingRequired(request.getSkillBalancingRequired())
                .captainAssignmentRequired(request.getCaptainAssignmentRequired())
                .positionAssignmentRequired(request.getPositionAssignmentRequired())
                .requiresEvenTeams(request.getRequiresEvenTeams())
                .createdBy(request.getCreatedBy())
                .build();

        return gameTemplateRepository.save(template);
    }

    /**
     * Get all templates for a specific sport.
     */
    @Cacheable(cacheNames = "game-templates", key = "#sport")
    @Transactional(readOnly = true)
    public List<GameTemplate> getTemplatesForSport(String sport) {
        log.debug("Fetching templates for sport: {}", sport);
        return gameTemplateRepository.findBySportIgnoreCaseAndIsActiveTrue(sport);
    }

    /**
     * Get template by ID.
     */
    @Cacheable(cacheNames = "game-templates", key = "#id")  
    @Transactional(readOnly = true)
    public Optional<GameTemplate> getTemplateById(Long id) {
        return gameTemplateRepository.findByIdAndIsActiveTrue(id);
    }

    /**
     * Get most popular templates across all sports.
     */
    @Cacheable(cacheNames = "popular-templates", key = "#limit")
    @Transactional(readOnly = true) 
    public List<GameTemplate> getMostPopularTemplates(int limit) {
        log.debug("Fetching {} most popular templates", limit);
        return gameTemplateRepository.findTopByIsActiveTrueOrderByPopularityDesc(limit);
    }

    /**
     * Create a game from a template.
     */
    @Transactional
    public Game createGameFromTemplate(ApplyTemplateRequest request) {
        log.info("Creating game from template ID: {} at venue: {}", 
                 request.getTemplateId(), request.getVenueId());
        
        // Fetch and validate template
        GameTemplate template = gameTemplateRepository.findByIdAndIsActiveTrue(request.getTemplateId())
                .orElseThrow(() -> new IllegalArgumentException("Template not found or inactive: " + request.getTemplateId()));
        
        // Fetch and validate venue
        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new IllegalArgumentException("Venue not found: " + request.getVenueId()));

        // Calculate pricing
        BigDecimal totalCost = request.getVenueCost() != null ? request.getVenueCost() : venue.getBasePricePerHour();
        BigDecimal costPerPlayer = calculateCostPerPlayer(totalCost, template);

        // Create game using template
        Game game = Game.builder()
                .sport(template.getSport())
                .location(venue.getName() + ", " + venue.getCity())
                .time(request.getStartTime())
                .latitude(venue.getLatitude())
                .longitude(venue.getLongitude())
                .user(request.getCreator())
                .venue(venue)
                .gameTemplate(template)
                .minPlayers(template.getMinPlayers())
                .maxPlayers(template.getMaxPlayers())
                .durationMinutes(template.getDurationMinutes())
                .pricePerPlayer(costPerPlayer)
                .totalCost(totalCost)
                .description(request.getDescription() != null ? 
                           request.getDescription() : generateTemplateDescription(template, venue))
                .status(Game.GameStatus.DRAFT) // Start as draft until published
                .gameType(Game.GameType.PICKUP)
                .build();

        Game savedGame = gameRepository.save(game);
        
        // Increment template popularity
        template.incrementPopularity();
        gameTemplateRepository.save(template);
        
        log.info("Created game {} from template {} at venue {}", 
                 savedGame.getId(), template.getName(), venue.getName());
        
        return savedGame;
    }

    /**
     * Get all active templates for owner dashboard.
     */
    @Cacheable(cacheNames = "owner-templates")
    @Transactional(readOnly = true)
    public List<GameTemplate> getTemplatesForOwner() {
        return gameTemplateRepository.findByIsActiveTrueOrderByPopularityDescNameAsc();
    }

    /**
     * Update an existing template.
     */
    @Transactional
    @CacheEvict(cacheNames = {"game-templates", "popular-templates", "owner-templates"}, allEntries = true)
    public GameTemplate updateTemplate(Long templateId, UpdateTemplateRequest request) {
        log.info("Updating template: {}", templateId);
        
        GameTemplate template = gameTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + templateId));
        
        // Update fields that are provided
        if (request.getName() != null) template.setName(request.getName());
        if (request.getDescription() != null) template.setDescription(request.getDescription());
        if (request.getDurationMinutes() != null) template.setDurationMinutes(request.getDurationMinutes());
        if (request.getDefaultRules() != null) template.setDefaultRules(request.getDefaultRules());
        if (request.getRequiredEquipment() != null) template.setRequiredEquipment(request.getRequiredEquipment());
        if (request.getSkillBalancingRequired() != null) template.setSkillBalancingRequired(request.getSkillBalancingRequired());
        if (request.getCaptainAssignmentRequired() != null) template.setCaptainAssignmentRequired(request.getCaptainAssignmentRequired());
        
        return gameTemplateRepository.save(template);
    }

    /**
     * Deactivate a template (soft delete).
     */
    @Transactional
    @CacheEvict(cacheNames = {"game-templates", "popular-templates", "owner-templates"}, allEntries = true)
    public void deactivateTemplate(Long templateId) {
        log.info("Deactivating template: {}", templateId);
        
        GameTemplate template = gameTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + templateId));
        
        template.setIsActive(false);
        gameTemplateRepository.save(template);
    }

    /**
     * Check if template can accommodate given number of players.
     */
    public boolean canTemplateAccommodate(Long templateId, int playerCount) {
        return getTemplateById(templateId)
                .map(template -> template.canAccommodate(playerCount))
                .orElse(false);
    }

    /**
     * Get templates suitable for a given player count.
     */
    @Transactional(readOnly = true)
    public List<GameTemplate> getTemplatesForPlayerCount(String sport, int playerCount) {
        return gameTemplateRepository.findBySportIgnoreCaseAndIsActiveTrueAndMinPlayersLessThanEqualAndMaxPlayersGreaterThanEqual(
                sport, playerCount, playerCount);
    }

    // Private helper methods

    private void validateTemplateRequest(CreateTemplateRequest request) {
        if (request.getMinPlayers() > request.getMaxPlayers()) {
            throw new IllegalArgumentException("Minimum players cannot exceed maximum players");
        }
        
        int totalRequiredPlayers = request.getPlayersPerTeam() * request.getTotalTeams();
        if (request.getMaxPlayers() < totalRequiredPlayers) {
            throw new IllegalArgumentException("Maximum players insufficient for team configuration");
        }
        
        if (request.getMinPlayers() < Math.max(2, totalRequiredPlayers / 2)) {
            throw new IllegalArgumentException("Minimum players too low for meaningful game");
        }
    }

    private BigDecimal calculateCostPerPlayer(BigDecimal totalCost, GameTemplate template) {
        if (totalCost == null || totalCost.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        
        // Add 10% app commission
        BigDecimal totalWithCommission = totalCost.multiply(BigDecimal.valueOf(1.10));
        
        // Divide by expected number of players (use average of min/max)
        int expectedPlayers = (template.getMinPlayers() + template.getMaxPlayers()) / 2;
        
        return totalWithCommission.divide(BigDecimal.valueOf(expectedPlayers), 2, java.math.RoundingMode.HALF_UP);
    }

    private String generateTemplateDescription(GameTemplate template, Venue venue) {
        return String.format("%s at %s. %s format with %d players per team. %s", 
                template.getName(),
                venue.getName(), 
                template.getFormat(),
                template.getPlayersPerTeam(),
                template.getDescription() != null ? template.getDescription() : 
                    "Join other players for organized " + template.getSport().toLowerCase() + "!");
    }

    // Request DTOs (would typically be in separate files)
    
    public static class CreateTemplateRequest {
        private String name;
        private String sport;
        private String format;
        private String description;
        private Integer playersPerTeam;
        private Integer totalTeams = 2;
        private Integer minPlayers;
        private Integer maxPlayers;
        private Integer substituteSlots = 0;
        private Integer durationMinutes;
        private String defaultRules;
        private String requiredEquipment;
        private String positions;
        private Boolean skillBalancingRequired = true;
        private Boolean captainAssignmentRequired = true;
        private Boolean positionAssignmentRequired = false;
        private Boolean requiresEvenTeams = true;
        private String createdBy;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSport() { return sport; }
        public void setSport(String sport) { this.sport = sport; }
        public String getFormat() { return format; }
        public void setFormat(String format) { this.format = format; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Integer getPlayersPerTeam() { return playersPerTeam; }
        public void setPlayersPerTeam(Integer playersPerTeam) { this.playersPerTeam = playersPerTeam; }
        public Integer getTotalTeams() { return totalTeams; }
        public void setTotalTeams(Integer totalTeams) { this.totalTeams = totalTeams; }
        public Integer getMinPlayers() { return minPlayers; }
        public void setMinPlayers(Integer minPlayers) { this.minPlayers = minPlayers; }
        public Integer getMaxPlayers() { return maxPlayers; }
        public void setMaxPlayers(Integer maxPlayers) { this.maxPlayers = maxPlayers; }
        public Integer getSubstituteSlots() { return substituteSlots; }
        public void setSubstituteSlots(Integer substituteSlots) { this.substituteSlots = substituteSlots; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
        public String getDefaultRules() { return defaultRules; }
        public void setDefaultRules(String defaultRules) { this.defaultRules = defaultRules; }
        public String getRequiredEquipment() { return requiredEquipment; }
        public void setRequiredEquipment(String requiredEquipment) { this.requiredEquipment = requiredEquipment; }
        public String getPositions() { return positions; }
        public void setPositions(String positions) { this.positions = positions; }
        public Boolean getSkillBalancingRequired() { return skillBalancingRequired; }
        public void setSkillBalancingRequired(Boolean skillBalancingRequired) { this.skillBalancingRequired = skillBalancingRequired; }
        public Boolean getCaptainAssignmentRequired() { return captainAssignmentRequired; }
        public void setCaptainAssignmentRequired(Boolean captainAssignmentRequired) { this.captainAssignmentRequired = captainAssignmentRequired; }
        public Boolean getPositionAssignmentRequired() { return positionAssignmentRequired; }
        public void setPositionAssignmentRequired(Boolean positionAssignmentRequired) { this.positionAssignmentRequired = positionAssignmentRequired; }
        public Boolean getRequiresEvenTeams() { return requiresEvenTeams; }
        public void setRequiresEvenTeams(Boolean requiresEvenTeams) { this.requiresEvenTeams = requiresEvenTeams; }
        public String getCreatedBy() { return createdBy; }
        public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    }

    public static class ApplyTemplateRequest {
        private Long templateId;
        private Long venueId;
        private OffsetDateTime startTime;
        private BigDecimal venueCost;
        private String description;
        private com.bmessi.pickupsportsapp.entity.User creator;
        
        // Getters and setters
        public Long getTemplateId() { return templateId; }
        public void setTemplateId(Long templateId) { this.templateId = templateId; }
        public Long getVenueId() { return venueId; }
        public void setVenueId(Long venueId) { this.venueId = venueId; }
        public OffsetDateTime getStartTime() { return startTime; }
        public void setStartTime(OffsetDateTime startTime) { this.startTime = startTime; }
        public BigDecimal getVenueCost() { return venueCost; }
        public void setVenueCost(BigDecimal venueCost) { this.venueCost = venueCost; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public com.bmessi.pickupsportsapp.entity.User getCreator() { return creator; }
        public void setCreator(com.bmessi.pickupsportsapp.entity.User creator) { this.creator = creator; }
    }

    public static class UpdateTemplateRequest {
        private String name;
        private String description;
        private Integer durationMinutes;
        private String defaultRules;
        private String requiredEquipment;
        private Boolean skillBalancingRequired;
        private Boolean captainAssignmentRequired;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
        public String getDefaultRules() { return defaultRules; }
        public void setDefaultRules(String defaultRules) { this.defaultRules = defaultRules; }
        public String getRequiredEquipment() { return requiredEquipment; }
        public void setRequiredEquipment(String requiredEquipment) { this.requiredEquipment = requiredEquipment; }
        public Boolean getSkillBalancingRequired() { return skillBalancingRequired; }
        public void setSkillBalancingRequired(Boolean skillBalancingRequired) { this.skillBalancingRequired = skillBalancingRequired; }
        public Boolean getCaptainAssignmentRequired() { return captainAssignmentRequired; }
        public void setCaptainAssignmentRequired(Boolean captainAssignmentRequired) { this.captainAssignmentRequired = captainAssignmentRequired; }
    }
}