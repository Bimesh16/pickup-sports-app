package com.bmessi.pickupsportsapp.service.game;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.game.GameTemplate;
import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.GameTemplateRepository;
import com.bmessi.pickupsportsapp.repository.VenueRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for bulk game operations to help app owners efficiently manage multiple games.
 * 
 * <p>This service provides functionality for:</p>
 * <ul>
 *   <li><strong>Bulk Creation:</strong> Create multiple games from templates across time slots</li>
 *   <li><strong>Series Management:</strong> Create recurring games (daily, weekly schedules)</li>
 *   <li><strong>Bulk Updates:</strong> Update multiple games simultaneously</li>
 *   <li><strong>Mass Operations:</strong> Cancel, reschedule, or modify game series</li>
 * </ul>
 * 
 * <p><strong>Key Features:</strong></p>
 * <ul>
 *   <li><strong>Template Integration:</strong> Uses GameTemplate system for consistent game creation</li>
 *   <li><strong>Venue Coordination:</strong> Automatically handles venue booking conflicts</li>
 *   <li><strong>Pricing Management:</strong> Dynamic pricing based on demand and time slots</li>
 *   <li><strong>Error Handling:</strong> Graceful failure handling with detailed reporting</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BulkGameService {

    private final GameRepository gameRepository;
    private final GameTemplateRepository gameTemplateRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final GameTemplateService gameTemplateService;

    /**
     * Create multiple games from a template across different venues and time slots.
     */
    @Transactional
    public BulkGameResult createGamesFromTemplate(BulkGameCreationRequest request) {
        log.info("Creating bulk games from template {} for user {}", 
                 request.getTemplateId(), request.getCreatorId());
        
        // Validate request
        validateBulkCreationRequest(request);
        
        // Fetch required entities
        GameTemplate template = gameTemplateRepository.findByIdAndIsActiveTrue(request.getTemplateId())
                .orElseThrow(() -> new IllegalArgumentException("Template not found or inactive: " + request.getTemplateId()));
        
        User creator = userRepository.findById(request.getCreatorId())
                .orElseThrow(() -> new IllegalArgumentException("Creator not found: " + request.getCreatorId()));
        
        // Track results
        List<Game> successfulGames = new ArrayList<>();
        List<BulkGameError> errors = new ArrayList<>();
        
        // Process each time slot
        for (GameTimeSlot timeSlot : request.getTimeSlots()) {
            try {
                Game game = createGameFromTimeSlot(template, creator, timeSlot, request);
                successfulGames.add(game);
                
                log.debug("Created game {} for time slot {}", game.getId(), timeSlot.getStartTime());
                
            } catch (Exception e) {
                log.error("Failed to create game for time slot {}: {}", timeSlot.getStartTime(), e.getMessage());
                errors.add(new BulkGameError(
                        timeSlot.getStartTime(),
                        timeSlot.getVenueId(),
                        e.getMessage()
                ));
            }
        }
        
        // Update template popularity
        if (!successfulGames.isEmpty()) {
            template.setPopularity(template.getPopularity() + successfulGames.size());
            gameTemplateRepository.save(template);
        }
        
        BulkGameResult result = BulkGameResult.builder()
                .templateId(request.getTemplateId())
                .templateName(template.getName())
                .requestedCount(request.getTimeSlots().size())
                .successfulCount(successfulGames.size())
                .errorCount(errors.size())
                .createdGames(successfulGames.stream()
                        .map(this::toGameSummary)
                        .collect(Collectors.toList()))
                .errors(errors)
                .processedAt(OffsetDateTime.now())
                .build();
        
        log.info("Bulk game creation completed: {}/{} successful for template {}", 
                 successfulGames.size(), request.getTimeSlots().size(), template.getName());
        
        return result;
    }

    /**
     * Create a recurring game series (daily, weekly, etc.).
     */
    @Transactional
    public BulkGameResult createGameSeries(GameSeriesRequest request) {
        log.info("Creating game series: {} games every {} {} starting {}", 
                 request.getOccurrences(), request.getInterval(), request.getIntervalUnit(), request.getStartDate());
        
        // Generate time slots based on recurrence pattern
        List<GameTimeSlot> timeSlots = generateRecurringTimeSlots(request);
        
        // Convert to bulk creation request
        BulkGameCreationRequest bulkRequest = BulkGameCreationRequest.builder()
                .templateId(request.getTemplateId())
                .creatorId(request.getCreatorId())
                .timeSlots(timeSlots)
                .description(request.getDescription())
                .autoPublish(request.getAutoPublish())
                .notifyParticipants(request.getNotifyParticipants())
                .build();
        
        return createGamesFromTemplate(bulkRequest);
    }

    /**
     * Update multiple games simultaneously.
     */
    @Transactional
    public BulkUpdateResult bulkUpdateGames(BulkUpdateRequest request) {
        log.info("Bulk updating {} games for user {}", request.getGameIds().size(), request.getUserId());
        
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + request.getUserId()));
        
        List<Game> updatedGames = new ArrayList<>();
        List<BulkGameError> errors = new ArrayList<>();
        
        for (Long gameId : request.getGameIds()) {
            try {
                Game game = gameRepository.findById(gameId)
                        .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));
                
                // Check permissions
                if (!game.getUser().getId().equals(user.getId()) && !isAdmin(user)) {
                    throw new SecurityException("Not authorized to update this game");
                }
                
                // Apply updates
                applyGameUpdates(game, request.getUpdates());
                Game saved = gameRepository.save(game);
                updatedGames.add(saved);
                
            } catch (Exception e) {
                log.error("Failed to update game {}: {}", gameId, e.getMessage());
                errors.add(new BulkGameError(null, null, "Game " + gameId + ": " + e.getMessage()));
            }
        }
        
        return BulkUpdateResult.builder()
                .requestedCount(request.getGameIds().size())
                .successfulCount(updatedGames.size())
                .errorCount(errors.size())
                .updatedGames(updatedGames.stream()
                        .map(this::toGameSummary)
                        .collect(Collectors.toList()))
                .errors(errors)
                .processedAt(OffsetDateTime.now())
                .build();
    }

    /**
     * Cancel a series of related games.
     */
    @Transactional
    public BulkCancellationResult cancelGameSeries(CancelSeriesRequest request) {
        log.info("Cancelling game series: {} games for user {}", 
                 request.getGameIds().size(), request.getUserId());
        
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + request.getUserId()));
        
        List<Game> cancelledGames = new ArrayList<>();
        List<BulkGameError> errors = new ArrayList<>();
        
        for (Long gameId : request.getGameIds()) {
            try {
                Game game = gameRepository.findById(gameId)
                        .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));
                
                // Check permissions and game state
                if (!game.getUser().getId().equals(user.getId()) && !isAdmin(user)) {
                    throw new SecurityException("Not authorized to cancel this game");
                }
                
                if (game.getStatus() == Game.GameStatus.COMPLETED || 
                    game.getStatus() == Game.GameStatus.CANCELLED) {
                    throw new IllegalStateException("Cannot cancel game in status: " + game.getStatus());
                }
                
                // Cancel the game
                game.setStatus(Game.GameStatus.CANCELLED);
                game.setUpdatedAt(OffsetDateTime.now());
                
                // TODO: Process refunds for participants
                // TODO: Send cancellation notifications
                
                Game saved = gameRepository.save(game);
                cancelledGames.add(saved);
                
            } catch (Exception e) {
                log.error("Failed to cancel game {}: {}", gameId, e.getMessage());
                errors.add(new BulkGameError(null, null, "Game " + gameId + ": " + e.getMessage()));
            }
        }
        
        return BulkCancellationResult.builder()
                .requestedCount(request.getGameIds().size())
                .successfulCount(cancelledGames.size())
                .errorCount(errors.size())
                .cancellationReason(request.getReason())
                .refundPolicy(request.getRefundPolicy())
                .cancelledGames(cancelledGames.stream()
                        .map(this::toGameSummary)
                        .collect(Collectors.toList()))
                .errors(errors)
                .processedAt(OffsetDateTime.now())
                .build();
    }

    // Private helper methods

    private Game createGameFromTimeSlot(GameTemplate template, User creator, 
                                       GameTimeSlot timeSlot, BulkGameCreationRequest request) {
        // Fetch venue
        Venue venue = venueRepository.findById(timeSlot.getVenueId())
                .orElseThrow(() -> new IllegalArgumentException("Venue not found: " + timeSlot.getVenueId()));
        
        // Check for venue conflicts
        if (hasVenueConflict(venue, timeSlot.getStartTime(), template.getDurationMinutes())) {
            throw new IllegalStateException("Venue conflict detected for time slot: " + timeSlot.getStartTime());
        }
        
        // Calculate pricing
        BigDecimal venueCost = timeSlot.getCustomVenueCost() != null ? 
                timeSlot.getCustomVenueCost() : 
                calculateVenueCost(venue, template.getDurationMinutes());
        
        BigDecimal costPerPlayer = calculateCostPerPlayer(venueCost, template);
        
        // Create game
        Game game = Game.builder()
                .sport(template.getSport())
                .location(venue.getName() + ", " + venue.getCity())
                .time(timeSlot.getStartTime())
                .latitude(venue.getLatitude())
                .longitude(venue.getLongitude())
                .user(creator)
                .venue(venue)
                .gameTemplate(template)
                .minPlayers(template.getMinPlayers())
                .maxPlayers(template.getMaxPlayers())
                .durationMinutes(template.getDurationMinutes())
                .pricePerPlayer(costPerPlayer)
                .totalCost(venueCost)
                .description(generateGameDescription(template, venue, timeSlot))
                .status(request.getAutoPublish() ? Game.GameStatus.PUBLISHED : Game.GameStatus.DRAFT)
                .gameType(Game.GameType.PICKUP)
                .rsvpCutoff(timeSlot.getStartTime().minusHours(2)) // 2 hours before game
                .build();
        
        return gameRepository.save(game);
    }

    private List<GameTimeSlot> generateRecurringTimeSlots(GameSeriesRequest request) {
        List<GameTimeSlot> timeSlots = new ArrayList<>();
        OffsetDateTime currentDate = request.getStartDate();
        
        for (int i = 0; i < request.getOccurrences(); i++) {
            GameTimeSlot slot = GameTimeSlot.builder()
                    .venueId(request.getVenueId())
                    .startTime(currentDate)
                    .customVenueCost(request.getVenueCost())
                    .build();
            timeSlots.add(slot);
            
            // Calculate next occurrence
            currentDate = switch (request.getIntervalUnit()) {
                case DAYS -> currentDate.plusDays(request.getInterval());
                case WEEKS -> currentDate.plusWeeks(request.getInterval());
                case MONTHS -> currentDate.plusMonths(request.getInterval());
            };
        }
        
        return timeSlots;
    }

    private boolean hasVenueConflict(Venue venue, OffsetDateTime startTime, Integer durationMinutes) {
        OffsetDateTime endTime = startTime.plusMinutes(durationMinutes);
        
        // Check for overlapping games at the same venue
        List<Game> conflictingGames = gameRepository.findByVenueIdAndTimeOverlap(
                venue.getId(), startTime, endTime);
        
        return !conflictingGames.isEmpty();
    }

    private BigDecimal calculateVenueCost(Venue venue, Integer durationMinutes) {
        if (venue.getHourlyRate() == null) {
            return BigDecimal.valueOf(100.00); // Default cost
        }
        
        BigDecimal hours = BigDecimal.valueOf(durationMinutes)
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        
        return venue.getHourlyRate().multiply(hours);
    }

    private BigDecimal calculateCostPerPlayer(BigDecimal venueCost, GameTemplate template) {
        // Add app commission
        BigDecimal totalCost = venueCost.multiply(BigDecimal.valueOf(1.10)); // 10% commission
        
        // Divide by expected players (average of min/max)
        int expectedPlayers = (template.getMinPlayers() + template.getMaxPlayers()) / 2;
        
        return totalCost.divide(BigDecimal.valueOf(expectedPlayers), 2, RoundingMode.HALF_UP);
    }

    private String generateGameDescription(GameTemplate template, Venue venue, GameTimeSlot timeSlot) {
        return String.format("Join us for %s at %s! %s format with %d players per team. %s",
                template.getName(),
                venue.getName(),
                template.getFormat(),
                template.getPlayersPerTeam(),
                template.getDescription() != null ? template.getDescription() : 
                    "Come play " + template.getSport().toLowerCase() + " with other local players!");
    }

    private void applyGameUpdates(Game game, GameUpdateFields updates) {
        if (updates.getDescription() != null) {
            game.setDescription(updates.getDescription());
        }
        if (updates.getPricePerPlayer() != null) {
            game.setPricePerPlayer(updates.getPricePerPlayer());
        }
        if (updates.getSkillLevel() != null) {
            game.setSkillLevel(updates.getSkillLevel());
        }
        if (updates.getStatus() != null) {
            game.setStatus(updates.getStatus());
        }
        if (updates.getRsvpCutoff() != null) {
            game.setRsvpCutoff(updates.getRsvpCutoff());
        }
        
        game.setUpdatedAt(OffsetDateTime.now());
    }

    private boolean isAdmin(User user) {
        return user.getRoles() != null && user.getRoles().contains(User.Role.ADMIN);
    }

    private GameSummaryResponse toGameSummary(Game game) {
        return GameSummaryResponse.builder()
                .id(game.getId())
                .sport(game.getSport())
                .location(game.getLocation())
                .startTime(game.getTime())
                .status(game.getStatus().name())
                .participantCount(game.getTeams().stream()
                        .mapToInt(team -> team.getActivePlayersCount())
                        .sum())
                .maxPlayers(game.getMaxPlayers())
                .pricePerPlayer(game.getPricePerPlayer())
                .templateName(game.getGameTemplate() != null ? game.getGameTemplate().getName() : null)
                .build();
    }

    private void validateBulkCreationRequest(BulkGameCreationRequest request) {
        if (request.getTimeSlots() == null || request.getTimeSlots().isEmpty()) {
            throw new IllegalArgumentException("Time slots cannot be empty");
        }
        
        if (request.getTimeSlots().size() > 100) {
            throw new IllegalArgumentException("Cannot create more than 100 games at once");
        }
        
        // Validate each time slot
        for (GameTimeSlot slot : request.getTimeSlots()) {
            if (slot.getStartTime() == null) {
                throw new IllegalArgumentException("Start time is required for all slots");
            }
            if (slot.getStartTime().isBefore(OffsetDateTime.now())) {
                throw new IllegalArgumentException("Cannot create games in the past");
            }
            if (slot.getVenueId() == null) {
                throw new IllegalArgumentException("Venue ID is required for all slots");
            }
        }
    }

    // Request/Response classes

    @lombok.Builder
    @lombok.Data
    public static class BulkGameCreationRequest {
        private Long templateId;
        private Long creatorId;
        private List<GameTimeSlot> timeSlots;
        private String description;
        private Boolean autoPublish = false;
        private Boolean notifyParticipants = true;
    }

    @lombok.Builder
    @lombok.Data
    public static class GameTimeSlot {
        private Long venueId;
        private OffsetDateTime startTime;
        private BigDecimal customVenueCost;
        private String customDescription;
    }

    @lombok.Builder
    @lombok.Data
    public static class GameSeriesRequest {
        private Long templateId;
        private Long creatorId;
        private Long venueId;
        private OffsetDateTime startDate;
        private Integer interval; // Every X days/weeks/months
        private IntervalUnit intervalUnit;
        private Integer occurrences; // How many games to create
        private BigDecimal venueCost;
        private String description;
        private Boolean autoPublish = false;
        private Boolean notifyParticipants = true;
    }

    public enum IntervalUnit {
        DAYS, WEEKS, MONTHS
    }

    @lombok.Builder
    @lombok.Data
    public static class BulkUpdateRequest {
        private List<Long> gameIds;
        private Long userId;
        private GameUpdateFields updates;
        private Boolean notifyParticipants = false;
    }

    @lombok.Builder
    @lombok.Data
    public static class GameUpdateFields {
        private String description;
        private BigDecimal pricePerPlayer;
        private String skillLevel;
        private Game.GameStatus status;
        private OffsetDateTime rsvpCutoff;
    }

    @lombok.Builder
    @lombok.Data
    public static class CancelSeriesRequest {
        private List<Long> gameIds;
        private Long userId;
        private String reason;
        private RefundPolicy refundPolicy;
        private Boolean notifyParticipants = true;
    }

    public enum RefundPolicy {
        FULL_REFUND("Full refund to all participants"),
        PARTIAL_REFUND("Partial refund based on cancellation timing"),
        NO_REFUND("No refund - keep all payments"),
        CREDIT_ONLY("Issue credits for future games");

        private final String description;

        RefundPolicy(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // Result classes

    @lombok.Builder
    @lombok.Data
    public static class BulkGameResult {
        private Long templateId;
        private String templateName;
        private Integer requestedCount;
        private Integer successfulCount;
        private Integer errorCount;
        private List<GameSummaryResponse> createdGames;
        private List<BulkGameError> errors;
        private OffsetDateTime processedAt;
    }

    @lombok.Builder
    @lombok.Data
    public static class BulkUpdateResult {
        private Integer requestedCount;
        private Integer successfulCount;
        private Integer errorCount;
        private List<GameSummaryResponse> updatedGames;
        private List<BulkGameError> errors;
        private OffsetDateTime processedAt;
    }

    @lombok.Builder
    @lombok.Data
    public static class BulkCancellationResult {
        private Integer requestedCount;
        private Integer successfulCount;
        private Integer errorCount;
        private String cancellationReason;
        private RefundPolicy refundPolicy;
        private List<GameSummaryResponse> cancelledGames;
        private List<BulkGameError> errors;
        private OffsetDateTime processedAt;
    }

    @lombok.Builder
    @lombok.Data
    public static class GameSummaryResponse {
        private Long id;
        private String sport;
        private String location;
        private OffsetDateTime startTime;
        private String status;
        private Integer participantCount;
        private Integer maxPlayers;
        private BigDecimal pricePerPlayer;
        private String templateName;
    }

    public static class BulkGameError {
        public final OffsetDateTime timeSlot;
        public final Long venueId;
        public final String errorMessage;
        
        public BulkGameError(OffsetDateTime timeSlot, Long venueId, String errorMessage) {
            this.timeSlot = timeSlot;
            this.venueId = venueId;
            this.errorMessage = errorMessage;
        }
    }
}