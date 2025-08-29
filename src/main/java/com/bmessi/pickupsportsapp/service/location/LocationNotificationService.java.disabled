package com.bmessi.pickupsportsapp.service.location;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.VenueRepository;
import com.bmessi.pickupsportsapp.realtime.service.RealTimeEventService;
import com.bmessi.pickupsportsapp.realtime.event.LocationUpdateEvent;
import com.bmessi.pickupsportsapp.realtime.event.NotificationEvent;
import com.bmessi.pickupsportsapp.service.location.LocationService.GameWithDistance;
import com.bmessi.pickupsportsapp.service.location.LocationService.VenueWithDistance;
import com.bmessi.pickupsportsapp.service.location.LocationService.LocationPoint;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Location-based notification and alert service.
 * 
 * Features:
 * - Real-time proximity alerts
 * - Location-based game notifications
 * - Venue availability alerts
 * - Weather and condition updates
 * - Geofencing and area-based notifications
 * - Smart location suggestions
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LocationNotificationService {

    private final UserRepository userRepository;
    private final GameRepository gameRepository;
    private final VenueRepository venueRepository;
    private final LocationService locationService;
    private final RealTimeEventService realTimeEventService;
    private final RedisTemplate<String, String> redisTemplate;

    // User location tracking
    private final Map<String, UserLocationInfo> userLocations = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> userLocationAlerts = new ConcurrentHashMap<>();
    
    // Redis keys for persistent storage
    private static final String USER_LOCATION_KEY = "location:user:%s";
    private static final String LOCATION_ALERTS_KEY = "location:alerts:%s";
    private static final String GEOFENCE_KEY = "location:geofence:%s";
    
    // Configuration
    private static final double DEFAULT_ALERT_RADIUS_KM = 5.0;
    private static final long LOCATION_TTL_HOURS = 24;

    /**
     * Update user's location and trigger proximity checks.
     */
    public void updateUserLocation(String username, double latitude, double longitude, 
                                 String source, Map<String, Object> metadata) {
        try {
            UserLocationInfo locationInfo = UserLocationInfo.builder()
                    .username(username)
                    .latitude(latitude)
                    .longitude(longitude)
                    .timestamp(Instant.now())
                    .source(source)
                    .metadata(metadata)
                    .build();

            // Update in-memory cache
            UserLocationInfo previousLocation = userLocations.put(username, locationInfo);
            
            // Store in Redis for persistence
            String locationKey = String.format(USER_LOCATION_KEY, username);
            Map<String, String> locationData = Map.of(
                "latitude", String.valueOf(latitude),
                "longitude", String.valueOf(longitude),
                "timestamp", locationInfo.getTimestamp().toString(),
                "source", source
            );
            
            redisTemplate.opsForHash().putAll(locationKey, locationData);
            redisTemplate.expire(locationKey, LOCATION_TTL_HOURS, TimeUnit.HOURS);

            // Check for proximity alerts
            checkProximityAlerts(username, locationInfo, previousLocation);
            
            // Check geofence triggers
            checkGeofenceTriggers(username, locationInfo);

            log.debug("Updated location for user {}: ({}, {}) from {}", 
                     username, latitude, longitude, source);

        } catch (Exception e) {
            log.error("Error updating location for user {}: {}", username, e.getMessage());
        }
    }

    /**
     * Subscribe user to location-based alerts for an area.
     */
    public void subscribeToLocationAlerts(String username, LocationAlertSubscription subscription) {
        try {
            String alertKey = String.format(LOCATION_ALERTS_KEY, username);
            
            // Store subscription in Redis
            Map<String, String> subscriptionData = Map.of(
                "latitude", String.valueOf(subscription.getLatitude()),
                "longitude", String.valueOf(subscription.getLongitude()),
                "radius", String.valueOf(subscription.getRadiusKm()),
                "alertTypes", String.join(",", subscription.getAlertTypes()),
                "sports", subscription.getSports() != null ? String.join(",", subscription.getSports()) : "",
                "createdAt", Instant.now().toString()
            );
            
            redisTemplate.opsForHash().putAll(alertKey + ":" + subscription.getName(), subscriptionData);
            redisTemplate.expire(alertKey + ":" + subscription.getName(), 30, TimeUnit.DAYS);

            // Update in-memory tracking
            userLocationAlerts.computeIfAbsent(username, k -> ConcurrentHashMap.newKeySet())
                             .add(subscription.getName());

            log.info("User {} subscribed to location alerts: {} (radius: {}km)", 
                    username, subscription.getName(), subscription.getRadiusKm());

        } catch (Exception e) {
            log.error("Error subscribing user {} to location alerts: {}", username, e.getMessage());
        }
    }

    /**
     * Send immediate proximity alert to users.
     */
    public void sendProximityAlert(ProximityAlertRequest request) {
        try {
            // Find users near the alert location
            List<String> nearbyUsers = findUsersNearLocation(
                request.getLatitude(), request.getLongitude(), request.getAlertRadiusKm());

            for (String username : nearbyUsers) {
                // Check if user wants this type of alert
                if (userWantsAlert(username, request.getAlertType())) {
                    NotificationEvent notification = new NotificationEvent(
                        username,
                        request.getTitle(),
                        request.getMessage(),
                        "LOCATION_ALERT",
                        request.getActionUrl()
                    );
                    
                    realTimeEventService.publishEvent(notification);
                }
            }

            // Also send location update event
            LocationUpdateEvent locationEvent = new LocationUpdateEvent(
                request.getLocationName(),
                request.getAlertType(),
                request.getTitle(),
                request.getMessage(),
                request.getSeverity()
            );
            
            realTimeEventService.publishEvent(locationEvent);

            log.info("Sent proximity alert '{}' to {} users near ({}, {})", 
                    request.getTitle(), nearbyUsers.size(), 
                    request.getLatitude(), request.getLongitude());

        } catch (Exception e) {
            log.error("Error sending proximity alert: {}", e.getMessage());
        }
    }

    /**
     * Scheduled task to check for location-based notifications.
     */
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void checkLocationBasedNotifications() {
        try {
            log.debug("Starting scheduled location-based notification check");

            // Check for games starting soon near users
            checkUpcomingGameAlerts();
            
            // Check for venue availability changes
            checkVenueAvailabilityAlerts();
            
            // Check for new activities in user areas
            checkNewActivityAlerts();

            log.debug("Completed location-based notification check");

        } catch (Exception e) {
            log.error("Error during location-based notification check: {}", e.getMessage());
        }
    }

    /**
     * Create geofence for location-based triggers.
     */
    public void createGeofence(GeofenceDefinition geofence) {
        try {
            String geofenceKey = String.format(GEOFENCE_KEY, geofence.getName());
            
            Map<String, String> geofenceData = Map.of(
                "name", geofence.getName(),
                "latitude", String.valueOf(geofence.getCenterLatitude()),
                "longitude", String.valueOf(geofence.getCenterLongitude()),
                "radius", String.valueOf(geofence.getRadiusKm()),
                "triggerType", geofence.getTriggerType().toString(),
                "isActive", String.valueOf(geofence.isActive()),
                "createdAt", Instant.now().toString()
            );
            
            redisTemplate.opsForHash().putAll(geofenceKey, geofenceData);
            redisTemplate.expire(geofenceKey, 365, TimeUnit.DAYS); // 1 year

            log.info("Created geofence '{}' at ({}, {}) with radius {}km", 
                    geofence.getName(), geofence.getCenterLatitude(), 
                    geofence.getCenterLongitude(), geofence.getRadiusKm());

        } catch (Exception e) {
            log.error("Error creating geofence: {}", e.getMessage());
        }
    }

    /**
     * Get location-based insights for a user.
     */
    public LocationInsights getLocationInsights(String username) {
        try {
            UserLocationInfo currentLocation = userLocations.get(username);
            if (currentLocation == null) {
                return LocationInsights.builder()
                        .username(username)
                        .hasLocationData(false)
                        .message("No location data available")
                        .build();
            }

            // Analyze user's location patterns
            List<LocationService.GameWithDistance> nearbyGames = locationService
                    .findGamesNearLocation(currentLocation.getLatitude(), 
                                         currentLocation.getLongitude(), 
                                         DEFAULT_ALERT_RADIUS_KM, 20);

            List<LocationService.VenueWithDistance> nearbyVenues = locationService
                    .findVenuesNearLocation(currentLocation.getLatitude(), 
                                          currentLocation.getLongitude(), 
                                          DEFAULT_ALERT_RADIUS_KM, 10);

            // Generate insights
            List<String> insights = generateLocationInsights(nearbyGames, nearbyVenues, currentLocation);
            List<LocationRecommendation> recommendations = generateLocationRecommendations(
                    nearbyGames, nearbyVenues, currentLocation);

            return LocationInsights.builder()
                    .username(username)
                    .hasLocationData(true)
                    .currentLocation(new LocationPoint(currentLocation.getLatitude(), 
                                                     currentLocation.getLongitude()))
                    .lastUpdated(currentLocation.getTimestamp())
                    .nearbyGamesCount(nearbyGames.size())
                    .nearbyVenuesCount(nearbyVenues.size())
                    .insights(insights)
                    .recommendations(recommendations)
                    .areaAnalysis(locationService.analyzeLocationArea(
                            currentLocation.getLatitude(), 
                            currentLocation.getLongitude(), 
                            DEFAULT_ALERT_RADIUS_KM))
                    .build();

        } catch (Exception e) {
            log.error("Error getting location insights for user {}: {}", username, e.getMessage());
            return LocationInsights.builder()
                    .username(username)
                    .hasLocationData(false)
                    .message("Error loading location insights")
                    .build();
        }
    }

    // Private helper methods

    private void checkProximityAlerts(String username, UserLocationInfo current, UserLocationInfo previous) {
        try {
            // Check for games starting soon nearby
            List<GameWithDistance> urgentGames = findUrgentNearbyGames(current);
            
            for (GameWithDistance gwd : urgentGames) {
                sendGameProximityAlert(username, gwd);
            }

            // Check for new venues in the area
            if (previous != null && hasMovedSignificantly(current, previous)) {
                checkForNewVenuesInArea(username, current);
            }

        } catch (Exception e) {
            log.error("Error checking proximity alerts for user {}: {}", username, e.getMessage());
        }
    }

    private void checkGeofenceTriggers(String username, UserLocationInfo location) {
        try {
            // Get all active geofences
            Set<String> geofenceKeys = redisTemplate.keys(GEOFENCE_KEY.replace("%s", "*"));
            
            for (String key : geofenceKeys) {
                Map<Object, Object> geofenceData = redisTemplate.opsForHash().entries(key);
                if (geofenceData.isEmpty()) continue;
                
                double geoLat = Double.parseDouble((String) geofenceData.get("latitude"));
                double geoLon = Double.parseDouble((String) geofenceData.get("longitude"));
                double radius = Double.parseDouble((String) geofenceData.get("radius"));
                
                double distance = locationService.calculateDistance(
                    location.getLatitude(), location.getLongitude(), geoLat, geoLon);
                
                if (distance <= radius) {
                    triggerGeofenceAlert(username, geofenceData, distance);
                }
            }

        } catch (Exception e) {
            log.error("Error checking geofence triggers for user {}: {}", username, e.getMessage());
        }
    }

    private void checkUpcomingGameAlerts() {
        try {
            OffsetDateTime soon = OffsetDateTime.now().plusMinutes(60); // Next hour
            List<Game> upcomingGames = gameRepository.findAll().stream()
                    .filter(g -> g.getTime() != null && 
                                g.getTime().isAfter(OffsetDateTime.now()) && 
                                g.getTime().isBefore(soon))
                    .filter(g -> g.getLatitude() != null && g.getLongitude() != null)
                    .collect(Collectors.toList());

            for (Game game : upcomingGames) {
                notifyUsersNearUpcomingGame(game);
            }

        } catch (Exception e) {
            log.error("Error checking upcoming game alerts: {}", e.getMessage());
        }
    }

    private void checkVenueAvailabilityAlerts() {
        try {
            // Check for venues that just became available
            List<Venue> venues = venueRepository.findActiveVenuesWithCoordinates();
            
            for (Venue venue : venues) {
                checkVenueAvailabilityChanges(venue);
            }

        } catch (Exception e) {
            log.error("Error checking venue availability alerts: {}", e.getMessage());
        }
    }

    private void checkNewActivityAlerts() {
        try {
            LocalDateTime recentThreshold = LocalDateTime.now().minusHours(1);
            
            // Check for new games
            List<Game> newGames = gameRepository.findAll().stream()
                    .filter(g -> g.getCreatedAt().toLocalDateTime().isAfter(recentThreshold))
                    .filter(g -> g.getLatitude() != null && g.getLongitude() != null)
                    .collect(Collectors.toList());

            for (Game game : newGames) {
                notifyUsersAboutNewGame(game);
            }

        } catch (Exception e) {
            log.error("Error checking new activity alerts: {}", e.getMessage());
        }
    }

    private List<String> findUsersNearLocation(double latitude, double longitude, double radiusKm) {
        return userLocations.entrySet().stream()
                .filter(entry -> {
                    UserLocationInfo location = entry.getValue();
                    double distance = locationService.calculateDistance(
                        latitude, longitude, location.getLatitude(), location.getLongitude());
                    return distance <= radiusKm;
                })
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private boolean userWantsAlert(String username, String alertType) {
        // Check user's alert preferences
        Set<String> userAlerts = userLocationAlerts.get(username);
        return userAlerts == null || userAlerts.contains(alertType.toLowerCase());
    }

    private List<GameWithDistance> findUrgentNearbyGames(UserLocationInfo location) {
        List<GameWithDistance> nearbyGames = locationService.findGamesNearLocation(
            location.getLatitude(), location.getLongitude(), DEFAULT_ALERT_RADIUS_KM, 10);
        
        return nearbyGames.stream()
                .filter(gwd -> {
                    Game game = gwd.getGame();
                    if (game.getTime() == null) return false;
                    
                    long minutesUntilStart = ChronoUnit.MINUTES.between(
                        OffsetDateTime.now(), game.getTime());
                    
                    return minutesUntilStart > 15 && minutesUntilStart <= 120; // 15min to 2 hours
                })
                .collect(Collectors.toList());
    }

    private void sendGameProximityAlert(String username, GameWithDistance gwd) {
        try {
            Game game = gwd.getGame();
            long minutesUntilStart = ChronoUnit.MINUTES.between(OffsetDateTime.now(), game.getTime());
            
            String title = "Game nearby starting soon!";
            String message = String.format("%s game at %s starts in %d minutes (%.1fkm away)",
                    game.getSport(), game.getLocation(), minutesUntilStart, gwd.getDistance());

            NotificationEvent notification = new NotificationEvent(
                username,
                title,
                message,
                "PROXIMITY_GAME_ALERT",
                "/games/" + game.getId()
            );
            
            realTimeEventService.publishEvent(notification);
            
            log.debug("Sent game proximity alert to {}: {} game in {}min", 
                     username, game.getSport(), minutesUntilStart);

        } catch (Exception e) {
            log.error("Error sending game proximity alert: {}", e.getMessage());
        }
    }

    private boolean hasMovedSignificantly(UserLocationInfo current, UserLocationInfo previous) {
        double distance = locationService.calculateDistance(
            current.getLatitude(), current.getLongitude(),
            previous.getLatitude(), previous.getLongitude());
        
        return distance > 2.0; // Moved more than 2km
    }

    private void checkForNewVenuesInArea(String username, UserLocationInfo location) {
        try {
            LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
            List<VenueWithDistance> nearbyVenues = locationService.findVenuesNearLocation(
                location.getLatitude(), location.getLongitude(), DEFAULT_ALERT_RADIUS_KM, 5);
            
            List<VenueWithDistance> newVenues = nearbyVenues.stream()
                    .filter(vwd -> vwd.getVenue().getCreatedAt().isAfter(oneWeekAgo))
                    .collect(Collectors.toList());

            for (VenueWithDistance vwd : newVenues) {
                sendNewVenueAlert(username, vwd);
            }

        } catch (Exception e) {
            log.error("Error checking for new venues for user {}: {}", username, e.getMessage());
        }
    }

    private void sendNewVenueAlert(String username, VenueWithDistance vwd) {
        try {
            Venue venue = vwd.getVenue();
            
            String title = "New venue discovered nearby!";
            String message = String.format("'%s' is now available %.1fkm from your location",
                    venue.getName(), vwd.getDistance());

            NotificationEvent notification = new NotificationEvent(
                username,
                title,
                message,
                "NEW_VENUE_ALERT",
                "/venues/" + venue.getId()
            );
            
            realTimeEventService.publishEvent(notification);

        } catch (Exception e) {
            log.error("Error sending new venue alert: {}", e.getMessage());
        }
    }

    private void triggerGeofenceAlert(String username, Map<Object, Object> geofenceData, double distance) {
        try {
            String geofenceName = (String) geofenceData.get("name");
            String triggerType = (String) geofenceData.get("triggerType");
            
            String title = "Area Alert: " + geofenceName;
            String message = String.format("You've entered %s (%.1fkm from center)", 
                                          geofenceName, distance);

            NotificationEvent notification = new NotificationEvent(
                username,
                title,
                message,
                "GEOFENCE_TRIGGER",
                "/location/areas/" + geofenceName
            );
            
            realTimeEventService.publishEvent(notification);
            
            log.debug("Triggered geofence alert for user {}: {}", username, geofenceName);

        } catch (Exception e) {
            log.error("Error triggering geofence alert: {}", e.getMessage());
        }
    }

    private void notifyUsersNearUpcomingGame(Game game) {
        try {
            List<String> nearbyUsers = findUsersNearLocation(
                game.getLatitude(), game.getLongitude(), 3.0); // 3km radius

            long minutesUntilStart = ChronoUnit.MINUTES.between(OffsetDateTime.now(), game.getTime());
            
            for (String username : nearbyUsers) {
                if (userWantsAlert(username, "upcoming_game")) {
                    String title = "Game starting soon nearby!";
                    String message = String.format("%s game at %s starts in %d minutes", 
                                                  game.getSport(), game.getLocation(), minutesUntilStart);

                    NotificationEvent notification = new NotificationEvent(
                        username,
                        title,
                        message,
                        "UPCOMING_GAME_NEARBY",
                        "/games/" + game.getId()
                    );
                    
                    realTimeEventService.publishEvent(notification);
                }
            }

        } catch (Exception e) {
            log.error("Error notifying users about upcoming game {}: {}", game.getId(), e.getMessage());
        }
    }

    private void checkVenueAvailabilityChanges(Venue venue) {
        try {
            // Check if venue just became available for popular time slots
            OffsetDateTime now = OffsetDateTime.now();
            OffsetDateTime evening = now.withHour(18).withMinute(0).withSecond(0);
            
            if (evening.isBefore(now)) {
                evening = evening.plusDays(1); // Tomorrow evening
            }

            // Check availability for prime time
            // This is simplified - in production you'd track availability changes
            List<String> interestedUsers = findUsersInterestedInVenue(venue);
            
            for (String username : interestedUsers) {
                sendVenueAvailabilityAlert(username, venue, evening);
            }

        } catch (Exception e) {
            log.error("Error checking venue availability changes for venue {}: {}", 
                     venue.getId(), e.getMessage());
        }
    }

    private void notifyUsersAboutNewGame(Game game) {
        try {
            List<String> nearbyUsers = findUsersNearLocation(
                game.getLatitude(), game.getLongitude(), 5.0); // 5km radius

            for (String username : nearbyUsers) {
                if (userWantsAlert(username, "new_game") && 
                    userInterestedInSport(username, game.getSport())) {
                    
                    String title = "New game in your area!";
                    String message = String.format("New %s game at %s - join now!", 
                                                  game.getSport(), game.getLocation());

                    NotificationEvent notification = new NotificationEvent(
                        username,
                        title,
                        message,
                        "NEW_GAME_NEARBY",
                        "/games/" + game.getId()
                    );
                    
                    realTimeEventService.publishEvent(notification);
                }
            }

        } catch (Exception e) {
            log.error("Error notifying users about new game {}: {}", game.getId(), e.getMessage());
        }
    }

    private List<String> findUsersInterestedInVenue(Venue venue) {
        // Find users who might be interested in this venue
        return userLocations.keySet().stream()
                .limit(10) // Limit for performance
                .collect(Collectors.toList());
    }

    private void sendVenueAvailabilityAlert(String username, Venue venue, OffsetDateTime time) {
        try {
            String title = "Venue now available!";
            String message = String.format("'%s' has availability for %s", 
                                          venue.getName(), time.toLocalTime());

            NotificationEvent notification = new NotificationEvent(
                username,
                title,
                message,
                "VENUE_AVAILABILITY",
                "/venues/" + venue.getId()
            );
            
            realTimeEventService.publishEvent(notification);

        } catch (Exception e) {
            log.error("Error sending venue availability alert: {}", e.getMessage());
        }
    }

    private boolean userInterestedInSport(String username, String sport) {
        // Check user's sport preferences/history
        return true; // Placeholder - would check user preferences
    }

    private List<String> generateLocationInsights(List<GameWithDistance> games, 
                                                List<VenueWithDistance> venues,
                                                UserLocationInfo location) {
        List<String> insights = new ArrayList<>();
        
        if (games.size() > 5) {
            insights.add("You're in a very active sports area with " + games.size() + " nearby games");
        } else if (games.isEmpty()) {
            insights.add("This area has limited sports activity - consider exploring nearby areas");
        }
        
        if (venues.size() > 3) {
            insights.add("Great venue selection with " + venues.size() + " facilities nearby");
        }
        
        // Analyze sports diversity
        Set<String> availableSports = games.stream()
                .map(gwd -> gwd.getGame().getSport())
                .collect(Collectors.toSet());
        
        if (availableSports.size() > 3) {
            insights.add("Excellent sports variety with " + availableSports.size() + " different sports");
        }
        
        return insights;
    }

    private List<LocationRecommendation> generateLocationRecommendations(
            List<GameWithDistance> games, List<VenueWithDistance> venues, UserLocationInfo location) {
        
        List<LocationRecommendation> recommendations = new ArrayList<>();
        
        // Recommend closest game
        if (!games.isEmpty()) {
            GameWithDistance closest = games.get(0);
            recommendations.add(LocationRecommendation.builder()
                    .type("CLOSEST_GAME")
                    .title("Join the closest game")
                    .description(String.format("%s game %.1fkm away at %s", 
                                              closest.getGame().getSport(), 
                                              closest.getDistance(),
                                              closest.getGame().getLocation()))
                    .actionUrl("/games/" + closest.getGame().getId())
                    .priority(LocationRecommendation.Priority.HIGH)
                    .build());
        }
        
        // Recommend best venue
        if (!venues.isEmpty()) {
            VenueWithDistance bestVenue = venues.get(0);
            recommendations.add(LocationRecommendation.builder()
                    .type("NEARBY_VENUE")
                    .title("Check out nearby venue")
                    .description(String.format("'%s' is %.1fkm away with great facilities", 
                                              bestVenue.getVenue().getName(), 
                                              bestVenue.getDistance()))
                    .actionUrl("/venues/" + bestVenue.getVenue().getId())
                    .priority(LocationRecommendation.Priority.MEDIUM)
                    .build());
        }
        
        return recommendations;
    }

    // Utility methods

    private double calculateGameUrgency(Game game) {
        if (game.getTime() == null) return 0.0;
        
        long minutesUntilStart = ChronoUnit.MINUTES.between(OffsetDateTime.now(), game.getTime());
        
        if (minutesUntilStart <= 30) return 100.0;
        if (minutesUntilStart <= 60) return 80.0;
        if (minutesUntilStart <= 120) return 60.0;
        return 30.0;
    }

    // Data Transfer Objects

    @lombok.Data
    @lombok.Builder
    public static class UserLocationInfo {
        private String username;
        private double latitude;
        private double longitude;
        private Instant timestamp;
        private String source;
        private Map<String, Object> metadata;
    }

    @lombok.Data
    @lombok.Builder
    public static class LocationAlertSubscription {
        private String name;
        private double latitude;
        private double longitude;
        private double radiusKm;
        private List<String> alertTypes;
        private List<String> sports;
        private boolean isActive;
    }

    @lombok.Data
    @lombok.Builder
    public static class ProximityAlertRequest {
        private double latitude;
        private double longitude;
        private double alertRadiusKm;
        private String alertType;
        private String title;
        private String message;
        private String severity;
        private String locationName;
        private String actionUrl;
    }

    @lombok.Data
    @lombok.Builder
    public static class GeofenceDefinition {
        private String name;
        private double centerLatitude;
        private double centerLongitude;
        private double radiusKm;
        private TriggerType triggerType;
        private boolean isActive;
        
        public enum TriggerType {
            ENTER, EXIT, DWELL
        }
    }

    @lombok.Data
    @lombok.Builder
    public static class LocationInsights {
        private String username;
        private boolean hasLocationData;
        private LocationPoint currentLocation;
        private Instant lastUpdated;
        private int nearbyGamesCount;
        private int nearbyVenuesCount;
        private List<String> insights;
        private List<LocationRecommendation> recommendations;
        private LocationService.LocationAnalysis areaAnalysis;
        private String message;
    }

    @lombok.Data
    @lombok.Builder
    public static class LocationRecommendation {
        private String type;
        private String title;
        private String description;
        private String actionUrl;
        private Priority priority;
        
        public enum Priority {
            LOW, MEDIUM, HIGH, URGENT
        }
    }
}
