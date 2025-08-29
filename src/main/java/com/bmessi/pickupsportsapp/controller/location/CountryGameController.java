package com.bmessi.pickupsportsapp.controller.location;

import com.bmessi.pickupsportsapp.dto.game.GameSummaryDTO;
import com.bmessi.pickupsportsapp.service.location.CountryLocationService;
import com.bmessi.pickupsportsapp.service.location.CountryLocationService.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * REST Controller for country-based game discovery and location services.
 * 
 * <p>This controller enables users to discover games based on their country location,
 * get region-specific recommendations, and access country-specific sports preferences.</p>
 * 
 * <p><strong>Key Features:</strong></p>
 * <ul>
 *   <li><strong>Auto-Detection:</strong> Detect country from user's GPS coordinates</li>
 *   <li><strong>Country Games:</strong> Browse games available in specific countries</li>
 *   <li><strong>Regional Discovery:</strong> State/province level game filtering</li>
 *   <li><strong>Cultural Sports:</strong> Country-specific popular sports and formats</li>
 * </ul>
 * 
 * <p><strong>Supported Countries:</strong></p>
 * <ul>
 *   <li>🇺🇸 United States - State-based regions</li>
 *   <li>🇨🇦 Canada - Provincial regions</li>
 *   <li>🇲🇽 Mexico - State regions</li>
 *   <li>🇮🇳 India - State and metro regions</li>
 *   <li>🇳🇵 Nepal - Development regions</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 2.0.0
 */
@RestController
@RequestMapping("/games/countries")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Country-Based Game Discovery", description = "Location-based game discovery by country and region")
public class CountryGameController {

    private final CountryLocationService countryLocationService;

    /**
     * Detect user's country from GPS coordinates.
     */
    @Operation(summary = "Detect country from coordinates", 
               description = "Automatically detect country and region from GPS coordinates")
    @GetMapping("/detect")
    public ResponseEntity<CountryDetectionResult> detectCountry(
            @Parameter(description = "Latitude coordinate") 
            @RequestParam 
            @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") 
            Double lat,
            
            @Parameter(description = "Longitude coordinate") 
            @RequestParam 
            @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") 
            Double lon
    ) {
        CountryInfo countryInfo = countryLocationService.detectCountry(lat, lon);
        
        CountryDetectionResult result = CountryDetectionResult.builder()
            .countryCode(countryInfo.getCountryCode())
            .countryName(countryInfo.getCountryName())
            .region(countryInfo.getRegion())
            .timeZone(countryInfo.getTimeZone())
            .currency(countryInfo.getCurrency())
            .popularSports(countryInfo.getPopularSports())
            .coordinates(new Coordinates(lat, lon))
            .build();

        return ResponseEntity.ok(result);
    }

    /**
     * Get games available in a specific country.
     */
    @Operation(summary = "Get games by country", 
               description = "Find all games available in a specific country with optional filtering")
    @GetMapping("/{countryCode}/games")
    public ResponseEntity<Page<GameSummaryDTO>> getGamesByCountry(
            @Parameter(description = "ISO country code (US, CA, MX, IN, NP)") 
            @PathVariable 
            @Pattern(regexp = "^(US|CA|MX|IN|NP)$") 
            String countryCode,
            
            @Parameter(description = "Filter by sport") 
            @RequestParam(required = false) String sport,
            
            @Parameter(description = "Filter by skill level") 
            @RequestParam(required = false) String skillLevel,
            
            @Parameter(description = "Games from this time") 
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromTime,
            
            @Parameter(description = "Games until this time") 
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toTime,
            
            @Parameter(description = "Only show available games") 
            @RequestParam(defaultValue = "true") Boolean onlyAvailable,
            
            @Parameter(description = "Pagination parameters") 
            @PageableDefault(size = 20) Pageable pageable
    ) {
        GameFilterRequest filters = new GameFilterRequest(
            sport, skillLevel, fromTime, toTime, null, onlyAvailable);

        Page<GameSummaryDTO> games = countryLocationService.getGamesByCountry(countryCode, filters, pageable);
        return ResponseEntity.ok(games);
    }

