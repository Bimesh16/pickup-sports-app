package com.bmessi.pickupsportsapp.controller.game;

import com.bmessi.pickupsportsapp.entity.game.GameTemplate;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.service.game.GameTemplateService;
import com.bmessi.pickupsportsapp.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * REST controller for game template management.
 * 
 * <p>This controller provides endpoints for:</p>
 * <ul>
 *   <li><strong>Template Discovery:</strong> Browse available game templates</li>
 *   <li><strong>Template Management:</strong> CRUD operations for templates</li>
 *   <li><strong>Game Creation:</strong> Apply templates to create new games</li>
 *   <li><strong>Analytics:</strong> Template usage and popularity metrics</li>
 * </ul>
 * 
 * <p><strong>Security:</strong></p>
 * <ul>
 *   <li>Public endpoints for template browsing</li>
 *   <li>Admin-only endpoints for template creation/modification</li>
 *   <li>Owner-level endpoints for game creation from templates</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/game-templates")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Game Templates", description = "Game template management and application")
public class GameTemplateController {

    private final GameTemplateService gameTemplateService;

    /**
     * Get all active game templates.
     */
    @GetMapping
    @Operation(summary = "List all active game templates")
    public ResponseEntity<List<GameTemplate>> getAllTemplates() {
        log.debug("Fetching all active game templates");
        // For now, return all - in production might want pagination
        List<GameTemplate> templates = gameTemplateService.getTemplatesForOwner();
        return ResponseEntity.ok()
                .header("Cache-Control", "public, max-age=300") // 5 minutes cache
                .body(templates);
    }

    /**
     * Get templates for a specific sport.
     */
    @GetMapping("/sport/{sport}")
    @Operation(summary = "Get game templates for a specific sport")
    public ResponseEntity<List<GameTemplate>> getTemplatesForSport(
            @Parameter(description = "Sport name (e.g., Soccer, Basketball)")
            @PathVariable String sport) {
        log.debug("Fetching templates for sport: {}", sport);
        
        List<GameTemplate> templates = gameTemplateService.getTemplatesForSport(sport);
        return ResponseEntity.ok()
                .header("Cache-Control", "public, max-age=600") // 10 minutes cache
                .body(templates);
    }

    /**
     * Get a specific template by ID.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get game template by ID")
    public ResponseEntity<GameTemplate> getTemplate(
            @Parameter(description = "Template ID")
            @PathVariable Long id) {
        log.debug("Fetching template: {}", id);
        
        return gameTemplateService.getTemplateById(id)
                .map(template -> ResponseEntity.ok()
                        .header("Cache-Control", "public, max-age=600")
                        .body(template))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get most popular templates.
     */
    @GetMapping("/popular")
    @Operation(summary = "Get most popular game templates")
    public ResponseEntity<List<GameTemplate>> getPopularTemplates(
            @Parameter(description = "Number of templates to return")
            @RequestParam(defaultValue = "10") int limit) {
        log.debug("Fetching {} most popular templates", limit);
        
        List<GameTemplate> popular = gameTemplateService.getMostPopularTemplates(limit);
        return ResponseEntity.ok()
                .header("Cache-Control", "public, max-age=300") // 5 minutes cache
                .body(popular);
    }

    /**
     * Create a new game template (Admin only).
     */
    @PostMapping
    @Operation(summary = "Create a new game template")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GameTemplate> createTemplate(
            @Valid @RequestBody CreateGameTemplateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Creating new game template: {} by user: {}", request.name, userDetails.getUsername());
        
        GameTemplateService.CreateTemplateRequest serviceRequest = new GameTemplateService.CreateTemplateRequest();
        serviceRequest.setName(request.name);
        serviceRequest.setSport(request.sport);
        serviceRequest.setFormat(request.format);
        serviceRequest.setDescription(request.description);
        serviceRequest.setPlayersPerTeam(request.playersPerTeam);
        serviceRequest.setTotalTeams(request.totalTeams);
        serviceRequest.setMinPlayers(request.minPlayers);
        serviceRequest.setMaxPlayers(request.maxPlayers);
        serviceRequest.setSubstituteSlots(request.substituteSlots);
        serviceRequest.setDurationMinutes(request.durationMinutes);
        serviceRequest.setDefaultRules(request.defaultRules);
        serviceRequest.setRequiredEquipment(request.requiredEquipment);
        serviceRequest.setPositions(request.positions);
        serviceRequest.setSkillBalancingRequired(request.skillBalancingRequired);
        serviceRequest.setCaptainAssignmentRequired(request.captainAssignmentRequired);
        serviceRequest.setPositionAssignmentRequired(request.positionAssignmentRequired);
        serviceRequest.setRequiresEvenTeams(request.requiresEvenTeams);
        serviceRequest.setCreatedBy(userDetails.getUsername());
        
        GameTemplate template = gameTemplateService.createTemplate(serviceRequest);
        
        return ResponseEntity.ok(template);
    }

