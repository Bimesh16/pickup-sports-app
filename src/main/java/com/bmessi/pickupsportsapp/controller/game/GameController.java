package com.bmessi.pickupsportsapp.controller.game;

import com.bmessi.pickupsportsapp.dto.CreateGameRequest;
import com.bmessi.pickupsportsapp.dto.GameDetailsDTO;
import com.bmessi.pickupsportsapp.dto.game.GameSummaryDTO;
import com.bmessi.pickupsportsapp.service.game.GameService;
import com.bmessi.pickupsportsapp.service.location.CountryDetectionService;
import com.bmessi.pickupsportsapp.web.ApiResponseUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * Global Game Controller - Base game management for all countries.
 * 
 * <p>This controller provides universal game functionality while routing
 * country-specific features to appropriate regional controllers.</p>
 * 
 * <p><strong>Country Detection:</strong></p>
 * <ul>
 *   <li>Auto-detects user location from coordinates</li>
 *   <li>Routes to country-specific endpoints when available</li>
 *   <li>Falls back to global functionality for unsupported regions</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@RestController
@RequestMapping("/api/v1/games")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Games", description = "Global game management with country-specific routing")
public class GameController {

    private final GameService gameService;
    private final CountryDetectionService countryDetectionService;

    // ==================== Global Game Management ====================

    @PostMapping
    @Operation(summary = "Create a new game", 
               description = "Creates a game with automatic country detection and routing")
    public ResponseEntity<GameDetailsDTO> createGame(
            @Valid @RequestBody CreateGameRequest request,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {
        
        log.info("Creating game: sport={}, location={}, lat={}, lon={}", 
                request.sport(), request.location(), latitude, longitude);
        
        // Auto-detect country if coordinates provided
        if (latitude != null && longitude != null) {
            String countryCode = countryDetectionService.detectCountry(latitude, longitude);
            log.info("Detected country: {} for coordinates ({}, {})", countryCode, latitude, longitude);
            
            // Route to country-specific controller if available
            if (countryCode != null) {
                return routeToCountryController(countryCode, request);
            }
        }
        
        // Fall back to global game creation
        GameDetailsDTO game = gameService.createGame(request);
        return ResponseEntity.ok(game);
    }

    @GetMapping("/{gameId}")
    @Operation(summary = "Get game details", 
               description = "Retrieves detailed information about a specific game")
    public ResponseEntity<GameDetailsDTO> getGame(@PathVariable Long gameId) {
        log.info("Getting game details for gameId: {}", gameId);
        GameDetailsDTO game = gameService.getGameById(gameId);
        return ResponseEntity.ok(game);
    }

    @GetMapping("/nearby")
    @Operation(summary = "Find nearby games", 
               description = "Discovers games near user location with country-specific filtering")
    public ResponseEntity<List<GameSummaryDTO>> findNearbyGames(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5.0") Double radiusKm,
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) String skillLevel) {
        
        log.info("Finding nearby games at ({}, {}) within {}km, sport: {}, skill: {}", 
                latitude, longitude, radiusKm, sport, skillLevel);
        
        // Auto-detect country for enhanced filtering
        String countryCode = countryDetectionService.detectCountry(latitude, longitude);
        log.info("Detected country: {} for location search", countryCode);
        
        List<GameSummaryDTO> games = gameService.findNearbyGames(
                latitude, longitude, radiusKm, sport, skillLevel, countryCode);
        return ResponseEntity.ok(games);
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending games", 
               description = "Returns trending games based on user location and preferences")
    public ResponseEntity<List<GameSummaryDTO>> getTrendingGames(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {
        
        String countryCode = null;
        if (latitude != null && longitude != null) {
            countryCode = countryDetectionService.detectCountry(latitude, longitude);
        }
        
        List<GameSummaryDTO> games = gameService.getTrendingGames(countryCode);
        return ResponseEntity.ok(games);
    }

    @PutMapping("/{gameId}")
    @Operation(summary = "Update game", 
               description = "Updates an existing game (creator only)")
    public ResponseEntity<GameDetailsDTO> updateGame(
            @PathVariable Long gameId,
            @Valid @RequestBody CreateGameRequest request) {
        
        log.info("Updating game: {}", gameId);
        GameDetailsDTO game = gameService.updateGame(gameId, request);
        return ResponseEntity.ok(game);
    }

    @DeleteMapping("/{gameId}")
    @Operation(summary = "Delete game", 
               description = "Deletes a game (creator only)")
    public ResponseEntity<Void> deleteGame(@PathVariable Long gameId) {
        log.info("Deleting game: {}", gameId);
        gameService.deleteGame(gameId);
        return ResponseEntity.noContent().build();
    }

    // ==================== Country-Specific Routing ====================

    /**
     * Routes game creation to country-specific controllers when available.
     */
    private ResponseEntity<GameDetailsDTO> routeToCountryController(String countryCode, CreateGameRequest request) {
        switch (countryCode.toUpperCase()) {
            case "NP": // Nepal
                log.info("Routing to Nepal-specific game creation");
                // This would call NepalGameController.createGame() if it exists
                // For now, fall back to global service
                break;
            case "IN": // India
                log.info("Routing to India-specific game creation");
                // Future: IndiaGameController.createGame()
                break;
            case "US": // United States
                log.info("Routing to US-specific game creation");
                // Future: USGameController.createGame()
                break;
            case "CA": // Canada
                log.info("Routing to Canada-specific game creation");
                // Future: CanadaGameController.createGame()
                break;
            case "MX": // Mexico
                log.info("Routing to Mexico-specific game creation");
                // Future: MexicoGameController.createGame()
                break;
            default:
                log.info("No country-specific controller for: {}, using global service", countryCode);
                break;
        }
        
        // Fall back to global service
        GameDetailsDTO game = gameService.createGame(request);
        return ResponseEntity.ok(game);
    }
}
