package com.bmessi.pickupsportsapp.service.mobile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Mobile-optimized geolocation service for location-based features.
 * 
 * Features:
 * - GPS coordinate calculations
 * - Distance-based searches
 * - Location clustering
 * - Geofencing
 * - Route optimization
 * - Location caching
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GeolocationService {

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double DEFAULT_SEARCH_RADIUS_KM = 10.0;
    private static final double MAX_SEARCH_RADIUS_KM = 50.0;

    /**
     * Calculate distance between two GPS coordinates using Haversine formula.
     */
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return EARTH_RADIUS_KM * c;
    }

    /**
     * Find nearby venues within specified radius.
     */
    public List<Map<String, Object>> findNearbyVenues(double userLat, double userLon, 
                                                      double radiusKm, String sport) {
        log.debug("Finding venues within {}km of ({}, {}) for sport: {}", 
                 radiusKm, userLat, userLon, sport);
        
        // This would typically query the database with spatial queries
        // For now, return mock data
        List<Map<String, Object>> nearbyVenues = new ArrayList<>();
        
        // Mock venue data
        nearbyVenues.add(Map.of(
            "id", 1L,
            "name", "Central Park Soccer Field",
            "distance_km", 0.5,
            "sport", "Soccer",
            "rating", 4.5,
            "available_slots", 3
        ));
        
        nearbyVenues.add(Map.of(
            "id", 2L,
            "name", "Downtown Basketball Court",
            "distance_km", 1.2,
            "sport", "Basketball",
            "rating", 4.2,
            "available_slots", 1
        ));
        
        return nearbyVenues.stream()
            .filter(venue -> (Double) venue.get("distance_km") <= radiusKm)
            .sorted(Comparator.comparing(venue -> (Double) venue.get("distance_km")))
            .collect(Collectors.toList());
    }

    /**
     * Find nearby games within specified radius.
     */
    public List<Map<String, Object>> findNearbyGames(double userLat, double userLon, 
                                                     double radiusKm, String sport) {
        log.debug("Finding games within {}km of ({}, {}) for sport: {}", 
                 radiusKm, userLat, userLon, sport);
        
        // This would typically query the database with spatial queries
        // For now, return mock data
        List<Map<String, Object>> nearbyGames = new ArrayList<>();
        
        // Mock game data
        nearbyGames.add(Map.of(
            "id", 1L,
            "title", "Weekend Soccer Match",
            "distance_km", 0.8,
            "sport", "Soccer",
            "start_time", OffsetDateTime.now().plusHours(2),
            "available_spots", 5,
            "venue_name", "Central Park Soccer Field"
        ));
        
        nearbyGames.add(Map.of(
            "id", 2L,
            "title", "Evening Basketball",
            "distance_km", 1.5,
            "sport", "Basketball",
            "start_time", OffsetDateTime.now().plusHours(1),
            "available_spots", 2,
            "venue_name", "Downtown Basketball Court"
        ));
        
        return nearbyGames.stream()
            .filter(game -> (Double) game.get("distance_km") <= radiusKm)
            .sorted(Comparator.comparing(game -> (Double) game.get("distance_km")))
            .collect(Collectors.toList());
    }

    /**
     * Find nearby players for team formation.
     */
    public List<Map<String, Object>> findNearbyPlayers(double userLat, double userLon, 
                                                       double radiusKm, String sport, 
                                                       String skillLevel) {
        log.debug("Finding players within {}km of ({}, {}) for sport: {} with skill: {}", 
                 radiusKm, userLat, userLon, sport, skillLevel);
        
        // This would typically query the database with spatial queries
        // For now, return mock data
        List<Map<String, Object>> nearbyPlayers = new ArrayList<>();
        
        // Mock player data
        nearbyPlayers.add(Map.of(
            "id", 1L,
            "username", "soccer_pro",
            "distance_km", 0.3,
            "skill_level", "ADVANCED",
            "rating", 4.8,
            "last_active", OffsetDateTime.now().minusMinutes(15)
        ));
        
        nearbyPlayers.add(Map.of(
            "id", 2L,
            "username", "midfield_maestro",
            "distance_km", 0.7,
            "skill_level", "INTERMEDIATE",
            "rating", 4.2,
            "last_active", OffsetDateTime.now().minusMinutes(30)
        ));
        
        return nearbyPlayers.stream()
            .filter(player -> (Double) player.get("distance_km") <= radiusKm)
            .sorted(Comparator.comparing(player -> (Double) player.get("distance_km")))
            .collect(Collectors.toList());
    }

    /**
     * Optimize route between multiple locations.
     */
    public List<Map<String, Object>> optimizeRoute(List<Map<String, Object>> locations) {
        log.debug("Optimizing route for {} locations", locations.size());
        
        // Simple nearest neighbor algorithm for route optimization
        List<Map<String, Object>> optimizedRoute = new ArrayList<>();
        Set<Integer> visited = new HashSet<>();
        
        // Start with the first location
        Map<String, Object> current = locations.get(0);
        optimizedRoute.add(current);
        visited.add(0);
        
        while (visited.size() < locations.size()) {
            int nearestIndex = -1;
            double minDistance = Double.MAX_VALUE;
            
            for (int i = 0; i < locations.size(); i++) {
                if (!visited.contains(i)) {
                    double distance = calculateDistance(
                        (Double) current.get("latitude"),
                        (Double) current.get("longitude"),
                        (Double) locations.get(i).get("latitude"),
                        (Double) locations.get(i).get("longitude")
                    );
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestIndex = i;
                    }
                }
            }
            
            if (nearestIndex != -1) {
                current = locations.get(nearestIndex);
                optimizedRoute.add(current);
                visited.add(nearestIndex);
            }
        }
        
        return optimizedRoute;
    }

    /**
     * Create geofence around a location.
     */
    public Map<String, Object> createGeofence(double centerLat, double centerLon, 
                                             double radiusKm, String name) {
        log.debug("Creating geofence '{}' with radius {}km at ({}, {})", 
                 name, radiusKm, centerLat, centerLon);
        
        return Map.of(
            "name", name,
            "center_latitude", centerLat,
            "center_longitude", centerLon,
            "radius_km", radiusKm,
            "created_at", OffsetDateTime.now(),
            "active", true
        );
    }

    /**
     * Check if a point is within a geofence.
     */
    public boolean isPointInGeofence(double pointLat, double pointLon, 
                                   Map<String, Object> geofence) {
        double centerLat = (Double) geofence.get("center_latitude");
        double centerLon = (Double) geofence.get("center_longitude");
        double radius = (Double) geofence.get("radius_km");
        
        double distance = calculateDistance(pointLat, pointLon, centerLat, centerLon);
        return distance <= radius;
    }

    /**
     * Get location-based recommendations.
     */
    public Map<String, Object> getLocationBasedRecommendations(double userLat, double userLon) {
        log.debug("Getting location-based recommendations for ({}, {})", userLat, userLon);
        
        Map<String, Object> recommendations = new HashMap<>();
        
        // Find nearby venues
        recommendations.put("nearby_venues", 
            findNearbyVenues(userLat, userLon, DEFAULT_SEARCH_RADIUS_KM, null));
        
        // Find nearby games
        recommendations.put("nearby_games", 
            findNearbyGames(userLat, userLon, DEFAULT_SEARCH_RADIUS_KM, null));
        
        // Find nearby players
        recommendations.put("nearby_players", 
            findNearbyPlayers(userLat, userLon, DEFAULT_SEARCH_RADIUS_KM, null, null));
        
        // Location insights
        recommendations.put("location_insights", Map.of(
            "area_type", "urban",
            "sports_density", "high",
            "peak_hours", List.of("18:00", "20:00"),
            "popular_sports", List.of("Soccer", "Basketball", "Tennis")
        ));
        
        return recommendations;
    }

    /**
     * Validate GPS coordinates.
     */
    public boolean isValidCoordinates(double latitude, double longitude) {
        return latitude >= -90.0 && latitude <= 90.0 &&
               longitude >= -180.0 && longitude <= 180.0;
    }

    /**
     * Convert distance from kilometers to miles.
     */
    public double kmToMiles(double kilometers) {
        return kilometers * 0.621371;
    }

    /**
     * Convert distance from miles to kilometers.
     */
    public double milesToKm(double miles) {
        return miles * 1.60934;
    }
}