    /**
     * Update an existing template (Admin only).
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update a game template")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GameTemplate> updateTemplate(
            @Parameter(description = "Template ID")
            @PathVariable Long id,
            @Valid @RequestBody UpdateGameTemplateRequest request) {
        log.info("Updating game template: {}", id);
        
        GameTemplateService.UpdateTemplateRequest serviceRequest = new GameTemplateService.UpdateTemplateRequest();
        serviceRequest.setName(request.name);
        serviceRequest.setDescription(request.description);
        serviceRequest.setDurationMinutes(request.durationMinutes);
        serviceRequest.setDefaultRules(request.defaultRules);
        serviceRequest.setRequiredEquipment(request.requiredEquipment);
        serviceRequest.setSkillBalancingRequired(request.skillBalancingRequired);
        serviceRequest.setCaptainAssignmentRequired(request.captainAssignmentRequired);
        
        GameTemplate updated = gameTemplateService.updateTemplate(id, serviceRequest);
        return ResponseEntity.ok(updated);
    }

    /**
     * Deactivate a template (Admin only).
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate a game template")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateTemplate(
            @Parameter(description = "Template ID")
            @PathVariable Long id) {
        log.info("Deactivating game template: {}", id);
        
        gameTemplateService.deactivateTemplate(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Apply a template to create a new game.
     */
    @PostMapping("/{id}/apply")
    @Operation(summary = "Create a game from a template")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Game> applyTemplate(
            @Parameter(description = "Template ID")
            @PathVariable Long id,
            @Valid @RequestBody ApplyTemplateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Applying template {} to create game for user: {}", id, userDetails.getUsername());
        
        GameTemplateService.ApplyTemplateRequest serviceRequest = new GameTemplateService.ApplyTemplateRequest();
        serviceRequest.setTemplateId(id);
        serviceRequest.setVenueId(request.venueId);
        serviceRequest.setStartTime(request.startTime);
        serviceRequest.setVenueCost(request.venueCost);
        serviceRequest.setDescription(request.description);
        
        // Get User entity from UserDetails
        User creator = User.builder()
                .id(userDetails.getId())
                .username(userDetails.getUsername())
                .build();
        serviceRequest.setCreator(creator);
        
        Game game = gameTemplateService.createGameFromTemplate(serviceRequest);
        
        return ResponseEntity.ok(game);
    }

    /**
     * Check if template can accommodate player count.
     */
    @GetMapping("/{id}/validate")
    @Operation(summary = "Validate if template can accommodate player count")
    public ResponseEntity<TemplateValidationResponse> validateTemplate(
            @Parameter(description = "Template ID")
            @PathVariable Long id,
            @Parameter(description = "Number of players")
            @RequestParam int playerCount) {
        
        boolean canAccommodate = gameTemplateService.canTemplateAccommodate(id, playerCount);
        
        TemplateValidationResponse response = new TemplateValidationResponse(
                canAccommodate,
                canAccommodate ? "Template can accommodate " + playerCount + " players" :
                        "Template cannot accommodate " + playerCount + " players"
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get templates suitable for a player count.
     */
    @GetMapping("/suitable")
    @Operation(summary = "Get templates suitable for specific player count")
    public ResponseEntity<List<GameTemplate>> getSuitableTemplates(
            @Parameter(description = "Sport name")
            @RequestParam String sport,
            @Parameter(description = "Number of players")
            @RequestParam int playerCount) {
        log.debug("Finding suitable templates for {} with {} players", sport, playerCount);
        
        List<GameTemplate> suitable = gameTemplateService.getTemplatesForPlayerCount(sport, playerCount);
        return ResponseEntity.ok()
                .header("Cache-Control", "public, max-age=300")
                .body(suitable);
    }

    // Request/Response DTOs

    public static class CreateGameTemplateRequest {
        public String name;
        public String sport;
        public String format;
        public String description;
        public Integer playersPerTeam;
        public Integer totalTeams = 2;
        public Integer minPlayers;
        public Integer maxPlayers;
        public Integer substituteSlots = 0;
        public Integer durationMinutes;
        public String defaultRules;
        public String requiredEquipment;
        public String positions;
        public Boolean skillBalancingRequired = true;
        public Boolean captainAssignmentRequired = true;
        public Boolean positionAssignmentRequired = false;
        public Boolean requiresEvenTeams = true;
    }

    public static class UpdateGameTemplateRequest {
        public String name;
        public String description;
        public Integer durationMinutes;
        public String defaultRules;
        public String requiredEquipment;
        public Boolean skillBalancingRequired;
        public Boolean captainAssignmentRequired;
    }

    public static class ApplyTemplateRequest {
        public Long venueId;
        public OffsetDateTime startTime;
        public BigDecimal venueCost;
        public String description;
    }

    public static class TemplateValidationResponse {
        public final boolean valid;
        public final String message;
        
        public TemplateValidationResponse(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }
    }
}