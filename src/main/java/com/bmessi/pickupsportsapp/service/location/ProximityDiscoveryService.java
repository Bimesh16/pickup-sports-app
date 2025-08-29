package com.bmessi.pickupsportsapp.service.location;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.VenueRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.service.location.LocationService.GameWithDistance;
import com.bmessi.pickupsportsapp.service.location.LocationService.VenueWithDistance;
import com.bmessi.pickupsportsapp.service.location.LocationService.LocationPoint;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Advanced proximity-based discovery service for intelligent game and venue recommendations.
 * 
 * Features:
 * - Smart proximity search with multiple criteria
 * - Travel time estimation and route optimization
 * - Dynamic radius adjustment based on area density
 * - Multi-modal discovery (games, venues, players)
 * - Context-aware recommendations
 * - Real-time proximity alerts
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProximityDiscoveryService {

    private final LocationService locationService;
    private final GameRepository gameRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;

    /**
     * Discover games using intelligent proximity search.
     */
    @Transactional(readOnly = true)
    public SmartProximityResults discoverGamesNearby(ProximitySearchRequest request) {
        try {
            // Validate search parameters
            validateSearchRequest(request);

            // Determine optimal search radius based on area density
            double optimalRadius = calculateOptimalSearchRadius(
                request.getLatitude(), request.getLongitude(), request.getMaxRadius());

            // Find games within radius
            List<GameWithDistance> nearbyGames = locationService.findGamesNearLocation(
                request.getLatitude(), request.getLongitude(), optimalRadius, request.getMaxResults() * 2);

            // Apply advanced filtering
            List<GameWithDistance> filteredGames = applyAdvancedFiltering(nearbyGames, request);

            // Apply intelligent ranking
            List<SmartGameRecommendation> rankedRecommendations = applyIntelligentRanking(
                filteredGames, request);

            // Find alternative suggestions if results are limited
            List<AlternativeLocation> alternatives = findAlternativeLocations(request, filteredGames.size());

            return SmartProximityResults.builder()
                    .searchLocation(new LocationPoint(request.getLatitude(), request.getLongitude()))
                    .searchRadiusKm(optimalRadius)
                    .totalFound(filteredGames.size())
                    .recommendations(rankedRecommendations.stream()
                            .limit(request.getMaxResults())
                            .collect(Collectors.toList()))
                    .alternatives(alternatives)
                    .searchInsights(generateSearchInsights(filteredGames, optimalRadius))
                    .build();

        } catch (Exception e) {
            log.error("Error in proximity discovery: {}", e.getMessage());
            return SmartProximityResults.builder().build();
        }
    }

    /**
     * Find optimal venues for a specific sport and location.
     */
    @Transactional(readOnly = true)
    public VenueDiscoveryResults discoverOptimalVenues(VenueSearchRequest request) {
        try {
            List<VenueWithDistance> nearbyVenues = locationService.findVenuesNearLocation(
                request.getLatitude(), request.getLongitude(), request.getMaxRadius(), 100);

            // Filter by sport support
            if (request.getSport() != null) {
                nearbyVenues = nearbyVenues.stream()
                        .filter(vwd -> venueSupportsActivities(vwd.getVenue(), request.getSport()))
                        .collect(Collectors.toList());
            }

            // Filter by time availability
            if (request.getDesiredTime() != null) {
                nearbyVenues = nearbyVenues.stream()
                        .filter(vwd -> isVenueAvailable(vwd.getVenue(), request.getDesiredTime()))
                        .collect(Collectors.toList());
            }

            // Filter by capacity requirements
            if (request.getMinCapacity() != null) {
                nearbyVenues = nearbyVenues.stream()
                        .filter(vwd -> vwd.getVenue().getMaxCapacity() >= request.getMinCapacity())
                        .collect(Collectors.toList());
            }

            // Rank venues by suitability
            List<RankedVenue> rankedVenues = rankVenuesBySuitability(nearbyVenues, request);

            return VenueDiscoveryResults.builder()
                    .searchLocation(new LocationPoint(request.getLatitude(), request.getLongitude()))
                    .sport(request.getSport())
                    .totalFound(rankedVenues.size())
                    .venues(rankedVenues.stream().limit(request.getMaxResults()).collect(Collectors.toList()))
                    .searchSummary(generateVenueSearchSummary(rankedVenues))
                    .build();

        } catch (Exception e) {
            log.error("Error discovering venues: {}", e.getMessage());
            return VenueDiscoveryResults.builder().build();
        }
    }

    /**
     * Find players and games within commuting distance.
     */
    @Transactional(readOnly = true)
    public CommuteBasedDiscovery discoverWithinCommute(CommuteSearchRequest request) {
        try {
            // Calculate travel time-based radius (simplified)
            double radiusKm = estimateRadiusFromTravelTime(request.getMaxTravelMinutes(), 
                                                         request.getTransportMode());

            List<GameWithDistance> nearbyGames = locationService.findGamesNearLocation(
                request.getStartLatitude(), request.getStartLongitude(), radiusKm, 50);

            // Group by travel time zones
            Map<String, List<GameWithDistance>> travelZones = groupByTravelTime(nearbyGames, request);

            // Analyze commute patterns
            CommuteAnalysis analysis = analyzeCommutePatterns(nearbyGames, request);

            return CommuteBasedDiscovery.builder()
                    .startLocation(new LocationPoint(request.getStartLatitude(), request.getStartLongitude()))
                    .maxTravelMinutes(request.getMaxTravelMinutes())
                    .transportMode(request.getTransportMode())
                    .estimatedRadiusKm(radiusKm)
                    .gamesByTravelZone(travelZones)
                    .commuteAnalysis(analysis)
                    .optimalGames(selectOptimalGamesForCommute(nearbyGames, request))
                    .build();

        } catch (Exception e) {
            log.error("Error in commute-based discovery: {}", e.getMessage());
            return CommuteBasedDiscovery.builder().build();
        }
    }

    /**
     * Multi-location discovery for users who frequent multiple areas.
     */
    @Transactional(readOnly = true)
    public MultiLocationDiscovery discoverAcrossMultipleLocations(List<LocationPoint> locations, 
                                                                String sport, int maxResults) {
        try {
            Map<LocationPoint, List<GameWithDistance>> locationResults = new HashMap<>();
            
            for (LocationPoint location : locations) {
                List<GameWithDistance> games = locationService.findGamesNearLocation(
                    location.getLatitude(), location.getLongitude(), 5.0, maxResults);
                
                if (sport != null) {
                    games = games.stream()
                            .filter(gwd -> sport.equals(gwd.getGame().getSport()))
                            .collect(Collectors.toList());
                }
                
                locationResults.put(location, games);
            }

            // Find overlapping areas and connections
            List<LocationConnection> connections = findLocationConnections(locationResults);

            // Aggregate and rank all results
            List<GameWithDistance> allGames = locationResults.values().stream()
                    .flatMap(List::stream)
                    .distinct()
                    .sorted(Comparator.comparing(GameWithDistance::getDistance))
                    .limit(maxResults)
                    .collect(Collectors.toList());

            return MultiLocationDiscovery.builder()
                    .searchLocations(locations)
                    .sport(sport)
                    .resultsByLocation(locationResults)
                    .connections(connections)
                    .aggregatedResults(allGames)
                    .totalUniqueGames(allGames.size())
                    .build();

        } catch (Exception e) {
            log.error("Error in multi-location discovery: {}", e.getMessage());
            return MultiLocationDiscovery.builder().build();
        }
    }

    /**
     * Get real-time proximity alerts for active users.
     */
    public List<ProximityAlert> getProximityAlerts(String username, double latitude, double longitude) {
        try {
            List<ProximityAlert> alerts = new ArrayList<>();

            // Find games starting soon nearby
            List<GameWithDistance> urgentGames = findUrgentNearbyGames(latitude, longitude, 2.0, 60); // 2km, 60min

            for (GameWithDistance gwd : urgentGames) {
                alerts.add(ProximityAlert.builder()
                        .alertType("URGENT_GAME_NEARBY")
                        .title("Game starting soon nearby!")
                        .message(String.format("%s game at %s starts in %d minutes (%.1fkm away)",
                                gwd.getGame().getSport(), 
                                gwd.getGame().getLocation(),
                                getMinutesUntilStart(gwd.getGame()),
                                gwd.getDistance()))
                        .game(gwd.getGame())
                        .distance(gwd.getDistance())
                        .urgency(calculateUrgency(gwd))
                        .actionUrl("/games/" + gwd.getGame().getId())
                        .build());
            }

            // Find new venues in the area
            List<VenueWithDistance> newVenues = findRecentlyAddedVenues(latitude, longitude, 5.0);
            for (VenueWithDistance vwd : newVenues) {
                alerts.add(ProximityAlert.builder()
                        .alertType("NEW_VENUE_NEARBY")
                        .title("New venue discovered!")
                        .message(String.format("New venue '%s' opened nearby (%.1fkm away)",
                                vwd.getVenue().getName(), vwd.getDistance()))
                        .venue(vwd.getVenue())
                        .distance(vwd.getDistance())
                        .urgency(ProximityAlert.Urgency.LOW)
                        .actionUrl("/venues/" + vwd.getVenue().getId())
                        .build());
            }

            return alerts;

        } catch (Exception e) {
            log.error("Error getting proximity alerts for user {}: {}", username, e.getMessage());
            return List.of();
        }
    }

    // Private helper methods

    private void validateSearchRequest(ProximitySearchRequest request) {
        if (request.getLatitude() < -90 || request.getLatitude() > 90) {
            throw new IllegalArgumentException("Invalid latitude");
        }
        if (request.getLongitude() < -180 || request.getLongitude() > 180) {
            throw new IllegalArgumentException("Invalid longitude");
        }
        if (request.getMaxRadius() <= 0 || request.getMaxRadius() > 100) {
            throw new IllegalArgumentException("Search radius must be between 0 and 100 km");
        }
    }

    private double calculateOptimalSearchRadius(double lat, double lon, double maxRadius) {
        // Start with a smaller radius and expand if not enough results
        double[] radiusSteps = {1.0, 2.0, 5.0, 10.0, 20.0, maxRadius};
        
        for (double radius : radiusSteps) {
            List<GameWithDistance> games = locationService.findGamesNearLocation(lat, lon, radius, 10);
            if (games.size() >= 5 || radius >= maxRadius) { // Found enough or reached max
                return radius;
            }
        }
        
        return maxRadius;
    }

    private List<GameWithDistance> applyAdvancedFiltering(List<GameWithDistance> games, 
                                                        ProximitySearchRequest request) {
        return games.stream()
                .filter(gwd -> {
                    Game game = gwd.getGame();
                    
                    // Filter by sport
                    if (request.getSport() != null && !request.getSport().equals(game.getSport())) {
                        return false;
                    }
                    
                    // Filter by time window
                    if (request.getTimeWindow() != null) {
                        if (!isGameInTimeWindow(game, request.getTimeWindow())) {
                            return false;
                        }
                    }
                    
                    // Filter by skill level
                    if (request.getSkillLevel() != null && 
                        !isSkillLevelMatch(game.getSkillLevel(), request.getSkillLevel())) {
                        return false;
                    }
                    
                    // Filter by availability
                    if (request.isOnlyAvailable() && !isGameAvailable(game)) {
                        return false;
                    }
                    
                    return true;
                })
                .collect(Collectors.toList());
    }

    private List<SmartGameRecommendation> applyIntelligentRanking(List<GameWithDistance> games, 
                                                                ProximitySearchRequest request) {
        return games.stream()
                .map(gwd -> {
                    double score = calculateRecommendationScore(gwd, request);
                    String reasoning = generateRecommendationReasoning(gwd, request);
                    
                    return SmartGameRecommendation.builder()
                            .game(gwd.getGame())
                            .distance(gwd.getDistance())
                            .recommendationScore(score)
                            .reasoning(reasoning)
                            .travelTimeMinutes(estimateTravelTime(gwd.getDistance(), request.getPreferredTransport()))
                            .popularityScore(calculateGamePopularityScore(gwd.getGame()))
                            .urgencyLevel(calculateGameUrgency(gwd.getGame()))
                            .build();
                })
                .sorted((r1, r2) -> Double.compare(r2.getRecommendationScore(), r1.getRecommendationScore()))
                .collect(Collectors.toList());
    }

    private List<AlternativeLocation> findAlternativeLocations(ProximitySearchRequest request, 
                                                             int currentResults) {
        if (currentResults >= request.getMaxResults() / 2) {
            return List.of(); // Enough results found
        }

        List<AlternativeLocation> alternatives = new ArrayList<>();

        // Suggest expanding search radius
        if (request.getMaxRadius() < 20.0) {
            alternatives.add(AlternativeLocation.builder()
                    .type("EXPAND_RADIUS")
                    .title("Expand search area")
                    .description("Try searching within " + (request.getMaxRadius() * 2) + "km for more options")
                    .actionData(Map.of("suggestedRadius", request.getMaxRadius() * 2))
                    .build());
        }

        // Suggest different sports
        if (request.getSport() != null) {
            List<String> alternateSports = findAlternateSports(request.getLatitude(), 
                                                             request.getLongitude(), request.getMaxRadius());
            for (String sport : alternateSports) {
                alternatives.add(AlternativeLocation.builder()
                        .type("ALTERNATIVE_SPORT")
                        .title("Try " + sport)
                        .description("Found active " + sport + " games in your area")
                        .actionData(Map.of("sport", sport))
                        .build());
            }
        }

        // Suggest nearby activity hotspots
        List<LocationService.ActivityHotspot> hotspots = locationService.getActivityHotspots(
            request.getLatitude(), request.getLongitude(), request.getMaxRadius() * 2, 3);
        
        for (LocationService.ActivityHotspot hotspot : hotspots) {
            alternatives.add(AlternativeLocation.builder()
                    .type("ACTIVITY_HOTSPOT")
                    .title(hotspot.getName())
                    .description(hotspot.getDescription())
                    .location(hotspot.getCenterLocation())
                    .actionData(Map.of("hotspotId", hotspot.getCenterLocation().toString()))
                    .build());
        }

        return alternatives;
    }

    private SearchInsights generateSearchInsights(List<GameWithDistance> games, double searchRadius) {
        if (games.isEmpty()) {
            return SearchInsights.builder()
                    .message("No games found in the search area")
                    .suggestions(List.of("Try expanding your search radius", "Check different sports"))
                    .build();
        }

        List<String> insights = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        // Analyze distance distribution
        double avgDistance = games.stream().mapToDouble(GameWithDistance::getDistance).average().orElse(0.0);
        if (avgDistance < searchRadius * 0.3) {
            insights.add("Great! Most games are very close to you");
        } else if (avgDistance > searchRadius * 0.8) {
            insights.add("Games are mostly at the edge of your search area");
            suggestions.add("Consider expanding your search radius");
        }

        // Analyze sports variety
        Set<String> uniqueSports = games.stream()
                .map(gwd -> gwd.getGame().getSport())
                .collect(Collectors.toSet());
        
        if (uniqueSports.size() > 3) {
            insights.add("Great variety with " + uniqueSports.size() + " different sports available");
        } else if (uniqueSports.size() == 1) {
            insights.add("All nearby games are " + uniqueSports.iterator().next());
            suggestions.add("Try searching for other sports or expanding your area");
        }

        // Analyze timing
        long urgentGames = games.stream()
                .filter(gwd -> getMinutesUntilStart(gwd.getGame()) <= 120) // Starting within 2 hours
                .count();
        
        if (urgentGames > 0) {
            insights.add(urgentGames + " games starting soon - join quickly!");
        }

        return SearchInsights.builder()
                .averageDistance(avgDistance)
                .sportsVariety(uniqueSports.size())
                .urgentGames((int) urgentGames)
                .insights(insights)
                .suggestions(suggestions)
                .build();
    }

    private boolean isGameInTimeWindow(Game game, TimeWindow timeWindow) {
        if (game.getTime() == null) return false;
        
        OffsetDateTime gameTime = game.getTime();
        return gameTime.isAfter(timeWindow.getStart()) && gameTime.isBefore(timeWindow.getEnd());
    }

    private boolean isSkillLevelMatch(String gameSkillLevel, String requestedSkillLevel) {
        // Implement skill level matching logic
        if (gameSkillLevel == null || requestedSkillLevel == null) return true;
        return gameSkillLevel.equalsIgnoreCase(requestedSkillLevel);
    }

    private boolean isGameAvailable(Game game) {
        if (game.getCapacity() == null) return true;
        return game.getParticipants().size() < game.getCapacity();
    }

    private double calculateRecommendationScore(GameWithDistance gwd, ProximitySearchRequest request) {
        double score = 100.0;
        
        // Distance factor (closer = higher score)
        double distanceFactor = Math.max(0, 100 - (gwd.getDistance() * 10));
        score = score * 0.4 + distanceFactor * 0.3;
        
        // Time factor (sooner = slightly higher score, but not too soon)
        int minutesUntilStart = getMinutesUntilStart(gwd.getGame());
        double timeFactor = 100.0;
        if (minutesUntilStart < 30) {
            timeFactor = 50.0; // Too soon
        } else if (minutesUntilStart < 120) {
            timeFactor = 90.0; // Good timing
        }
        score = score * 0.7 + timeFactor * 0.3;
        
        // Availability factor
        if (isGameAvailable(gwd.getGame())) {
            score *= 1.1; // 10% bonus for available games
        } else {
            score *= 0.8; // 20% penalty for full games
        }
        
        return Math.min(100.0, score);
    }

    private String generateRecommendationReasoning(GameWithDistance gwd, ProximitySearchRequest request) {
        List<String> reasons = new ArrayList<>();
        
        if (gwd.getDistance() < 2.0) {
            reasons.add("very close to you");
        } else if (gwd.getDistance() < 5.0) {
            reasons.add("nearby");
        }
        
        int minutesUntilStart = getMinutesUntilStart(gwd.getGame());
        if (minutesUntilStart < 120) {
            reasons.add("starting soon");
        }
        
        if (isGameAvailable(gwd.getGame())) {
            reasons.add("spots available");
        }
        
        if (request.getSport() != null && request.getSport().equals(gwd.getGame().getSport())) {
            reasons.add("matches your sport preference");
        }
        
        return reasons.isEmpty() ? "recommended for you" : "Recommended because it's " + String.join(", ", reasons);
    }

    private int estimateTravelTime(double distanceKm, String transportMode) {
        return switch (transportMode != null ? transportMode.toUpperCase() : "DRIVING") {
            case "WALKING" -> (int) (distanceKm * 12); // ~5 km/h
            case "CYCLING" -> (int) (distanceKm * 4);  // ~15 km/h
            case "PUBLIC_TRANSPORT" -> (int) (distanceKm * 3); // ~20 km/h average
            case "DRIVING" -> (int) (distanceKm * 2); // ~30 km/h in city
            default -> (int) (distanceKm * 2);
        };
    }

    private int getMinutesUntilStart(Game game) {
        if (game.getTime() == null) return Integer.MAX_VALUE;
        
        return (int) java.time.Duration.between(
            OffsetDateTime.now(), 
            game.getTime()
        ).toMinutes();
    }

    private double calculateGamePopularityScore(Game game) {
        // Calculate popularity based on participants, views, etc.
        int participants = game.getParticipants().size();
        Integer capacity = game.getCapacity();
        
        if (capacity == null) return 50.0;
        
        double fillRate = (double) participants / capacity;
        return Math.min(100.0, fillRate * 100 + 10); // Base score of 10
    }

    private ProximityAlert.Urgency calculateGameUrgency(Game game) {
        int minutesUntilStart = getMinutesUntilStart(game);
        
        if (minutesUntilStart < 30) return ProximityAlert.Urgency.HIGH;
        if (minutesUntilStart < 60) return ProximityAlert.Urgency.MEDIUM;
        return ProximityAlert.Urgency.LOW;
    }

    private ProximityAlert.Urgency calculateUrgency(GameWithDistance gwd) {
        int timeUrgency = getMinutesUntilStart(gwd.getGame()) < 60 ? 2 : 1;
        int distanceUrgency = gwd.getDistance() < 2.0 ? 2 : 1;
        
        int totalUrgency = timeUrgency + distanceUrgency;
        
        return switch (totalUrgency) {
            case 4 -> ProximityAlert.Urgency.HIGH;
            case 3 -> ProximityAlert.Urgency.MEDIUM;
            default -> ProximityAlert.Urgency.LOW;
        };
    }

    // Additional helper methods (simplified implementations)

    private boolean venueSupportsActivities(Venue venue, String sport) {
        // Check if venue supports the requested sport
        return true; // Placeholder
    }

    private boolean isVenueAvailable(Venue venue, OffsetDateTime time) {
        // Check venue availability at requested time
        return true; // Placeholder
    }

    private List<RankedVenue> rankVenuesBySuitability(List<VenueWithDistance> venues, 
                                                    VenueSearchRequest request) {
        return venues.stream()
                .map(vwd -> RankedVenue.builder()
                        .venue(vwd.getVenue())
                        .distance(vwd.getDistance())
                        .suitabilityScore(calculateVenueSuitability(vwd, request))
                        .build())
                .sorted((r1, r2) -> Double.compare(r2.getSuitabilityScore(), r1.getSuitabilityScore()))
                .collect(Collectors.toList());
    }

    private double calculateVenueSuitability(VenueWithDistance vwd, VenueSearchRequest request) {
        double score = 100.0;
        
        // Distance factor
        score -= vwd.getDistance() * 5; // Penalty for distance
        
        // Capacity factor
        if (request.getMinCapacity() != null) {
            if (vwd.getVenue().getMaxCapacity() >= request.getMinCapacity() * 1.5) {
                score += 10; // Bonus for extra capacity
            }
        }
        
        return Math.max(0.0, score);
    }

    private VenueSearchSummary generateVenueSearchSummary(List<RankedVenue> venues) {
        if (venues.isEmpty()) {
            return VenueSearchSummary.builder()
                    .message("No suitable venues found")
                    .build();
        }

        double avgDistance = venues.stream().mapToDouble(RankedVenue::getDistance).average().orElse(0.0);
        double avgSuitability = venues.stream().mapToDouble(RankedVenue::getSuitabilityScore).average().orElse(0.0);

        return VenueSearchSummary.builder()
                .totalFound(venues.size())
                .averageDistance(avgDistance)
                .averageSuitabilityScore(avgSuitability)
                .message(String.format("Found %d suitable venues with average distance %.1fkm", 
                        venues.size(), avgDistance))
                .build();
    }

    private double estimateRadiusFromTravelTime(int maxTravelMinutes, String transportMode) {
        return switch (transportMode != null ? transportMode.toUpperCase() : "DRIVING") {
            case "WALKING" -> maxTravelMinutes / 12.0; // ~5 km/h
            case "CYCLING" -> maxTravelMinutes / 4.0;  // ~15 km/h
            case "PUBLIC_TRANSPORT" -> maxTravelMinutes / 3.0; // ~20 km/h
            case "DRIVING" -> maxTravelMinutes / 2.0; // ~30 km/h
            default -> maxTravelMinutes / 2.0;
        };
    }

    private Map<String, List<GameWithDistance>> groupByTravelTime(List<GameWithDistance> games, 
                                                                CommuteSearchRequest request) {
        return games.stream()
                .collect(Collectors.groupingBy(gwd -> {
                    int travelTime = estimateTravelTime(gwd.getDistance(), request.getTransportMode());
                    if (travelTime <= 15) return "VERY_CLOSE";
                    if (travelTime <= 30) return "CLOSE";
                    if (travelTime <= 60) return "MODERATE";
                    return "FAR";
                }));
    }

    private CommuteAnalysis analyzeCommutePatterns(List<GameWithDistance> games, CommuteSearchRequest request) {
        double avgTravelTime = games.stream()
                .mapToInt(gwd -> estimateTravelTime(gwd.getDistance(), request.getTransportMode()))
                .average()
                .orElse(0.0);

        return CommuteAnalysis.builder()
                .averageTravelTimeMinutes(avgTravelTime)
                .gamesWithinComfortableCommute(games.stream()
                        .mapToInt(gwd -> estimateTravelTime(gwd.getDistance(), request.getTransportMode()) <= 30 ? 1 : 0)
                        .sum())
                .recommendedTransportMode(recommendTransportMode(games, request))
                .build();
    }

    private List<GameWithDistance> selectOptimalGamesForCommute(List<GameWithDistance> games, 
                                                              CommuteSearchRequest request) {
        return games.stream()
                .filter(gwd -> estimateTravelTime(gwd.getDistance(), request.getTransportMode()) <= request.getMaxTravelMinutes())
                .sorted(Comparator.comparing(GameWithDistance::getDistance))
                .limit(10)
                .collect(Collectors.toList());
    }

    private List<LocationConnection> findLocationConnections(Map<LocationPoint, List<GameWithDistance>> locationResults) {
        // Find overlapping games or nearby locations
        return List.of(); // Placeholder
    }

    private List<GameWithDistance> findUrgentNearbyGames(double lat, double lon, double radius, int maxMinutes) {
        List<GameWithDistance> nearbyGames = locationService.findGamesNearLocation(lat, lon, radius, 20);
        
        return nearbyGames.stream()
                .filter(gwd -> getMinutesUntilStart(gwd.getGame()) <= maxMinutes)
                .collect(Collectors.toList());
    }

    private List<VenueWithDistance> findRecentlyAddedVenues(double lat, double lon, double radius) {
        List<VenueWithDistance> nearbyVenues = locationService.findVenuesNearLocation(lat, lon, radius, 10);
        
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
        return nearbyVenues.stream()
                .filter(vwd -> vwd.getVenue().getCreatedAt().isAfter(oneWeekAgo))
                .collect(Collectors.toList());
    }

    private List<String> findAlternateSports(double lat, double lon, double radius) {
        List<GameWithDistance> nearbyGames = locationService.findGamesNearLocation(lat, lon, radius, 100);
        
        return nearbyGames.stream()
                .map(gwd -> gwd.getGame().getSport())
                .distinct()
                .limit(3)
                .collect(Collectors.toList());
    }

    private String recommendTransportMode(List<GameWithDistance> games, CommuteSearchRequest request) {
        double avgDistance = games.stream().mapToDouble(GameWithDistance::getDistance).average().orElse(0.0);
        
        if (avgDistance < 2.0) return "WALKING";
        if (avgDistance < 8.0) return "CYCLING";
        return "DRIVING";
    }

    // Data Transfer Objects

    @lombok.Data
    @lombok.Builder
    public static class ProximitySearchRequest {
        private double latitude;
        private double longitude;
        private double maxRadius;
        private String sport;
        private String skillLevel;
        private TimeWindow timeWindow;
        private boolean onlyAvailable;
        private int maxResults;
        private String preferredTransport;
    }

    @lombok.Data
    @lombok.Builder
    public static class VenueSearchRequest {
        private double latitude;
        private double longitude;
        private double maxRadius;
        private String sport;
        private OffsetDateTime desiredTime;
        private Integer minCapacity;
        private int maxResults;
    }

    @lombok.Data
    @lombok.Builder
    public static class CommuteSearchRequest {
        private double startLatitude;
        private double startLongitude;
        private int maxTravelMinutes;
        private String transportMode;
        private String sport;
    }

    @lombok.Data
    @lombok.Builder
    public static class TimeWindow {
        private OffsetDateTime start;
        private OffsetDateTime end;
    }

    @lombok.Data
    @lombok.Builder
    public static class SmartProximityResults {
        private LocationPoint searchLocation;
        private double searchRadiusKm;
        private int totalFound;
        private List<SmartGameRecommendation> recommendations;
        private List<AlternativeLocation> alternatives;
        private SearchInsights searchInsights;
    }

    @lombok.Data
    @lombok.Builder
    public static class SmartGameRecommendation {
        private Game game;
        private double distance;
        private double recommendationScore;
        private String reasoning;
        private int travelTimeMinutes;
        private double popularityScore;
        private String urgencyLevel;
    }

    @lombok.Data
    @lombok.Builder
    public static class AlternativeLocation {
        private String type;
        private String title;
        private String description;
        private LocationPoint location;
        private Map<String, Object> actionData;
    }

    @lombok.Data
    @lombok.Builder
    public static class SearchInsights {
        private double averageDistance;
        private int sportsVariety;
        private int urgentGames;
        private List<String> insights;
        private List<String> suggestions;
        private String message;
    }

    @lombok.Data
    @lombok.Builder
    public static class VenueDiscoveryResults {
        private LocationPoint searchLocation;
        private String sport;
        private int totalFound;
        private List<RankedVenue> venues;
        private VenueSearchSummary searchSummary;
    }

    @lombok.Data
    @lombok.Builder
    public static class RankedVenue {
        private Venue venue;
        private double distance;
        private double suitabilityScore;
    }

    @lombok.Data
    @lombok.Builder
    public static class VenueSearchSummary {
        private int totalFound;
        private double averageDistance;
        private double averageSuitabilityScore;
        private String message;
    }

    @lombok.Data
    @lombok.Builder
    public static class CommuteBasedDiscovery {
        private LocationPoint startLocation;
        private int maxTravelMinutes;
        private String transportMode;
        private double estimatedRadiusKm;
        private Map<String, List<GameWithDistance>> gamesByTravelZone;
        private CommuteAnalysis commuteAnalysis;
        private List<GameWithDistance> optimalGames;
    }

    @lombok.Data
    @lombok.Builder
    public static class CommuteAnalysis {
        private double averageTravelTimeMinutes;
        private int gamesWithinComfortableCommute;
        private String recommendedTransportMode;
    }

    @lombok.Data
    @lombok.Builder
    public static class MultiLocationDiscovery {
        private List<LocationPoint> searchLocations;
        private String sport;
        private Map<LocationPoint, List<GameWithDistance>> resultsByLocation;
        private List<LocationConnection> connections;
        private List<GameWithDistance> aggregatedResults;
        private int totalUniqueGames;
    }

    @lombok.Data
    @lombok.Builder
    public static class LocationConnection {
        private LocationPoint location1;
        private LocationPoint location2;
        private double distance;
        private int sharedGames;
        private String connectionType;
    }

    @lombok.Data
    @lombok.Builder
    public static class ProximityAlert {
        private String alertType;
        private String title;
        private String message;
        private Game game;
        private Venue venue;
        private double distance;
        private Urgency urgency;
        private String actionUrl;
        
        public enum Urgency {
            LOW, MEDIUM, HIGH
        }
    }
}
