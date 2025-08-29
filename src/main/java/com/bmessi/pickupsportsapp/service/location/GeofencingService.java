package com.bmessi.pickupsportsapp.service.location;

import com.bmessi.pickupsportsapp.realtime.service.RealTimeEventService;
import com.bmessi.pickupsportsapp.realtime.event.LocationUpdateEvent;
import com.bmessi.pickupsportsapp.realtime.event.NotificationEvent;
import com.bmessi.pickupsportsapp.service.location.LocationService.LocationPoint;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Advanced geofencing service for location-based triggers and area management.
 * 
 * Features:
 * - Dynamic geofence creation and management
 * - Real-time location monitoring
 * - Multi-trigger geofences (enter, exit, dwell)
 * - Area-based event notifications
 * - Location analytics and insights
 * - Smart area recommendations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GeofencingService {

    private final LocationService locationService;
    private final RealTimeEventService realTimeEventService;
    private final RedisTemplate<String, String> redisTemplate;

    // In-memory tracking for active geofences and user states
    private final Map<String, Set<String>> activeGeofences = new ConcurrentHashMap<>();
    private final Map<String, UserGeofenceState> userGeofenceStates = new ConcurrentHashMap<>();
    private final Map<String, Instant> userLastLocationUpdate = new ConcurrentHashMap<>();

    // Redis keys
    private static final String GEOFENCE_DEFINITION_KEY = "geofence:def:%s";
    private static final String USER_GEOFENCE_STATE_KEY = "geofence:user:%s";
    private static final String GEOFENCE_ANALYTICS_KEY = "geofence:analytics:%s";

    /**
     * Create a new geofence with specified triggers and actions.
     */
    public GeofenceResult createGeofence(GeofenceDefinition definition) {
        try {
            // Validate geofence parameters
            validateGeofenceDefinition(definition);

            // Store geofence definition
            String geofenceKey = String.format(GEOFENCE_DEFINITION_KEY, definition.getId());
            Map<String, String> geofenceData = Map.of(
                "id", definition.getId(),
                "name", definition.getName(),
                "latitude", String.valueOf(definition.getCenterLatitude()),
                "longitude", String.valueOf(definition.getCenterLongitude()),
                "radius", String.valueOf(definition.getRadiusKm()),
                "triggerTypes", String.join(",", definition.getTriggerTypes()),
                "isActive", String.valueOf(definition.isActive()),
                "createdAt", Instant.now().toString(),
                "description", definition.getDescription() != null ? definition.getDescription() : "",
                "category", definition.getCategory() != null ? definition.getCategory() : "GENERAL"
            );

            redisTemplate.opsForHash().putAll(geofenceKey, geofenceData);
            redisTemplate.expire(geofenceKey, 365, TimeUnit.DAYS);

            // Add to active tracking if enabled
            if (definition.isActive()) {
                activeGeofences.computeIfAbsent(definition.getCategory(), k -> ConcurrentHashMap.newKeySet())
                              .add(definition.getId());
            }

            log.info("Created geofence '{}' at ({}, {}) with radius {}km", 
                    definition.getName(), definition.getCenterLatitude(), 
                    definition.getCenterLongitude(), definition.getRadiusKm());

            return GeofenceResult.builder()
                    .success(true)
                    .geofenceId(definition.getId())
                    .message("Geofence created successfully")
                    .build();

        } catch (Exception e) {
            log.error("Error creating geofence: {}", e.getMessage());
            return GeofenceResult.builder()
                    .success(false)
                    .message("Error creating geofence: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Process user location update and check geofence triggers.
     */
    public List<GeofenceEvent> processLocationUpdate(String username, double latitude, double longitude) {
        try {
            LocationPoint currentLocation = new LocationPoint(latitude, longitude);
            Instant now = Instant.now();

            // Get user's previous geofence state
            UserGeofenceState previousState = userGeofenceStates.get(username);
            UserGeofenceState currentState = UserGeofenceState.builder()
                    .username(username)
                    .currentLocation(currentLocation)
                    .timestamp(now)
                    .activeGeofences(new HashSet<>())
                    .build();

            List<GeofenceEvent> events = new ArrayList<>();

            // Check all active geofences
            for (Set<String> geofenceIds : activeGeofences.values()) {
                for (String geofenceId : geofenceIds) {
                    GeofenceDefinition geofence = getGeofenceDefinition(geofenceId);
                    if (geofence == null || !geofence.isActive()) continue;

                    // Calculate distance to geofence center
                    double distance = locationService.calculateDistance(
                        latitude, longitude, 
                        geofence.getCenterLatitude(), geofence.getCenterLongitude());

                    boolean isInside = distance <= geofence.getRadiusKm();
                    boolean wasInside = previousState != null && 
                                       previousState.getActiveGeofences().contains(geofenceId);

                    // Detect geofence events
                    if (isInside && !wasInside) {
                        // ENTER event
                        if (geofence.getTriggerTypes().contains("ENTER")) {
                            events.add(createGeofenceEvent(username, geofence, "ENTER", distance));
                        }
                        currentState.getActiveGeofences().add(geofenceId);
                        
                    } else if (!isInside && wasInside) {
                        // EXIT event
                        if (geofence.getTriggerTypes().contains("EXIT")) {
                            events.add(createGeofenceEvent(username, geofence, "EXIT", distance));
                        }
                        
                    } else if (isInside && wasInside) {
                        // DWELL event (check if user has been inside for specified time)
                        if (geofence.getTriggerTypes().contains("DWELL")) {
                            if (checkDwellTime(username, geofenceId, geofence.getDwellTimeMinutes())) {
                                events.add(createGeofenceEvent(username, geofence, "DWELL", distance));
                            }
                        }
                        currentState.getActiveGeofences().add(geofenceId);
                    }
                }
            }

            // Update user state
            userGeofenceStates.put(username, currentState);
            userLastLocationUpdate.put(username, now);

            // Store in Redis for persistence
            storeUserGeofenceState(username, currentState);

            // Process events
            for (GeofenceEvent event : events) {
                processGeofenceEvent(event);
            }

            log.debug("Processed location update for user {}: {} geofence events triggered", 
                     username, events.size());

            return events;

        } catch (Exception e) {
            log.error("Error processing location update for user {}: {}", username, e.getMessage());
            return List.of();
        }
    }

    /**
     * Get geofence analytics and insights.
     */
    public GeofenceAnalytics getGeofenceAnalytics(String geofenceId, int days) {
        try {
            GeofenceDefinition geofence = getGeofenceDefinition(geofenceId);
            if (geofence == null) {
                return GeofenceAnalytics.builder().build();
            }

            // Get analytics data from Redis
            String analyticsKey = String.format(GEOFENCE_ANALYTICS_KEY, geofenceId);
            Map<Object, Object> analyticsData = redisTemplate.opsForHash().entries(analyticsKey);

            // Calculate metrics
            int totalTriggers = Integer.parseInt((String) analyticsData.getOrDefault("totalTriggers", "0"));
            int uniqueUsers = Integer.parseInt((String) analyticsData.getOrDefault("uniqueUsers", "0"));
            
            Map<String, Integer> triggerTypeBreakdown = parseTriggerBreakdown(
                (String) analyticsData.getOrDefault("triggerBreakdown", ""));

            return GeofenceAnalytics.builder()
                    .geofenceId(geofenceId)
                    .geofence(geofence)
                    .analysisPeriodDays(days)
                    .totalTriggers(totalTriggers)
                    .uniqueUsers(uniqueUsers)
                    .triggerTypeBreakdown(triggerTypeBreakdown)
                    .averageTriggersPerUser(uniqueUsers > 0 ? (double) totalTriggers / uniqueUsers : 0.0)
                    .popularTimes(getPopularTriggerTimes(geofenceId))
                    .build();

        } catch (Exception e) {
            log.error("Error getting geofence analytics for {}: {}", geofenceId, e.getMessage());
            return GeofenceAnalytics.builder().build();
        }
    }

    /**
     * Get all geofences affecting a location.
     */
    public List<GeofenceDefinition> getGeofencesAtLocation(double latitude, double longitude) {
        List<GeofenceDefinition> affectingGeofences = new ArrayList<>();

        try {
            // Check all active geofences
            for (Set<String> geofenceIds : activeGeofences.values()) {
                for (String geofenceId : geofenceIds) {
                    GeofenceDefinition geofence = getGeofenceDefinition(geofenceId);
                    if (geofence == null || !geofence.isActive()) continue;

                    double distance = locationService.calculateDistance(
                        latitude, longitude,
                        geofence.getCenterLatitude(), geofence.getCenterLongitude());

                    if (distance <= geofence.getRadiusKm()) {
                        affectingGeofences.add(geofence);
                    }
                }
            }

        } catch (Exception e) {
            log.error("Error getting geofences at location ({}, {}): {}", latitude, longitude, e.getMessage());
        }

        return affectingGeofences;
    }

    /**
     * Create area-based geofences for popular locations.
     */
    public void createPopularAreaGeofences() {
        try {
            // Get activity hotspots
            List<LocationService.ActivityHotspot> hotspots = locationService
                    .getActivityHotspots(0.0, 0.0, 50.0, 10); // Global search

            for (LocationService.ActivityHotspot hotspot : hotspots) {
                if (hotspot.getActivityCount() >= 5) { // Minimum activity threshold
                    GeofenceDefinition geofence = GeofenceDefinition.builder()
                            .id("hotspot_" + UUID.randomUUID().toString().substring(0, 8))
                            .name(hotspot.getName())
                            .description(hotspot.getDescription())
                            .centerLatitude(hotspot.getCenterLocation().getLatitude())
                            .centerLongitude(hotspot.getCenterLocation().getLongitude())
                            .radiusKm(Math.max(1.0, hotspot.getRadius()))
                            .triggerTypes(List.of("ENTER", "EXIT"))
                            .category("ACTIVITY_HOTSPOT")
                            .isActive(true)
                            .dwellTimeMinutes(10)
                            .build();

                    createGeofence(geofence);
                }
            }

            log.info("Created geofences for {} activity hotspots", hotspots.size());

        } catch (Exception e) {
            log.error("Error creating popular area geofences: {}", e.getMessage());
        }
    }

    // Private helper methods

    private void validateGeofenceDefinition(GeofenceDefinition definition) {
        if (definition.getId() == null || definition.getId().trim().isEmpty()) {
            throw new IllegalArgumentException("Geofence ID is required");
        }
        if (definition.getName() == null || definition.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Geofence name is required");
        }
        if (definition.getRadiusKm() <= 0 || definition.getRadiusKm() > 100) {
            throw new IllegalArgumentException("Geofence radius must be between 0 and 100 km");
        }
        if (definition.getCenterLatitude() < -90 || definition.getCenterLatitude() > 90) {
            throw new IllegalArgumentException("Invalid latitude");
        }
        if (definition.getCenterLongitude() < -180 || definition.getCenterLongitude() > 180) {
            throw new IllegalArgumentException("Invalid longitude");
        }
    }

    private GeofenceDefinition getGeofenceDefinition(String geofenceId) {
        try {
            String geofenceKey = String.format(GEOFENCE_DEFINITION_KEY, geofenceId);
            Map<Object, Object> data = redisTemplate.opsForHash().entries(geofenceKey);
            
            if (data.isEmpty()) return null;

            return GeofenceDefinition.builder()
                    .id((String) data.get("id"))
                    .name((String) data.get("name"))
                    .centerLatitude(Double.parseDouble((String) data.get("latitude")))
                    .centerLongitude(Double.parseDouble((String) data.get("longitude")))
                    .radiusKm(Double.parseDouble((String) data.get("radius")))
                    .triggerTypes(Arrays.asList(((String) data.get("triggerTypes")).split(",")))
                    .isActive(Boolean.parseBoolean((String) data.get("isActive")))
                    .description((String) data.get("description"))
                    .category((String) data.get("category"))
                    .dwellTimeMinutes(10) // Default dwell time
                    .build();

        } catch (Exception e) {
            log.error("Error getting geofence definition for {}: {}", geofenceId, e.getMessage());
            return null;
        }
    }

    private GeofenceEvent createGeofenceEvent(String username, GeofenceDefinition geofence, 
                                            String triggerType, double distance) {
        return GeofenceEvent.builder()
                .username(username)
                .geofenceId(geofence.getId())
                .geofenceName(geofence.getName())
                .triggerType(triggerType)
                .distance(distance)
                .timestamp(Instant.now())
                .location(new LocationPoint(geofence.getCenterLatitude(), geofence.getCenterLongitude()))
                .build();
    }

    private void processGeofenceEvent(GeofenceEvent event) {
        try {
            // Update analytics
            updateGeofenceAnalytics(event);

            // Send appropriate notifications
            sendGeofenceNotification(event);

            // Trigger any custom actions
            triggerGeofenceActions(event);

            log.debug("Processed geofence event: {} {} {} at distance {:.2f}km", 
                     event.getUsername(), event.getTriggerType(), 
                     event.getGeofenceName(), event.getDistance());

        } catch (Exception e) {
            log.error("Error processing geofence event: {}", e.getMessage());
        }
    }

    private boolean checkDwellTime(String username, String geofenceId, Integer dwellTimeMinutes) {
        if (dwellTimeMinutes == null) return false;
        
        UserGeofenceState state = userGeofenceStates.get(username);
        if (state == null) return false;

        // Check if user has been in geofence long enough
        Instant enterTime = state.getGeofenceEnterTimes().get(geofenceId);
        if (enterTime == null) return false;

                    long minutesInside = java.time.temporal.ChronoUnit.MINUTES.between(enterTime, Instant.now());
        return minutesInside >= dwellTimeMinutes;
    }

    private void storeUserGeofenceState(String username, UserGeofenceState state) {
        try {
            String stateKey = String.format(USER_GEOFENCE_STATE_KEY, username);
            
            Map<String, String> stateData = Map.of(
                "latitude", String.valueOf(state.getCurrentLocation().getLatitude()),
                "longitude", String.valueOf(state.getCurrentLocation().getLongitude()),
                "timestamp", state.getTimestamp().toString(),
                "activeGeofences", String.join(",", state.getActiveGeofences())
            );
            
            redisTemplate.opsForHash().putAll(stateKey, stateData);
            redisTemplate.expire(stateKey, 7, TimeUnit.DAYS);

        } catch (Exception e) {
            log.error("Error storing geofence state for user {}: {}", username, e.getMessage());
        }
    }

    private void updateGeofenceAnalytics(GeofenceEvent event) {
        try {
            String analyticsKey = String.format(GEOFENCE_ANALYTICS_KEY, event.getGeofenceId());
            
            // Increment counters
            redisTemplate.opsForHash().increment(analyticsKey, "totalTriggers", 1);
            redisTemplate.opsForHash().increment(analyticsKey, "trigger_" + event.getTriggerType(), 1);
            
            // Track unique users
            String usersKey = analyticsKey + ":users";
            redisTemplate.opsForSet().add(usersKey, event.getUsername());
            
            // Update unique user count
            Long uniqueUsers = redisTemplate.opsForSet().size(usersKey);
            redisTemplate.opsForHash().put(analyticsKey, "uniqueUsers", String.valueOf(uniqueUsers));
            
            // Set expiry
            redisTemplate.expire(analyticsKey, 30, TimeUnit.DAYS);
            redisTemplate.expire(usersKey, 30, TimeUnit.DAYS);

        } catch (Exception e) {
            log.error("Error updating geofence analytics: {}", e.getMessage());
        }
    }

    private void sendGeofenceNotification(GeofenceEvent event) {
        try {
            GeofenceDefinition geofence = getGeofenceDefinition(event.getGeofenceId());
            if (geofence == null) return;

            String title = generateGeofenceNotificationTitle(event, geofence);
            String message = generateGeofenceNotificationMessage(event, geofence);

            NotificationEvent notification = new NotificationEvent(
                event.getUsername(),
                title,
                message,
                "GEOFENCE_" + event.getTriggerType(),
                "/location/areas/" + geofence.getId()
            );
            
            realTimeEventService.publishEvent(notification);

            // Also send location update event
            LocationUpdateEvent locationUpdate = new LocationUpdateEvent(
                geofence.getName(),
                "GEOFENCE_TRIGGER",
                title,
                message,
                "INFO"
            );
            
            realTimeEventService.publishEvent(locationUpdate);

        } catch (Exception e) {
            log.error("Error sending geofence notification: {}", e.getMessage());
        }
    }

    private void triggerGeofenceActions(GeofenceEvent event) {
        try {
            GeofenceDefinition geofence = getGeofenceDefinition(event.getGeofenceId());
            if (geofence == null) return;

            // Trigger category-specific actions
            switch (geofence.getCategory()) {
                case "ACTIVITY_HOTSPOT" -> {
                    if ("ENTER".equals(event.getTriggerType())) {
                        sendActivityHotspotWelcome(event.getUsername(), geofence);
                    }
                }
                case "SPORTS_COMPLEX" -> {
                    if ("ENTER".equals(event.getTriggerType())) {
                        sendSportsComplexInfo(event.getUsername(), geofence);
                    }
                }
                case "EVENT_AREA" -> {
                    sendEventAreaAlert(event.getUsername(), geofence, event.getTriggerType());
                }
                default -> {
                    // Default action - just log
                    log.debug("Geofence trigger for category {}: {}", geofence.getCategory(), event);
                }
            }

        } catch (Exception e) {
            log.error("Error triggering geofence actions: {}", e.getMessage());
        }
    }

    private String generateGeofenceNotificationTitle(GeofenceEvent event, GeofenceDefinition geofence) {
        return switch (event.getTriggerType()) {
            case "ENTER" -> "Welcome to " + geofence.getName() + "!";
            case "EXIT" -> "Thanks for visiting " + geofence.getName();
            case "DWELL" -> "Enjoying your time at " + geofence.getName() + "?";
            default -> "Location Update";
        };
    }

    private String generateGeofenceNotificationMessage(GeofenceEvent event, GeofenceDefinition geofence) {
        return switch (event.getTriggerType()) {
            case "ENTER" -> String.format("You've entered %s. %s", 
                                        geofence.getName(), 
                                        geofence.getDescription() != null ? geofence.getDescription() : 
                                        "Check out what's happening here!");
            case "EXIT" -> String.format("You've left %s. Rate your experience!", geofence.getName());
            case "DWELL" -> String.format("You've been at %s for a while. Discovered anything interesting?", 
                                        geofence.getName());
            default -> "Location-based update for " + geofence.getName();
        };
    }

    private void sendActivityHotspotWelcome(String username, GeofenceDefinition geofence) {
        try {
            // Find active games in the hotspot
            List<LocationService.GameWithDistance> nearbyGames = locationService
                    .findGamesNearLocation(geofence.getCenterLatitude(), geofence.getCenterLongitude(), 
                                         geofence.getRadiusKm(), 5);

            if (!nearbyGames.isEmpty()) {
                String message = String.format("Welcome to %s! There are %d active games nearby.", 
                                              geofence.getName(), nearbyGames.size());

                NotificationEvent notification = new NotificationEvent(
                    username,
                    "🎯 Activity Hotspot Discovered!",
                    message,
                    "HOTSPOT_WELCOME",
                    "/games/search?lat=" + geofence.getCenterLatitude() + 
                    "&lng=" + geofence.getCenterLongitude()
                );
                
                realTimeEventService.publishEvent(notification);
            }

        } catch (Exception e) {
            log.error("Error sending activity hotspot welcome: {}", e.getMessage());
        }
    }

    private void sendSportsComplexInfo(String username, GeofenceDefinition geofence) {
        try {
            // Find venues in the sports complex
            List<LocationService.VenueWithDistance> nearbyVenues = locationService
                    .findVenuesNearLocation(geofence.getCenterLatitude(), geofence.getCenterLongitude(), 
                                          geofence.getRadiusKm(), 10);

            if (!nearbyVenues.isEmpty()) {
                String message = String.format("You're at %s with %d sports facilities available!", 
                                              geofence.getName(), nearbyVenues.size());

                NotificationEvent notification = new NotificationEvent(
                    username,
                    "🏟️ Sports Complex",
                    message,
                    "SPORTS_COMPLEX_INFO",
                    "/venues/search?lat=" + geofence.getCenterLatitude() + 
                    "&lng=" + geofence.getCenterLongitude()
                );
                
                realTimeEventService.publishEvent(notification);
            }

        } catch (Exception e) {
            log.error("Error sending sports complex info: {}", e.getMessage());
        }
    }

    private void sendEventAreaAlert(String username, GeofenceDefinition geofence, String triggerType) {
        try {
            String message = "ENTER".equals(triggerType) ? 
                           "You've entered an event area. Check what's happening!" :
                           "You've left the event area. Thanks for participating!";

            NotificationEvent notification = new NotificationEvent(
                username,
                "📅 Event Area",
                message,
                "EVENT_AREA_" + triggerType,
                "/events/area/" + geofence.getId()
            );
            
            realTimeEventService.publishEvent(notification);

        } catch (Exception e) {
            log.error("Error sending event area alert: {}", e.getMessage());
        }
    }

    private Map<String, Integer> parseTriggerBreakdown(String triggerBreakdownStr) {
        if (triggerBreakdownStr.isEmpty()) return Map.of();
        
        Map<String, Integer> breakdown = new HashMap<>();
        String[] parts = triggerBreakdownStr.split(";");
        
        for (String part : parts) {
            String[] keyValue = part.split(":");
            if (keyValue.length == 2) {
                breakdown.put(keyValue[0], Integer.parseInt(keyValue[1]));
            }
        }
        
        return breakdown;
    }

    private Map<String, Integer> getPopularTriggerTimes(String geofenceId) {
        // Analyze when geofence triggers most often
        return Map.of(
            "MORNING", 20,
            "AFTERNOON", 35,
            "EVENING", 30,
            "NIGHT", 15
        ); // Placeholder data
    }

    /**
     * Perform cleanup of expired location data.
     */
    public void performLocationCleanup() {
        try {
            Instant cutoff = Instant.now().minus(24, ChronoUnit.HOURS);
            
            // Clean up old user locations
            userLastLocationUpdate.entrySet().removeIf(entry -> {
                if (entry.getValue().isBefore(cutoff)) {
                    userLocations.remove(entry.getKey());
                    userGeofenceStates.remove(entry.getKey());
                    return true;
                }
                return false;
            });

            log.debug("Performed location cleanup, removed stale data older than {}", cutoff);

        } catch (Exception e) {
            log.error("Error during location cleanup: {}", e.getMessage());
        }
    }

    // Data Transfer Objects

    @lombok.Data
    @lombok.Builder
    public static class GeofenceDefinition {
        private String id;
        private String name;
        private String description;
        private double centerLatitude;
        private double centerLongitude;
        private double radiusKm;
        private List<String> triggerTypes; // ENTER, EXIT, DWELL
        private String category;
        private boolean isActive;
        private Integer dwellTimeMinutes;
        private Map<String, Object> metadata;
    }

    @lombok.Data
    @lombok.Builder
    public static class GeofenceEvent {
        private String username;
        private String geofenceId;
        private String geofenceName;
        private String triggerType;
        private double distance;
        private Instant timestamp;
        private LocationPoint location;
    }

    @lombok.Data
    @lombok.Builder
    public static class GeofenceResult {
        private boolean success;
        private String geofenceId;
        private String message;
    }

    @lombok.Data
    @lombok.Builder
    public static class UserGeofenceState {
        private String username;
        private LocationPoint currentLocation;
        private Instant timestamp;
        private Set<String> activeGeofences;
        private Map<String, Instant> geofenceEnterTimes;
        
        public static class UserGeofenceStateBuilder {
            private Map<String, Instant> geofenceEnterTimes = new HashMap<>();
            
            public UserGeofenceStateBuilder geofenceEnterTimes(Map<String, Instant> geofenceEnterTimes) {
                this.geofenceEnterTimes = geofenceEnterTimes;
                return this;
            }
        }
    }

    @lombok.Data
    @lombok.Builder
    public static class GeofenceAnalytics {
        private String geofenceId;
        private GeofenceDefinition geofence;
        private int analysisPeriodDays;
        private int totalTriggers;
        private int uniqueUsers;
        private Map<String, Integer> triggerTypeBreakdown;
        private double averageTriggersPerUser;
        private Map<String, Integer> popularTimes;
    }
}
