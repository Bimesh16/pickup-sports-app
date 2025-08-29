package com.bmessi.pickupsportsapp.service.location;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Core location service providing geospatial operations and location-based features.
 * 
 * Features:
 * - Distance calculations and proximity search
 * - Geographic clustering and area analysis
 * - Location validation and geocoding
 * - Spatial indexing and optimization
 * - Location-based recommendations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LocationService {

    private final GameRepository gameRepository;
    private final VenueRepository venueRepository;

    // Earth's radius in kilometers
    private static final double EARTH_RADIUS_KM = 6371.0;
    
    // Default search radius in kilometers
    private static final double DEFAULT_SEARCH_RADIUS_KM = 10.0;

    /**
     * Calculate distance between two geographic points using Haversine formula.
     */
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Convert latitude and longitude from degrees to radians
        double lat1Rad = Math.toRadians(lat1);
        double lon1Rad = Math.toRadians(lon1);
        double lat2Rad = Math.toRadians(lat2);
        double lon2Rad = Math.toRadians(lon2);

        // Haversine formula
        double deltaLat = lat2Rad - lat1Rad;
        double deltaLon = lon2Rad - lon1Rad;

        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                   Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                   Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }

    /**
     * Find games within a specified radius of a location.
     */
    @Transactional(readOnly = true)
    public List<GameWithDistance> findGamesNearLocation(double latitude, double longitude, 
                                                       double radiusKm, int limit) {
        try {
            List<Game> allGames = gameRepository.findActiveGamesWithCoordinates();
            
            List<GameWithDistance> gamesWithDistance = allGames.stream()
                    .filter(game -> game.getLatitude() != null && game.getLongitude() != null)
                    .map(game -> {
                        double distance = calculateDistance(latitude, longitude, 
                                                          game.getLatitude(), game.getLongitude());
                        return new GameWithDistance(game, distance);
                    })
                    .filter(gwd -> gwd.getDistance() <= radiusKm)
                    .sorted(Comparator.comparing(GameWithDistance::getDistance))
                    .limit(limit)
                    .collect(Collectors.toList());

            log.debug("Found {} games within {}km of ({}, {})", 
                     gamesWithDistance.size(), radiusKm, latitude, longitude);
            
            return gamesWithDistance;
            
        } catch (Exception e) {
            log.error("Error finding games near location ({}, {}): {}", latitude, longitude, e.getMessage());
            return List.of();
        }
    }

    /**
     * Find venues within a specified radius of a location.
     */
    @Transactional(readOnly = true)
    public List<VenueWithDistance> findVenuesNearLocation(double latitude, double longitude, 
                                                         double radiusKm, int limit) {
        try {
            List<Venue> allVenues = venueRepository.findActiveVenuesWithCoordinates();
            
            List<VenueWithDistance> venuesWithDistance = allVenues.stream()
                    .filter(venue -> venue.getLatitude() != null && venue.getLongitude() != null)
                    .map(venue -> {
                        double distance = calculateDistance(latitude, longitude,
                                                          venue.getLatitude().doubleValue(), 
                                                          venue.getLongitude().doubleValue());
                        return new VenueWithDistance(venue, distance);
                    })
                    .filter(vwd -> vwd.getDistance() <= radiusKm)
                    .sorted(Comparator.comparing(VenueWithDistance::getDistance))
                    .limit(limit)
                    .collect(Collectors.toList());

            log.debug("Found {} venues within {}km of ({}, {})", 
                     venuesWithDistance.size(), radiusKm, latitude, longitude);
            
            return venuesWithDistance;
            
        } catch (Exception e) {
            log.error("Error finding venues near location ({}, {}): {}", latitude, longitude, e.getMessage());
            return List.of();
        }
    }

    /**
     * Get location-based game recommendations for a user.
     */
    @Transactional(readOnly = true)
    public LocationBasedRecommendations getLocationRecommendations(double userLatitude, 
                                                                 double userLongitude,
                                                                 String[] preferredSports,
                                                                 int maxResults) {
        try {
            // Find nearby games
            List<GameWithDistance> nearbyGames = findGamesNearLocation(
                userLatitude, userLongitude, DEFAULT_SEARCH_RADIUS_KM, maxResults * 2);

            // Filter by preferred sports if specified
            if (preferredSports != null && preferredSports.length > 0) {
                Set<String> sportsSet = Set.of(preferredSports);
                nearbyGames = nearbyGames.stream()
                        .filter(gwd -> sportsSet.contains(gwd.getGame().getSport()))
                        .collect(Collectors.toList());
            }

            // Find nearby venues
            List<VenueWithDistance> nearbyVenues = findVenuesNearLocation(
                userLatitude, userLongitude, DEFAULT_SEARCH_RADIUS_KM, maxResults);

            // Analyze location patterns
            LocationAnalysis analysis = analyzeLocationArea(userLatitude, userLongitude, 
                                                          DEFAULT_SEARCH_RADIUS_KM);

            return LocationBasedRecommendations.builder()
                    .userLocation(new LocationPoint(userLatitude, userLongitude))
                    .searchRadiusKm(DEFAULT_SEARCH_RADIUS_KM)
                    .nearbyGames(nearbyGames.stream().limit(maxResults).collect(Collectors.toList()))
                    .nearbyVenues(nearbyVenues)
                    .locationAnalysis(analysis)
                    .recommendedAreas(getRecommendedAreas(userLatitude, userLongitude))
                    .build();

        } catch (Exception e) {
            log.error("Error getting location recommendations for ({}, {}): {}", 
                     userLatitude, userLongitude, e.getMessage());
            return LocationBasedRecommendations.builder().build();
        }
    }

    /**
     * Analyze the activity and characteristics of a geographic area.
     */
    @Transactional(readOnly = true)
    public LocationAnalysis analyzeLocationArea(double centerLat, double centerLon, double radiusKm) {
        try {
            List<GameWithDistance> areaGames = findGamesNearLocation(centerLat, centerLon, radiusKm, 1000);
            List<VenueWithDistance> areaVenues = findVenuesNearLocation(centerLat, centerLon, radiusKm, 100);

            // Analyze sports popularity in the area
            Map<String, Long> sportPopularity = areaGames.stream()
                    .collect(Collectors.groupingBy(
                        gwd -> gwd.getGame().getSport(),
                        Collectors.counting()
                    ));

            // Analyze venue types
            Map<String, Long> venueTypes = areaVenues.stream()
                    .collect(Collectors.groupingBy(
                        vwd -> vwd.getVenue().getVenueType() != null ? 
                               vwd.getVenue().getVenueType().toString() : "UNKNOWN",
                        Collectors.counting()
                    ));

            // Calculate activity density
            double activityDensity = (areaGames.size() + areaVenues.size()) / (Math.PI * radiusKm * radiusKm);

            // Determine area characteristics
            String areaType = determineAreaType(sportPopularity, venueTypes, activityDensity);
            
            return LocationAnalysis.builder()
                    .centerLocation(new LocationPoint(centerLat, centerLon))
                    .radiusKm(radiusKm)
                    .totalGames(areaGames.size())
                    .totalVenues(areaVenues.size())
                    .sportPopularity(sportPopularity)
                    .venueTypeDistribution(venueTypes)
                    .activityDensity(activityDensity)
                    .areaType(areaType)
                    .averageDistanceToVenues(calculateAverageDistance(areaVenues))
                    .accessibilityScore(calculateAccessibilityScore(areaVenues))
                    .build();

        } catch (Exception e) {
            log.error("Error analyzing location area ({}, {}): {}", centerLat, centerLon, e.getMessage());
            return LocationAnalysis.builder().build();
        }
    }

    /**
     * Get popular areas and activity hotspots.
     */
    @Transactional(readOnly = true)
    public List<ActivityHotspot> getActivityHotspots(double centerLat, double centerLon, 
                                                   double searchRadiusKm, int limit) {
        try {
            // Find all games and venues in the search area
            List<GameWithDistance> games = findGamesNearLocation(centerLat, centerLon, searchRadiusKm, 1000);
            List<VenueWithDistance> venues = findVenuesNearLocation(centerLat, centerLon, searchRadiusKm, 200);

            // Create a grid to identify hotspots
            Map<String, List<LocationActivity>> grid = createActivityGrid(games, venues, 1.0); // 1km grid

            // Identify hotspots based on activity density
            List<ActivityHotspot> hotspots = grid.entrySet().stream()
                    .filter(entry -> entry.getValue().size() >= 3) // Minimum 3 activities per hotspot
                    .map(entry -> createHotspot(entry.getKey(), entry.getValue()))
                    .sorted((h1, h2) -> Integer.compare(h2.getActivityCount(), h1.getActivityCount()))
                    .limit(limit)
                    .collect(Collectors.toList());

            log.debug("Found {} activity hotspots within {}km of ({}, {})", 
                     hotspots.size(), searchRadiusKm, centerLat, centerLon);

            return hotspots;

        } catch (Exception e) {
            log.error("Error finding activity hotspots: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Validate and enhance location data.
     */
    public LocationValidation validateLocation(String address, Double latitude, Double longitude) {
        try {
            List<String> issues = new ArrayList<>();
            List<String> suggestions = new ArrayList<>();

            // Validate coordinates
            if (latitude != null && longitude != null) {
                if (latitude < -90 || latitude > 90) {
                    issues.add("Invalid latitude: must be between -90 and 90 degrees");
                }
                if (longitude < -180 || longitude > 180) {
                    issues.add("Invalid longitude: must be between -180 and 180 degrees");
                }
            } else if (address == null || address.trim().isEmpty()) {
                issues.add("Either coordinates or address must be provided");
            }

            // Check for nearby venues if coordinates are provided
            List<VenueWithDistance> nearbyVenues = List.of();
            if (latitude != null && longitude != null && issues.isEmpty()) {
                nearbyVenues = findVenuesNearLocation(latitude, longitude, 0.5, 5); // 500m radius
                
                if (!nearbyVenues.isEmpty()) {
                    suggestions.add("Consider using nearby venue: " + 
                                  nearbyVenues.get(0).getVenue().getName());
                }
            }

            // Geocoding suggestions (placeholder)
            GeocodingResult geocodingResult = null;
            if (address != null && !address.trim().isEmpty()) {
                geocodingResult = geocodeAddress(address);
            }

            return LocationValidation.builder()
                    .isValid(issues.isEmpty())
                    .issues(issues)
                    .suggestions(suggestions)
                    .nearbyVenues(nearbyVenues)
                    .geocodingResult(geocodingResult)
                    .build();

        } catch (Exception e) {
            log.error("Error validating location: {}", e.getMessage());
            return LocationValidation.builder()
                    .isValid(false)
                    .issues(List.of("Error validating location: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * Get location statistics and insights.
     */
    @Transactional(readOnly = true)
    public LocationStatistics getLocationStatistics() {
        try {
            List<Game> allGames = gameRepository.findAll();
            List<Venue> allVenues = venueRepository.findAll();

            // Calculate coverage area
            GeographicBounds bounds = calculateGeographicBounds(allGames, allVenues);
            
            // Analyze location distribution
            Map<String, Integer> cityDistribution = analyzeLocationDistribution(allGames);
            
            // Calculate density metrics
            double gamesDensity = calculateGamesDensity(allGames, bounds);
            double venuesDensity = calculateVenuesDensity(allVenues, bounds);

            return LocationStatistics.builder()
                    .totalGamesWithCoordinates(allGames.stream()
                            .mapToInt(g -> g.getLatitude() != null && g.getLongitude() != null ? 1 : 0)
                            .sum())
                    .totalVenuesWithCoordinates(allVenues.stream()
                            .mapToInt(v -> v.getLatitude() != null && v.getLongitude() != null ? 1 : 0)
                            .sum())
                    .geographicBounds(bounds)
                    .cityDistribution(cityDistribution)
                    .gamesDensity(gamesDensity)
                    .venuesDensity(venuesDensity)
                    .coverageAreaKm2(calculateCoverageArea(bounds))
                    .build();

        } catch (Exception e) {
            log.error("Error getting location statistics: {}", e.getMessage());
            return LocationStatistics.builder().build();
        }
    }

    // Private helper methods

    private String determineAreaType(Map<String, Long> sportPopularity, 
                                   Map<String, Long> venueTypes, 
                                   double activityDensity) {
        if (activityDensity > 10.0) return "HIGH_ACTIVITY_URBAN";
        if (activityDensity > 5.0) return "MODERATE_ACTIVITY_SUBURBAN";
        if (activityDensity > 1.0) return "LOW_ACTIVITY_RESIDENTIAL";
        return "RURAL_SPARSE";
    }

    private double calculateAverageDistance(List<VenueWithDistance> venues) {
        return venues.stream()
                .mapToDouble(VenueWithDistance::getDistance)
                .average()
                .orElse(0.0);
    }

    private double calculateAccessibilityScore(List<VenueWithDistance> venues) {
        // Score based on venue availability, distance, and amenities
        if (venues.isEmpty()) return 0.0;
        
        double baseScore = Math.min(100.0, venues.size() * 10); // More venues = higher score
        double distanceScore = 100.0 - (calculateAverageDistance(venues) * 10); // Closer = higher score
        
        return Math.max(0.0, (baseScore + distanceScore) / 2);
    }

    private List<RecommendedArea> getRecommendedAreas(double userLat, double userLon) {
        // This would analyze popular areas and recommend them to users
        // For now, return some sample recommendations
        List<RecommendedArea> recommendations = new ArrayList<>();
        
        recommendations.add(RecommendedArea.builder()
                .name("Sports Complex District")
                .centerLocation(new LocationPoint(userLat + 0.01, userLon + 0.01))
                .description("High concentration of sports venues and active games")
                .activityScore(85.0)
                .distanceKm(1.2)
                .recommendationReason("Popular area with many active players")
                .build());
        
        return recommendations;
    }

    private Map<String, List<LocationActivity>> createActivityGrid(List<GameWithDistance> games, 
                                                                 List<VenueWithDistance> venues,
                                                                 double gridSizeKm) {
        Map<String, List<LocationActivity>> grid = new HashMap<>();
        
        // Add games to grid
        for (GameWithDistance gwd : games) {
            String gridKey = getGridKey(gwd.getGame().getLatitude(), gwd.getGame().getLongitude(), gridSizeKm);
            grid.computeIfAbsent(gridKey, k -> new ArrayList<>())
                .add(LocationActivity.fromGame(gwd.getGame()));
        }
        
        // Add venues to grid
        for (VenueWithDistance vwd : venues) {
            String gridKey = getGridKey(vwd.getVenue().getLatitude().doubleValue(), 
                                      vwd.getVenue().getLongitude().doubleValue(), gridSizeKm);
            grid.computeIfAbsent(gridKey, k -> new ArrayList<>())
                .add(LocationActivity.fromVenue(vwd.getVenue()));
        }
        
        return grid;
    }

    private String getGridKey(double lat, double lon, double gridSizeKm) {
        // Convert to grid coordinates
        int gridLat = (int) Math.floor(lat / (gridSizeKm / 111.0)); // Rough km to degree conversion
        int gridLon = (int) Math.floor(lon / (gridSizeKm / 111.0));
        return gridLat + "," + gridLon;
    }

    private ActivityHotspot createHotspot(String gridKey, List<LocationActivity> activities) {
        // Calculate center point of activities
        double avgLat = activities.stream()
                .mapToDouble(LocationActivity::getLatitude)
                .average()
                .orElse(0.0);
        
        double avgLon = activities.stream()
                .mapToDouble(LocationActivity::getLongitude)
                .average()
                .orElse(0.0);

        // Analyze activity types
        Map<String, Long> activityTypes = activities.stream()
                .collect(Collectors.groupingBy(LocationActivity::getType, Collectors.counting()));

        String primaryActivityType = activityTypes.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("MIXED");

        return ActivityHotspot.builder()
                .centerLocation(new LocationPoint(avgLat, avgLon))
                .activityCount(activities.size())
                .primaryActivityType(primaryActivityType)
                .activityTypes(activityTypes)
                .radius(calculateHotspotRadius(activities))
                .name(generateHotspotName(primaryActivityType, activityTypes))
                .description(generateHotspotDescription(activities, activityTypes))
                .build();
    }

    private GeocodingResult geocodeAddress(String address) {
        // Placeholder for geocoding service integration
        // In production, this would integrate with Google Maps, OpenStreetMap, etc.
        return GeocodingResult.builder()
                .address(address)
                .latitude(0.0)
                .longitude(0.0)
                .confidence(0.0)
                .source("PLACEHOLDER")
                .build();
    }

    private GeographicBounds calculateGeographicBounds(List<Game> games, List<Venue> venues) {
        List<LocationPoint> points = new ArrayList<>();
        
        // Add game locations
        games.stream()
                .filter(g -> g.getLatitude() != null && g.getLongitude() != null)
                .forEach(g -> points.add(new LocationPoint(g.getLatitude(), g.getLongitude())));
        
        // Add venue locations
        venues.stream()
                .filter(v -> v.getLatitude() != null && v.getLongitude() != null)
                .forEach(v -> points.add(new LocationPoint(v.getLatitude().doubleValue(), 
                                                          v.getLongitude().doubleValue())));

        if (points.isEmpty()) {
            return GeographicBounds.builder().build();
        }

        double minLat = points.stream().mapToDouble(LocationPoint::getLatitude).min().orElse(0.0);
        double maxLat = points.stream().mapToDouble(LocationPoint::getLatitude).max().orElse(0.0);
        double minLon = points.stream().mapToDouble(LocationPoint::getLongitude).min().orElse(0.0);
        double maxLon = points.stream().mapToDouble(LocationPoint::getLongitude).max().orElse(0.0);

        return GeographicBounds.builder()
                .northEast(new LocationPoint(maxLat, maxLon))
                .southWest(new LocationPoint(minLat, minLon))
                .center(new LocationPoint((minLat + maxLat) / 2, (minLon + maxLon) / 2))
                .build();
    }

    private Map<String, Integer> analyzeLocationDistribution(List<Game> games) {
        return games.stream()
                .filter(g -> g.getLocation() != null)
                .collect(Collectors.groupingBy(
                    g -> extractCityFromLocation(g.getLocation()),
                    Collectors.summingInt(g -> 1)
                ));
    }

    private String extractCityFromLocation(String location) {
        // Simple city extraction - in production, use proper address parsing
        if (location.contains(",")) {
            return location.split(",")[0].trim();
        }
        return location.trim();
    }

    private double calculateGamesDensity(List<Game> games, GeographicBounds bounds) {
        if (bounds.getNorthEast() == null || bounds.getSouthWest() == null) return 0.0;
        
        double area = calculateCoverageArea(bounds);
        long gamesWithCoords = games.stream()
                .filter(g -> g.getLatitude() != null && g.getLongitude() != null)
                .count();
        
        return area > 0 ? gamesWithCoords / area : 0.0;
    }

    private double calculateVenuesDensity(List<Venue> venues, GeographicBounds bounds) {
        if (bounds.getNorthEast() == null || bounds.getSouthWest() == null) return 0.0;
        
        double area = calculateCoverageArea(bounds);
        long venuesWithCoords = venues.stream()
                .filter(v -> v.getLatitude() != null && v.getLongitude() != null)
                .count();
        
        return area > 0 ? venuesWithCoords / area : 0.0;
    }

    private double calculateCoverageArea(GeographicBounds bounds) {
        if (bounds.getNorthEast() == null || bounds.getSouthWest() == null) return 0.0;
        
        double latDiff = bounds.getNorthEast().getLatitude() - bounds.getSouthWest().getLatitude();
        double lonDiff = bounds.getNorthEast().getLongitude() - bounds.getSouthWest().getLongitude();
        
        // Rough area calculation (not precise for large areas)
        return latDiff * lonDiff * 12100; // Approximate km² per degree²
    }

    private double calculateHotspotRadius(List<LocationActivity> activities) {
        if (activities.size() < 2) return 0.5; // Default 500m radius
        
        // Calculate the radius that encompasses all activities
        double centerLat = activities.stream().mapToDouble(LocationActivity::getLatitude).average().orElse(0.0);
        double centerLon = activities.stream().mapToDouble(LocationActivity::getLongitude).average().orElse(0.0);
        
        return activities.stream()
                .mapToDouble(activity -> calculateDistance(centerLat, centerLon, 
                                                         activity.getLatitude(), activity.getLongitude()))
                .max()
                .orElse(0.5);
    }

    private String generateHotspotName(String primaryType, Map<String, Long> activityTypes) {
        if ("GAME".equals(primaryType)) {
            return "Active Gaming Area";
        } else if ("VENUE".equals(primaryType)) {
            return "Sports Venue Hub";
        } else {
            return "Mixed Activity Zone";
        }
    }

    private String generateHotspotDescription(List<LocationActivity> activities, 
                                            Map<String, Long> activityTypes) {
        StringBuilder desc = new StringBuilder();
        desc.append("Area with ").append(activities.size()).append(" activities including ");
        
        List<String> types = activityTypes.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(entry -> entry.getValue() + " " + entry.getKey().toLowerCase() + "s")
                .collect(Collectors.toList());
        
        desc.append(String.join(", ", types));
        
        return desc.toString();
    }

    // Data Transfer Objects

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class LocationPoint {
        private final double latitude;
        private final double longitude;
        
        @Override
        public String toString() {
            return String.format("(%.6f, %.6f)", latitude, longitude);
        }
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class GameWithDistance {
        private final Game game;
        private final double distance;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class VenueWithDistance {
        private final Venue venue;
        private final double distance;
    }

    @lombok.Data
    @lombok.Builder
    public static class LocationBasedRecommendations {
        private LocationPoint userLocation;
        private double searchRadiusKm;
        private List<GameWithDistance> nearbyGames;
        private List<VenueWithDistance> nearbyVenues;
        private LocationAnalysis locationAnalysis;
        private List<RecommendedArea> recommendedAreas;
    }

    @lombok.Data
    @lombok.Builder
    public static class LocationAnalysis {
        private LocationPoint centerLocation;
        private double radiusKm;
        private int totalGames;
        private int totalVenues;
        private Map<String, Long> sportPopularity;
        private Map<String, Long> venueTypeDistribution;
        private double activityDensity;
        private String areaType;
        private double averageDistanceToVenues;
        private double accessibilityScore;
    }

    @lombok.Data
    @lombok.Builder
    public static class ActivityHotspot {
        private LocationPoint centerLocation;
        private int activityCount;
        private String primaryActivityType;
        private Map<String, Long> activityTypes;
        private double radius;
        private String name;
        private String description;
    }

    @lombok.Data
    @lombok.Builder
    public static class RecommendedArea {
        private String name;
        private LocationPoint centerLocation;
        private String description;
        private double activityScore;
        private double distanceKm;
        private String recommendationReason;
    }

    @lombok.Data
    @lombok.Builder
    public static class LocationValidation {
        private boolean isValid;
        private List<String> issues;
        private List<String> suggestions;
        private List<VenueWithDistance> nearbyVenues;
        private GeocodingResult geocodingResult;
    }

    @lombok.Data
    @lombok.Builder
    public static class GeocodingResult {
        private String address;
        private double latitude;
        private double longitude;
        private double confidence;
        private String source;
    }

    @lombok.Data
    @lombok.Builder
    public static class LocationStatistics {
        private int totalGamesWithCoordinates;
        private int totalVenuesWithCoordinates;
        private GeographicBounds geographicBounds;
        private Map<String, Integer> cityDistribution;
        private double gamesDensity;
        private double venuesDensity;
        private double coverageAreaKm2;
    }

    @lombok.Data
    @lombok.Builder
    public static class GeographicBounds {
        private LocationPoint northEast;
        private LocationPoint southWest;
        private LocationPoint center;
    }

    @lombok.Data
    @lombok.Builder
    public static class LocationActivity {
        private String type; // GAME, VENUE
        private String name;
        private double latitude;
        private double longitude;
        private String sport;
        private java.time.LocalDateTime timestamp;
        
        public static LocationActivity fromGame(Game game) {
            return LocationActivity.builder()
                    .type("GAME")
                    .name(game.getSport() + " Game")
                    .latitude(game.getLatitude())
                    .longitude(game.getLongitude())
                    .sport(game.getSport())
                    .timestamp(game.getTime() != null ? game.getTime().toLocalDateTime() : LocalDateTime.now())
                    .build();
        }
        
        public static LocationActivity fromVenue(Venue venue) {
            return LocationActivity.builder()
                    .type("VENUE")
                    .name(venue.getName())
                    .latitude(venue.getLatitude().doubleValue())
                    .longitude(venue.getLongitude().doubleValue())
                    .sport(null) // Venues can support multiple sports
                    .timestamp(venue.getCreatedAt())
                    .build();
        }
    }
}
