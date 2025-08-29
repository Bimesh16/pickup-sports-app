package com.bmessi.pickupsportsapp.service.game;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.exception.GameValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Comprehensive validation service for game business rules and constraints.
 * 
 * This service enforces complex business logic that goes beyond simple field validation,
 * ensuring games are created and modified according to application-specific rules.
 */
@Service
@RequiredArgsConstructor
public class GameValidationService {

    /**
     * Validates a game before creation or update.
     * 
     * @param game The game to validate
     * @param isUpdate Whether this is an update operation (affects certain validations)
     * @throws GameValidationException if validation fails
     */
    public void validateGame(Game game, boolean isUpdate) {
        List<String> errors = new ArrayList<>();

        // Core field validations
        validateCoreFields(game, errors);
        
        // Business logic validations
        validatePlayerCapacity(game, errors);
        validateGameTiming(game, errors, isUpdate);
        validateLocationData(game, errors);
        validatePricingLogic(game, errors);
        validateGameTypeRules(game, errors);
        validateEquipmentRequirements(game, errors);

        if (!errors.isEmpty()) {
            throw new GameValidationException("Game validation failed", errors);
        }
    }

    /**
     * Validates core required fields beyond basic @NotNull/@NotBlank
     */
    private void validateCoreFields(Game game, List<String> errors) {
        // Sport validation
        if (game.getSport() != null && game.getSport().trim().isEmpty()) {
            errors.add("Sport cannot be empty or whitespace only");
        }

        // Location validation
        if (game.getLocation() != null && game.getLocation().trim().isEmpty()) {
            errors.add("Location cannot be empty or whitespace only");
        }

        // Skill level validation
        if (game.getSkillLevel() != null && 
            !List.of("Beginner", "Intermediate", "Advanced", "Pro", "Mixed").contains(game.getSkillLevel())) {
            errors.add("Invalid skill level. Must be one of: Beginner, Intermediate, Advanced, Pro, Mixed");
        }
    }

    /**
     * Validates player capacity logic
     */
    private void validatePlayerCapacity(Game game, List<String> errors) {
        Integer minPlayers = game.getMinPlayers();
        Integer maxPlayers = game.getMaxPlayers();
        Integer capacity = game.getCapacity();

        // Ensure min <= max players
        if (minPlayers != null && maxPlayers != null && minPlayers > maxPlayers) {
            errors.add("Minimum players cannot exceed maximum players");
        }

        // If capacity is set, it should align with max players
        if (capacity != null && maxPlayers != null && capacity != maxPlayers) {
            errors.add("Capacity should match maximum players");
        }

        // Set capacity to maxPlayers if not explicitly set
        if (capacity == null && maxPlayers != null) {
            game.setCapacity(maxPlayers);
        }

        // Validate reasonable player counts based on sport
        validateSportSpecificPlayerCounts(game, errors);
    }

    /**
     * Validates sport-specific player count rules
     */
    private void validateSportSpecificPlayerCounts(Game game, List<String> errors) {
        if (game.getSport() == null) return;

        String sport = game.getSport().toLowerCase();
        Integer maxPlayers = game.getMaxPlayers();

        if (maxPlayers == null) return;

        switch (sport) {
            case "soccer", "football":
                if (maxPlayers > 22) {
                    errors.add("Soccer games typically don't exceed 22 players (11 vs 11)");
                }
                break;
            case "basketball":
                if (maxPlayers > 10) {
                    errors.add("Basketball games typically don't exceed 10 players (5 vs 5)");
                }
                break;
            case "tennis":
                if (maxPlayers > 4) {
                    errors.add("Tennis games typically don't exceed 4 players (doubles)");
                }
                break;
            case "volleyball":
                if (maxPlayers > 12) {
                    errors.add("Volleyball games typically don't exceed 12 players (6 vs 6)");
                }
                break;
        }
    }

