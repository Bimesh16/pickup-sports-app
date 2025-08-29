package com.bmessi.pickupsportsapp.controller.game;

import com.bmessi.pickupsportsapp.dto.GameDetailsDTO;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.service.game.GameSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.security.Principal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Advanced search controller for games with sophisticated filtering capabilities.
 * 
 * This controller provides enhanced search endpoints beyond the basic game listing,
 * offering multiple ways to discover games based on various criteria.
 */
@RestController
@RequestMapping("/games/search")
@RequiredArgsConstructor
@Validated
@Tag(name = "Game Search", description = "Advanced game search and filtering")
public class GameSearchController {

    private final GameSearchService gameSearchService;
    private final ApiMapper mapper;

    /**
     * Advanced search with multiple filter criteria.
     */
    @Operation(summary = "Advanced game search with multiple filters")
    @GetMapping("/advanced")
    public ResponseEntity<Page<GameDetailsDTO>> advancedSearch(
            @Parameter(description = "Sport type (partial match)")
            @RequestParam(required = false) String sport,
            
            @Parameter(description = "Location (partial match)")
            @RequestParam(required = false) String location,
            
            @Parameter(description = "Start time range (from)")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromTime,
            
            @Parameter(description = "Start time range (to)")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toTime,
            
            @Parameter(description = "Skill level")
            @RequestParam(required = false) String skillLevel,
            
            @Parameter(description = "Game type")
            @RequestParam(required = false) Game.GameType gameType,
            
            @Parameter(description = "Minimum capacity")
            @RequestParam(required = false) @Min(1) @Max(100) Integer minCapacity,
            
            @Parameter(description = "Maximum capacity")
            @RequestParam(required = false) @Min(1) @Max(100) Integer maxCapacity,
            
            @Parameter(description = "Maximum price per player")
            @RequestParam(required = false) @DecimalMin("0") BigDecimal maxPrice,
            
            @Parameter(description = "Only free games")
            @RequestParam(required = false) Boolean onlyFree,
            
            @Parameter(description = "Only games with available spots")
            @RequestParam(required = false) Boolean onlyAvailable,
            
            @Parameter(description = "Only games with waitlist enabled")
            @RequestParam(required = false) Boolean hasWaitlist,
            
            @Parameter(description = "Only public games")
            @RequestParam(required = false) Boolean onlyPublic,
            
            @Parameter(description = "Weather dependent games")
            @RequestParam(required = false) Boolean weatherDependent,
            
            @Parameter(description = "Games with equipment provided")
            @RequestParam(required = false) Boolean equipmentProvided,
            
            @Parameter(description = "Free text search (sport, location, description)")
            @RequestParam(required = false) String search,
            
            @Parameter(description = "Order by popularity (participant count)")
            @RequestParam(required = false) Boolean orderByPopularity,
            
            @Parameter(hidden = true) @PageableDefault(size = 20) Pageable pageable) {

        GameSearchService.GameSearchCriteria criteria = new GameSearchService.GameSearchCriteria();
        criteria.setSport(sport);
        criteria.setLocation(location);
        criteria.setFromTime(fromTime);
        criteria.setToTime(toTime);
        criteria.setSkillLevel(skillLevel);
        criteria.setGameType(gameType);
        criteria.setMinCapacity(minCapacity);
        criteria.setMaxCapacity(maxCapacity);
        criteria.setMaxPricePerPlayer(maxPrice);
        criteria.setOnlyFreeGames(onlyFree);
        criteria.setOnlyAvailable(onlyAvailable);
        criteria.setHasWaitlist(hasWaitlist);
        criteria.setOnlyPublic(onlyPublic);
        criteria.setWeatherDependent(weatherDependent);
        criteria.setEquipmentProvided(equipmentProvided);
        criteria.setSearchText(search);
        criteria.setOrderByPopularity(orderByPopularity);

        Page<Game> games = gameSearchService.searchGames(criteria, pageable);
        Page<GameDetailsDTO> dtos = games.map(mapper::toGameDetailsDTO);

        return ResponseEntity.ok()
                .header("Cache-Control", "private, max-age=60")
                .body(dtos);
    }