    /**
     * Get games in a specific region within a country.
     */
    @Operation(summary = "Get games by region", 
               description = "Find games in a specific state/province/region within a country")
    @GetMapping("/{countryCode}/regions/{regionCode}/games")
    public ResponseEntity<Page<GameSummaryDTO>> getGamesByRegion(
            @Parameter(description = "ISO country code") 
            @PathVariable String countryCode,
            
            @Parameter(description = "Region/state code within the country") 
            @PathVariable String regionCode,
            
            @Parameter(description = "Filter by sport") 
            @RequestParam(required = false) String sport,
            
            @Parameter(description = "Filter by skill level") 
            @RequestParam(required = false) String skillLevel,
            
            @Parameter(description = "Games from this time") 
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromTime,
            
            @Parameter(description = "Games until this time") 
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toTime,
            
            @PageableDefault(size = 20) Pageable pageable
    ) {
        GameFilterRequest filters = new GameFilterRequest(
            sport, skillLevel, fromTime, toTime, null, true);

        Page<GameSummaryDTO> games = countryLocationService.getGamesByRegion(countryCode, regionCode, filters, pageable);
        return ResponseEntity.ok(games);
    }

    /**
     * Get trending games in a country.
     */
    @Operation(summary = "Get trending games", 
               description = "Get popular and trending games in a specific country or region")
    @GetMapping("/{countryCode}/trending")
    public ResponseEntity<List<GameSummaryDTO>> getTrendingGames(
            @Parameter(description = "ISO country code") 
            @PathVariable String countryCode,
            
            @Parameter(description = "Specific region within country") 
            @RequestParam(required = false) String region,
            
            @Parameter(description = "Filter by specific sport") 
            @RequestParam(required = false) String sport,
            
            @Parameter(description = "Maximum number of trending games") 
            @RequestParam(defaultValue = "10") 
            @Min(1) @Max(50) Integer limit
    ) {
        List<GameSummaryDTO> trendingGames = countryLocationService.getTrendingGames(
            countryCode, region, sport, limit);
        return ResponseEntity.ok(trendingGames);
    }

    /**
     * Get popular sports for a country.
     */
    @Operation(summary = "Get popular sports by country", 
               description = "Get list of popular sports and their cultural significance in a country")
    @GetMapping("/{countryCode}/popular-sports")
    public ResponseEntity<List<CountrySpotlightSport>> getPopularSports(
            @Parameter(description = "ISO country code") 
            @PathVariable String countryCode
    ) {
        List<CountrySpotlightSport> popularSports = countryLocationService.getPopularSportsForCountry(countryCode);
        return ResponseEntity.ok(popularSports);
    }

    /**
     * Update user's country preference and location.
     */
    @Operation(summary = "Update user location", 
               description = "Update user's current location and country preferences")
    @PostMapping("/users/location")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LocationUpdateResult> updateUserLocation(
            @Valid @RequestBody LocationUpdateRequest request,
            @Parameter(hidden = true) Principal principal
    ) {
        countryLocationService.updateUserLocationAndCountry(principal.getName(), request.lat(), request.lon());
        
        // Detect country from new coordinates
        CountryInfo detectedCountry = countryLocationService.detectCountry(request.lat(), request.lon());
        
        LocationUpdateResult result = LocationUpdateResult.builder()
            .success(true)
            .detectedCountry(detectedCountry.getCountryCode())
            .detectedRegion(detectedCountry.getRegion())
            .timeZone(detectedCountry.getTimeZone())
            .recommendedSports(detectedCountry.getPopularSports())
            .build();

        return ResponseEntity.ok(result);
    }

    /**
     * Get user's location preferences and history.
     */
    @Operation(summary = "Get user location preferences", 
               description = "Get user's saved locations and country preferences")
    @GetMapping("/users/preferences")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserLocationPreferences> getUserLocationPreferences(
            @Parameter(hidden = true) Principal principal
    ) {
        UserLocationPreferences preferences = countryLocationService.getUserLocationPreferences(principal.getName());
        return ResponseEntity.ok(preferences);
    }