    /**
     * Validates game timing logic
     */
    private void validateGameTiming(Game game, List<String> errors, boolean isUpdate) {
        OffsetDateTime gameTime = game.getTime();
        OffsetDateTime rsvpCutoff = game.getRsvpCutoff();
        Integer duration = game.getDurationMinutes();

        if (gameTime == null) return;

        OffsetDateTime now = OffsetDateTime.now();

        // For new games, must be at least 30 minutes in the future
        if (!isUpdate && gameTime.isBefore(now.plusMinutes(30))) {
            errors.add("Game must be scheduled at least 30 minutes in advance");
        }

        // For updates, allow some flexibility but not in the past
        if (isUpdate && gameTime.isBefore(now.minusMinutes(15))) {
            errors.add("Cannot schedule game in the past");
        }

        // Don't allow games more than 1 year in the future
        if (gameTime.isAfter(now.plusYears(1))) {
            errors.add("Cannot schedule games more than 1 year in advance");
        }

        // RSVP cutoff must be before game time
        if (rsvpCutoff != null && rsvpCutoff.isAfter(gameTime)) {
            errors.add("RSVP cutoff must be before game start time");
        }

        // Default RSVP cutoff to 2 hours before game if not set
        if (rsvpCutoff == null && gameTime.isAfter(now.plusHours(2))) {
            game.setRsvpCutoff(gameTime.minusHours(2));
        }

        // Validate duration
        if (duration != null) {
            if (duration < 15) {
                errors.add("Game duration must be at least 15 minutes");
            }
            if (duration > 480) { // 8 hours
                errors.add("Game duration cannot exceed 8 hours");
            }
        }
    }

    /**
     * Validates location and coordinate data
     */
    private void validateLocationData(Game game, List<String> errors) {
        Double latitude = game.getLatitude();
        Double longitude = game.getLongitude();

        // If one coordinate is provided, both should be provided
        if ((latitude != null && longitude == null) || (latitude == null && longitude != null)) {
            errors.add("Both latitude and longitude must be provided together");
        }

        // Validate coordinate precision (reasonable for location accuracy)
        if (latitude != null && longitude != null) {
            // Check for unrealistic precision (more than 6 decimal places is excessive)
            String latStr = latitude.toString();
            String lonStr = longitude.toString();
            
            if (latStr.contains(".") && latStr.split("\\.")[1].length() > 6) {
                errors.add("Latitude precision should not exceed 6 decimal places");
            }
            if (lonStr.contains(".") && lonStr.split("\\.")[1].length() > 6) {
                errors.add("Longitude precision should not exceed 6 decimal places");
            }
        }
    }

    /**
     * Validates pricing logic and business rules
     */
    private void validatePricingLogic(Game game, List<String> errors) {
        var pricePerPlayer = game.getPricePerPlayer();
        var totalCost = game.getTotalCost();
        Integer maxPlayers = game.getMaxPlayers();

        // If both are set, they should be consistent
        if (pricePerPlayer != null && totalCost != null && maxPlayers != null) {
            var calculatedTotal = pricePerPlayer.multiply(java.math.BigDecimal.valueOf(maxPlayers));
            if (calculatedTotal.compareTo(totalCost) != 0) {
                errors.add("Total cost should equal price per player × maximum players");
            }
        }

        // Auto-calculate total cost if not provided
        if (pricePerPlayer != null && totalCost == null && maxPlayers != null) {
            game.setTotalCost(pricePerPlayer.multiply(java.math.BigDecimal.valueOf(maxPlayers)));
        }

        // Validate reasonable pricing
        if (pricePerPlayer != null && pricePerPlayer.compareTo(java.math.BigDecimal.valueOf(1000)) > 0) {
            errors.add("Price per player seems unusually high (>$1000)");
        }
    }

    /**
     * Validates game type specific rules
     */
    private void validateGameTypeRules(Game game, List<String> errors) {
        if (game.getGameType() == null) return;

        switch (game.getGameType()) {
            case TOURNAMENT:
                if (game.getMinPlayers() == null || game.getMinPlayers() < 4) {
                    errors.add("Tournament games should have at least 4 players");
                }
                if (game.getDurationMinutes() == null || game.getDurationMinutes() < 60) {
                    errors.add("Tournament games typically require at least 1 hour");
                }
                break;

            case TRAINING:
                if (game.getSkillLevel() == null) {
                    errors.add("Training sessions should specify a skill level");
                }
                break;

            case LEAGUE:
                if (game.getTime() != null && game.getTime().isBefore(OffsetDateTime.now().plusDays(7))) {
                    errors.add("League games should be scheduled at least 1 week in advance");
                }
                break;

            case COMPETITIVE:
                if (!"Advanced".equals(game.getSkillLevel()) && !"Pro".equals(game.getSkillLevel())) {
                    errors.add("Competitive games should be for Advanced or Pro skill levels");
                }
                break;
        }
    }