    /**
     * Find games by proximity to a location.
     */
    @Operation(summary = "Find games near a specific location")
    @GetMapping("/nearby")
    public ResponseEntity<Page<GameDetailsDTO>> findNearby(
            @Parameter(description = "Latitude", required = true)
            @RequestParam @DecimalMin("-90") @DecimalMax("90") Double latitude,
            
            @Parameter(description = "Longitude", required = true)
            @RequestParam @DecimalMin("-180") @DecimalMax("180") Double longitude,
            
            @Parameter(description = "Search radius in kilometers")
            @RequestParam(defaultValue = "10") @DecimalMin("0.1") @DecimalMax("100") Double radiusKm,
            
            @Parameter(description = "Sport type filter")
            @RequestParam(required = false) String sport,
            
            @Parameter(description = "Skill level filter")
            @RequestParam(required = false) String skillLevel,
            
            @Parameter(description = "Only available games")
            @RequestParam(required = false) Boolean onlyAvailable,
            
            @Parameter(hidden = true) @PageableDefault(size = 20) Pageable pageable) {

        GameSearchService.GameSearchCriteria criteria = new GameSearchService.GameSearchCriteria();
        criteria.setSport(sport);
        criteria.setSkillLevel(skillLevel);
        criteria.setOnlyAvailable(onlyAvailable);

        Page<Game> games = gameSearchService.findNearbyGames(latitude, longitude, radiusKm, criteria, pageable);
        Page<GameDetailsDTO> dtos = games.map(mapper::toGameDetailsDTO);

        return ResponseEntity.ok()
                .header("Cache-Control", "private, max-age=120")
                .body(dtos);
    }

    /**
     * Find available games (with open spots).
     */
    @Operation(summary = "Find games with available spots")
    @GetMapping("/available")
    public ResponseEntity<Page<GameDetailsDTO>> findAvailable(
            @Parameter(description = "Sport type filter")
            @RequestParam(required = false) String sport,
            
            @Parameter(description = "Location filter")
            @RequestParam(required = false) String location,
            
            @Parameter(description = "Skill level filter")
            @RequestParam(required = false) String skillLevel,
            
            @Parameter(description = "Maximum price per player")
            @RequestParam(required = false) @DecimalMin("0") BigDecimal maxPrice,
            
            @Parameter(description = "Starting from time")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromTime,
            
            @Parameter(hidden = true) @PageableDefault(size = 20) Pageable pageable) {

        GameSearchService.GameSearchCriteria criteria = new GameSearchService.GameSearchCriteria();
        criteria.setSport(sport);
        criteria.setLocation(location);
        criteria.setSkillLevel(skillLevel);
        criteria.setMaxPricePerPlayer(maxPrice);
        criteria.setFromTime(fromTime != null ? fromTime : OffsetDateTime.now());

        Page<Game> games = gameSearchService.findAvailableGames(criteria, pageable);
        Page<GameDetailsDTO> dtos = games.map(mapper::toGameDetailsDTO);

        return ResponseEntity.ok()
                .header("Cache-Control", "private, max-age=60")
                .body(dtos);
    }

    /**
     * Find trending/popular games.
     */
    @Operation(summary = "Find trending games by popularity")
    @GetMapping("/trending")
    public ResponseEntity<Page<GameDetailsDTO>> findTrending(
            @Parameter(description = "Sport type filter")
            @RequestParam(required = false) String sport,
            
            @Parameter(description = "Location filter")
            @RequestParam(required = false) String location,
            
            @Parameter(description = "Time range - from")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromTime,
            
            @Parameter(description = "Time range - to")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toTime,
            
            @Parameter(hidden = true) @PageableDefault(size = 20) Pageable pageable) {

        GameSearchService.GameSearchCriteria criteria = new GameSearchService.GameSearchCriteria();
        criteria.setSport(sport);
        criteria.setLocation(location);
        criteria.setFromTime(fromTime != null ? fromTime : OffsetDateTime.now());
        criteria.setToTime(toTime);

        Page<Game> games = gameSearchService.findTrendingGames(criteria, pageable);
        Page<GameDetailsDTO> dtos = games.map(mapper::toGameDetailsDTO);

        return ResponseEntity.ok()
                .header("Cache-Control", "private, max-age=300") // 5 minutes for trending
                .body(dtos);
    }

