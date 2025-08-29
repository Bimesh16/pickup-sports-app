package com.bmessi.pickupsportsapp.controller.location;

import com.bmessi.pickupsportsapp.service.location.*;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * Simplified location services API controller for immediate functionality.
 */
@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Location Services", description = "Location-based features and analytics")
public class SimpleLocationController {

    private final LocationService locationService;
    // Note: Other services temporarily disabled for compilation
    // private final ProximityDiscoveryService proximityService;
    // private final WeatherLocationService weatherService;
    // private final LocationAnalyticsService analyticsService;

    /**
     * Find games near a location.
     * GET /api/location/games/nearby
     */
    @GetMapping("/games/nearby")
    @RateLimiter(name = "location")
    @Operation(summary = "Find nearby games", description = "Find games near specified coordinates")
    public ResponseEntity<List<LocationService.GameWithDistance>> findNearbyGames(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radius,
            @RequestParam(defaultValue = "20") int limit) {
        
        try {
            List<LocationService.GameWithDistance> games = 
                locationService.findGamesNearLocation(lat, lng, radius, limit);

            log.debug("Found {} games near ({}, {}) within {}km", games.size(), lat, lng, radius);
            return ResponseEntity.ok(games);

        } catch (Exception e) {
            log.error("Error finding nearby games: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Find venues near a location.
     * GET /api/location/venues/nearby
     */
    @GetMapping("/venues/nearby")
    @RateLimiter(name = "location")
    @Operation(summary = "Find nearby venues", description = "Find venues near specified coordinates")
    public ResponseEntity<List<LocationService.VenueWithDistance>> findNearbyVenues(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radius,
            @RequestParam(defaultValue = "20") int limit) {
        
        try {
            List<LocationService.VenueWithDistance> venues = 
                locationService.findVenuesNearLocation(lat, lng, radius, limit);

            return ResponseEntity.ok(venues);

        } catch (Exception e) {
            log.error("Error finding nearby venues: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get location recommendations.
     * GET /api/location/recommendations
     */
    @GetMapping("/recommendations")
    @RateLimiter(name = "location")
    @Operation(summary = "Get location recommendations", description = "Get location-based recommendations")
    public ResponseEntity<LocationService.LocationBasedRecommendations> getLocationRecommendations(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(required = false) String[] sports,
            @RequestParam(defaultValue = "10") int maxResults) {
        
        try {
            LocationService.LocationBasedRecommendations recommendations = 
                locationService.getLocationRecommendations(lat, lng, sports, maxResults);

            return ResponseEntity.ok(recommendations);

        } catch (Exception e) {
            log.error("Error getting location recommendations: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Weather service temporarily disabled for compilation
    /*
    @GetMapping("/weather")
    @RateLimiter(name = "location")
    @Operation(summary = "Get current weather", description = "Get weather conditions for location")
    public ResponseEntity<WeatherLocationService.WeatherData> getCurrentWeather(
            @RequestParam double lat,
            @RequestParam double lng) {
        
        try {
            WeatherLocationService.WeatherData weather = weatherService.getCurrentWeather(lat, lng);
            return ResponseEntity.ok(weather);

        } catch (Exception e) {
            log.error("Error getting weather: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    */

    /**
     * Get activity hotspots.
     * GET /api/location/hotspots
     */
    @GetMapping("/hotspots")
    @RateLimiter(name = "location")
    @Operation(summary = "Get activity hotspots", description = "Find activity hotspots in area")
    public ResponseEntity<List<LocationService.ActivityHotspot>> getActivityHotspots(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "20") double radius,
            @RequestParam(defaultValue = "10") int limit) {
        
        try {
            List<LocationService.ActivityHotspot> hotspots = 
                locationService.getActivityHotspots(lat, lng, radius, limit);

            return ResponseEntity.ok(hotspots);

        } catch (Exception e) {
            log.error("Error getting activity hotspots: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get location statistics.
     * GET /api/location/stats
     */
    @GetMapping("/stats")
    @RateLimiter(name = "location")
    @Operation(summary = "Get location statistics", description = "Get platform location statistics")
    public ResponseEntity<LocationService.LocationStatistics> getLocationStatistics() {
        
        try {
            LocationService.LocationStatistics stats = locationService.getLocationStatistics();
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            log.error("Error getting location statistics: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Validate location data.
     * POST /api/location/validate
     */
    @PostMapping("/validate")
    @RateLimiter(name = "location")
    @Operation(summary = "Validate location", description = "Validate and enhance location data")
    public ResponseEntity<LocationService.LocationValidation> validateLocation(
            @RequestParam(required = false) String address,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        
        try {
            LocationService.LocationValidation validation = 
                locationService.validateLocation(address, lat, lng);

            return ResponseEntity.ok(validation);

        } catch (Exception e) {
            log.error("Error validating location: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Calculate distance between two points.
     * GET /api/location/distance
     */
    @GetMapping("/distance")
    @RateLimiter(name = "location")
    @Operation(summary = "Calculate distance", description = "Calculate distance between two coordinates")
    public ResponseEntity<Map<String, Object>> calculateDistance(
            @RequestParam double lat1,
            @RequestParam double lng1,
            @RequestParam double lat2,
            @RequestParam double lng2) {
        
        try {
            double distance = locationService.calculateDistance(lat1, lng1, lat2, lng2);

            return ResponseEntity.ok(Map.of(
                "distance_km", distance,
                "distance_miles", distance * 0.621371,
                "from", Map.of("lat", lat1, "lng", lng1),
                "to", Map.of("lat", lat2, "lng", lng2)
            ));

        } catch (Exception e) {
            log.error("Error calculating distance: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Analytics service temporarily disabled for compilation
    /*
    @GetMapping("/analytics")
    @RateLimiter(name = "location")
    @Operation(summary = "Get location analytics", description = "Get platform-wide location analytics")
    public ResponseEntity<LocationAnalyticsService.PlatformLocationAnalytics> getPlatformAnalytics() {
        
        try {
            LocationAnalyticsService.PlatformLocationAnalytics analytics = 
                analyticsService.getPlatformLocationAnalytics();

            return ResponseEntity.ok(analytics);

        } catch (Exception e) {
            log.error("Error getting platform analytics: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    */
}