    /**
     * Validates equipment requirements consistency
     */
    private void validateEquipmentRequirements(Game game, List<String> errors) {
        String provided = game.getEquipmentProvided();
        String required = game.getEquipmentRequired();

        // Check for contradictions
        if (provided != null && required != null) {
            String providedLower = provided.toLowerCase();
            String requiredLower = required.toLowerCase();

            // Simple check for obvious contradictions
            if (providedLower.contains("balls") && requiredLower.contains("bring your own ball")) {
                errors.add("Contradiction: Equipment provided includes balls but requires bringing own ball");
            }
        }

        // Validate length limits
        if (provided != null && provided.length() > 500) {
            errors.add("Equipment provided description too long (max 500 characters)");
        }
        if (required != null && required.length() > 500) {
            errors.add("Equipment required description too long (max 500 characters)");
        }
    }

    /**
     * Validates that a user can join a specific game
     */
    public void validateUserCanJoinGame(Game game, User user) {
        List<String> errors = new ArrayList<>();

        // Check if game accepts new participants
        if (game.getStatus() != Game.GameStatus.PUBLISHED) {
            errors.add("Game is not currently accepting participants");
        }

        // Check if already joined
        if (game.getParticipants().contains(user)) {
            errors.add("User is already participating in this game");
        }

        // Check if game creator trying to join their own game
        if (game.getUser().equals(user)) {
            errors.add("Game creator is automatically a participant");
        }

        // Check capacity
        if (game.getCapacity() != null && game.getParticipants().size() >= game.getCapacity()) {
            if (!Boolean.TRUE.equals(game.getWaitlistEnabled())) {
                errors.add("Game is full and waitlist is not enabled");
            }
        }

        // Check RSVP cutoff
        if (game.getRsvpCutoff() != null && OffsetDateTime.now().isAfter(game.getRsvpCutoff())) {
            errors.add("RSVP deadline has passed");
        }

        // Check if game is in the past
        if (game.getTime() != null && game.getTime().isBefore(OffsetDateTime.now())) {
            errors.add("Cannot join a game that has already started");
        }

        if (!errors.isEmpty()) {
            throw new GameValidationException("Cannot join game", errors);
        }
    }

    /**
     * Validates game update restrictions based on current state
     */
    public void validateGameUpdateRestrictions(Game existingGame, Game updates) {
        List<String> errors = new ArrayList<>();
        OffsetDateTime now = OffsetDateTime.now();

        // If game has started, limit what can be changed
        if (existingGame.getTime() != null && existingGame.getTime().isBefore(now.plusMinutes(30))) {
            // Only allow minor updates near game time
            if (updates.getTime() != null && !updates.getTime().equals(existingGame.getTime())) {
                errors.add("Cannot change game time within 30 minutes of start");
            }
            if (updates.getLocation() != null && !updates.getLocation().equals(existingGame.getLocation())) {
                errors.add("Cannot change location within 30 minutes of start");
            }
        }

        // If game has participants, certain changes require care
        if (!existingGame.getParticipants().isEmpty()) {
            if (updates.getCapacity() != null && updates.getCapacity() < existingGame.getParticipants().size()) {
                errors.add("Cannot reduce capacity below current participant count");
            }
        }

        // Status change validations
        if (updates.getStatus() != null && updates.getStatus() != existingGame.getStatus()) {
            validateStatusTransition(existingGame.getStatus(), updates.getStatus(), errors);
        }

        if (!errors.isEmpty()) {
            throw new GameValidationException("Game update not allowed", errors);
        }
    }

    /**
     * Validates status transitions are logical
     */
    private void validateStatusTransition(Game.GameStatus from, Game.GameStatus to, List<String> errors) {
        switch (from) {
            case DRAFT:
                if (to != Game.GameStatus.PUBLISHED && to != Game.GameStatus.CANCELLED) {
                    errors.add("Draft games can only be published or cancelled");
                }
                break;
            case PUBLISHED:
                // Published games can transition to any status
                break;
            case FULL:
                if (to == Game.GameStatus.DRAFT) {
                    errors.add("Full games cannot be returned to draft status");
                }
                break;
            case CANCELLED:
                if (to != Game.GameStatus.PUBLISHED) {
                    errors.add("Cancelled games can only be republished");
                }
                break;
            case COMPLETED:
                if (to != Game.GameStatus.ARCHIVED) {
                    errors.add("Completed games can only be archived");
                }
                break;
            case ARCHIVED:
                errors.add("Archived games cannot be modified");
                break;
        }
    }
}