    /**
     * Find games starting soon.
     */
    @Operation(summary = "Find games starting in the next few hours")
    @GetMapping("/upcoming")
    public ResponseEntity<Page<GameDetailsDTO>> findUpcoming(
            @Parameter(description = "Hours ahead to search")
            @RequestParam(defaultValue = "24") @Min(1) @Max(168) int hoursAhead,
            
            @Parameter(description = "Sport type filter")
            @RequestParam(required = false) String sport,
            
            @Parameter(description = "Location filter")
            @RequestParam(required = false) String location,
            
            @Parameter(description = "Only available games")
            @RequestParam(required = false) Boolean onlyAvailable,
            
            @Parameter(hidden = true) @PageableDefault(size = 20) Pageable pageable) {

        GameSearchService.GameSearchCriteria criteria = new GameSearchService.GameSearchCriteria();
        criteria.setSport(sport);
        criteria.setLocation(location);
        criteria.setOnlyAvailable(onlyAvailable);

        Page<Game> games = gameSearchService.findUpcomingGames(hoursAhead, criteria, pageable);
        Page<GameDetailsDTO> dtos = games.map(mapper::toGameDetailsDTO);

        return ResponseEntity.ok()
                .header("Cache-Control", "private, max-age=300") // 5 minutes for upcoming
                .body(dtos);
    }

    /**
     * Find recommendations for a user (excludes their own games).
     */
    @Operation(summary = "Find recommended games for authenticated user")
    @GetMapping("/recommendations")
    public ResponseEntity<Page<GameDetailsDTO>> findRecommendations(
            @Parameter(description = "Preferred sport")
            @RequestParam(required = false) String preferredSport,
            
            @Parameter(description = "Preferred skill level")
            @RequestParam(required = false) String preferredSkillLevel,
            
            @Parameter(description = "Maximum distance in km")
            @RequestParam(required = false) @DecimalMin("0.1") @DecimalMax("100") Double maxDistance,
            
            @Parameter(description = "User's latitude for proximity")
            @RequestParam(required = false) @DecimalMin("-90") @DecimalMax("90") Double userLatitude,
            
            @Parameter(description = "User's longitude for proximity")
            @RequestParam(required = false) @DecimalMin("-180") @DecimalMax("180") Double userLongitude,
            
            @Parameter(hidden = true) Principal principal,
            @Parameter(hidden = true) @PageableDefault(size = 20) Pageable pageable) {

        // Extract user ID from principal to exclude their games
        Long userId = extractUserIdFromPrincipal(principal);

        GameSearchService.GameSearchCriteria criteria = new GameSearchService.GameSearchCriteria();
        criteria.setSport(preferredSport);
        criteria.setSkillLevel(preferredSkillLevel);
        criteria.setOnlyAvailable(true); // Only recommend available games
        criteria.setOnlyPublic(true); // Only public games in recommendations
        criteria.setExcludeCreatorId(userId); // Don't recommend user's own games
        
        if (userLatitude != null && userLongitude != null) {
            criteria.setLatitude(userLatitude);
            criteria.setLongitude(userLongitude);
            criteria.setRadiusKm(maxDistance != null ? maxDistance : 25.0); // Default 25km
        }

        Page<Game> games = gameSearchService.searchGames(criteria, pageable);
        Page<GameDetailsDTO> dtos = games.map(mapper::toGameDetailsDTO);

        return ResponseEntity.ok()
                .header("Cache-Control", "private, max-age=600") // 10 minutes for recommendations
                .body(dtos);
    }

    /**
     * Extract user ID from the authentication principal.
     * This is a simplified version - adjust based on your authentication setup.
     */
    private Long extractUserIdFromPrincipal(Principal principal) {
        if (principal == null) return null;
        
        // This would depend on your authentication implementation
        // For example, if principal.getName() returns username, you'd need to look up the user
        // For JWT tokens, you might extract user ID directly from the token
        // Placeholder implementation:
        try {
            return Long.parseLong(principal.getName());
        } catch (NumberFormatException e) {
            // If principal name is username, you'd need UserRepository lookup
            return null;
        }
    }
}