    /**
     * Get regional game statistics.
     */
    @Operation(summary = "Get regional game statistics", 
               description = "Get game activity statistics for regions within a country")
    @GetMapping("/{countryCode}/stats")
    public ResponseEntity<CountryGameStats> getCountryGameStats(
            @Parameter(description = "ISO country code") 
            @PathVariable String countryCode,
            
            @Parameter(description = "Statistics time period") 
            @RequestParam(defaultValue = "30") 
            @Min(1) @Max(365) Integer days
    ) {
        CountryGameStats stats = countryLocationService.getCountryGameStats(countryCode, days);
        return ResponseEntity.ok(stats);
    }

    /**
     * Search games across multiple countries.
     */
    @Operation(summary = "Multi-country game search", 
               description = "Search for games across multiple countries (useful for travel)")
    @PostMapping("/search")
    public ResponseEntity<MultiCountrySearchResult> searchAcrossCountries(
            @Valid @RequestBody MultiCountrySearchRequest request
    ) {
        MultiCountrySearchResult results = countryLocationService.searchAcrossCountries(request);
        return ResponseEntity.ok(results);
    }

    // ===== REQUEST/RESPONSE DTOs =====

    @lombok.Data
    @lombok.Builder
    public static class CountryDetectionResult {
        private String countryCode;
        private String countryName;
        private String region;
        private String timeZone;
        private String currency;
        private List<CountrySpotlightSport> popularSports;
        private Coordinates coordinates;
    }

    public record Coordinates(
        @DecimalMin("-90.0") @DecimalMax("90.0") Double lat,
        @DecimalMin("-180.0") @DecimalMax("180.0") Double lon
    ) {}

    public record LocationUpdateRequest(
        @NotNull @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") Double lat,
        @NotNull @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") Double lon,
        @Size(max = 100) String address,
        Boolean setPrimary
    ) {}

    @lombok.Data
    @lombok.Builder
    public static class LocationUpdateResult {
        private Boolean success;
        private String detectedCountry;
        private String detectedRegion;
        private String timeZone;
        private List<CountrySpotlightSport> recommendedSports;
        private String message;
    }

    @lombok.Data
    @lombok.Builder
    public static class UserLocationPreferences {
        private String username;
        private String primaryCountry;
        private String primaryRegion;
        private List<String> favoriteCountries;
        private List<String> favoriteRegions;
        private Coordinates lastKnownLocation;
        private OffsetDateTime lastLocationUpdate;
        private List<CountrySpotlightSport> preferredSports;
    }

    @lombok.Data
    @lombok.Builder
    public static class CountryGameStats {
        private String countryCode;
        private String countryName;
        private Integer totalActiveGames;
        private Integer totalPlayersActive;
        private List<RegionStats> regionStats;
        private List<SportPopularity> sportPopularity;
        private Map<String, Integer> gamesByTimeSlot;
        private Double averageGamePrice;
        private Integer newGamesThisWeek;
    }

    @lombok.Data
    @lombok.Builder
    public static class RegionStats {
        private String regionCode;
        private String regionName;
        private Integer activeGames;
        private Integer activePlayers;
        private List<String> popularSports;
        private Double averagePrice;
    }

    @lombok.Data
    @lombok.Builder
    public static class SportPopularity {
        private String sport;
        private String emoji;
        private Integer activeGames;
        private Integer totalPlayers;
        private Double averageRating;
        private String trend; // "rising", "stable", "declining"
    }

    @lombok.Data
    @lombok.Builder
    public static class MultiCountrySearchRequest {
        @NotEmpty @Size(min = 1, max = 5) 
        private List<String> countries;
        
        private String sport;
        private String skillLevel;
        
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private OffsetDateTime fromTime;
        
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)  
        private OffsetDateTime toTime;
        
        @Min(1) @Max(100)
        private Integer limit = 20;
        
        private List<String> preferredCurrencies;
    }

    @lombok.Data
    @lombok.Builder
    public static class MultiCountrySearchResult {
        private Integer totalResults;
        private Map<String, CountrySearchResults> resultsByCountry;
        private List<GameSummaryDTO> combinedResults;
        private Map<String, String> currencyRates;
    }

    @lombok.Data
    @lombok.Builder
    public static class CountrySearchResults {
        private String countryCode;
        private String countryName;
        private Integer gameCount;
        private List<GameSummaryDTO> games;
        private String localCurrency;
    }
}