package com.bmessi.pickupsportsapp.service.location;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.VenueRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.service.location.LocationService.LocationPoint;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Advanced location analytics service for tracking popular areas and usage patterns.
 * 
 * Features:
 * - Popular area identification and tracking
 * - Location-based user behavior analytics
 * - Geographic trend analysis
 * - Area utilization metrics
 * - Location recommendation optimization
 * - Geographic performance insights
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LocationAnalyticsService {

    private final GameRepository gameRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final LocationService locationService;
    private final RedisTemplate<String, String> redisTemplate;

    // Redis keys for analytics storage
    private static final String LOCATION_POPULARITY_KEY = "analytics:location:popularity";
    private static final String AREA_METRICS_KEY = "analytics:area:%s";
    private static final String LOCATION_TRENDS_KEY = "analytics:location:trends";
    private static final String USER_LOCATION_PATTERNS_KEY = "analytics:user:location:%s";

    /**
     * Get comprehensive location analytics for the entire platform.
     */
    @Transactional(readOnly = true)
    public PlatformLocationAnalytics getPlatformLocationAnalytics() {
        try {
            List<Game> allGames = gameRepository.findAll();
            List<Venue> allVenues = venueRepository.findAll();

            // Calculate geographic distribution
            GeographicDistribution distribution = calculateGeographicDistribution(allGames, allVenues);
            
            // Identify popular areas
            List<PopularArea> popularAreas = identifyPopularAreas(allGames, allVenues);
            
            // Calculate utilization metrics
            LocationUtilizationMetrics utilization = calculateLocationUtilization(allGames, allVenues);
            
            // Analyze growth patterns
            LocationGrowthAnalysis growth = analyzeLocationGrowth(allGames, allVenues);

            return PlatformLocationAnalytics.builder()
                    .totalLocationsWithGames(calculateUniqueGameLocations(allGames))
                    .totalActiveVenues(allVenues.stream()
                            .mapToInt(v -> v.getStatus() == Venue.VenueStatus.ACTIVE ? 1 : 0)
                            .sum())
                    .geographicDistribution(distribution)
                    .popularAreas(popularAreas)
                    .utilizationMetrics(utilization)
                    .growthAnalysis(growth)
                    .coverageInsights(generateCoverageInsights(distribution))
                    .lastAnalyzed(java.time.Instant.now())
                    .build();

        } catch (Exception e) {
            log.error("Error getting platform location analytics: {}", e.getMessage());
            return PlatformLocationAnalytics.builder().build();
        }
    }

    /**
     * Get detailed analytics for a specific area.
     */
    @Transactional(readOnly = true)
    public AreaAnalytics getAreaAnalytics(double centerLat, double centerLon, double radiusKm, int days) {
        try {
            LocalDateTime since = LocalDateTime.now().minusDays(days);

            // Find games and venues in the area
            List<LocationService.GameWithDistance> areaGames = locationService
                    .findGamesNearLocation(centerLat, centerLon, radiusKm, 1000);
            
            List<LocationService.VenueWithDistance> areaVenues = locationService
                    .findVenuesNearLocation(centerLat, centerLon, radiusKm, 100);

            // Filter by time period
            List<LocationService.GameWithDistance> recentGames = areaGames.stream()
                    .filter(gwd -> gwd.getGame().getCreatedAt().toLocalDateTime().isAfter(since))
                    .collect(Collectors.toList());

            // Calculate metrics
            ActivityMetrics activityMetrics = calculateActivityMetrics(recentGames, areaVenues);
            PopularityTrends trends = calculatePopularityTrends(recentGames, days);
            AreaInsights insights = generateAreaInsights(recentGames, areaVenues, centerLat, centerLon);

            return AreaAnalytics.builder()
                    .centerLocation(new LocationPoint(centerLat, centerLon))
                    .radiusKm(radiusKm)
                    .analysisPeriodDays(days)
                    .totalGames(recentGames.size())
                    .totalVenues(areaVenues.size())
                    .activityMetrics(activityMetrics)
                    .popularityTrends(trends)
                    .insights(insights)
                    .competitorAnalysis(analyzeCompetitorAreas(centerLat, centerLon, radiusKm))
                    .build();

        } catch (Exception e) {
            log.error("Error getting area analytics: {}", e.getMessage());
            return AreaAnalytics.builder().build();
        }
    }

    /**
     * Track and analyze user location patterns.
     */
    public UserLocationPatterns analyzeUserLocationPatterns(String username, int days) {
        try {
            // This would analyze user's location history from various sources
            // For now, return basic pattern analysis
            
            return UserLocationPatterns.builder()
                    .username(username)
                    .analysisPeriodDays(days)
                    .frequentAreas(getUserFrequentAreas(username))
                    .travelPatterns(getUserTravelPatterns(username))
                    .preferredVenues(getUserPreferredVenues(username))
                    .activityHeatmap(generateUserActivityHeatmap(username))
                    .locationDiversity(calculateUserLocationDiversity(username))
                    .build();

        } catch (Exception e) {
            log.error("Error analyzing user location patterns for {}: {}", username, e.getMessage());
            return UserLocationPatterns.builder().build();
        }
    }

    /**
     * Get location-based performance insights.
     */
    @Transactional(readOnly = true)
    public LocationPerformanceInsights getLocationPerformanceInsights(double latitude, double longitude, 
                                                                     double radiusKm) {
        try {
            List<LocationService.GameWithDistance> areaGames = locationService
                    .findGamesNearLocation(latitude, longitude, radiusKm, 500);

            // Analyze performance by location factors
            Map<String, Double> performanceByVenue = analyzePerformanceByVenue(areaGames);
            Map<String, Double> performanceBySport = analyzePerformanceBySport(areaGames);
            Map<String, Double> performanceByTimeOfDay = analyzePerformanceByTimeOfDay(areaGames);

            // Calculate location success factors
            List<LocationSuccessFactor> successFactors = identifyLocationSuccessFactors(areaGames);

            return LocationPerformanceInsights.builder()
                    .location(new LocationPoint(latitude, longitude))
                    .radiusKm(radiusKm)
                    .totalGamesAnalyzed(areaGames.size())
                    .performanceByVenue(performanceByVenue)
                    .performanceBySport(performanceBySport)
                    .performanceByTimeOfDay(performanceByTimeOfDay)
                    .successFactors(successFactors)
                    .locationRating(calculateLocationRating(areaGames))
                    .recommendations(generateLocationPerformanceRecommendations(areaGames))
                    .build();

        } catch (Exception e) {
            log.error("Error getting location performance insights: {}", e.getMessage());
            return LocationPerformanceInsights.builder().build();
        }
    }

    /**
     * Update location popularity metrics.
     */
    public void updateLocationPopularity(String location, String action, Map<String, Object> metadata) {
        try {
            String popularityKey = LOCATION_POPULARITY_KEY + ":" + location.toLowerCase().replace(" ", "_");
            
            // Increment action counter
            redisTemplate.opsForHash().increment(popularityKey, action, 1);
            redisTemplate.opsForHash().increment(popularityKey, "total_actions", 1);
            
            // Update timestamp
            redisTemplate.opsForHash().put(popularityKey, "last_updated", java.time.Instant.now().toString());
            
            // Set expiry
            redisTemplate.expire(popularityKey, 30, TimeUnit.DAYS);

            // Update trending locations
            updateTrendingLocations(location, action);

            log.debug("Updated popularity for location '{}': action={}", location, action);

        } catch (Exception e) {
            log.error("Error updating location popularity: {}", e.getMessage());
        }
    }

    /**
     * Get trending locations and emerging hotspots.
     */
    public TrendingLocations getTrendingLocations(int days) {
        try {
            LocalDateTime since = LocalDateTime.now().minusDays(days);
            
            // Analyze recent activity increases
            Map<String, LocationTrend> trends = analyzeTrendingLocations(since);
            
            // Identify emerging hotspots
            List<EmergingHotspot> emergingHotspots = identifyEmergingHotspots(since);
            
            // Calculate momentum scores
            List<LocationMomentum> momentum = calculateLocationMomentum(trends);

            return TrendingLocations.builder()
                    .analysisPeriodDays(days)
                    .trends(trends)
                    .emergingHotspots(emergingHotspots)
                    .momentum(momentum)
                    .topTrendingAreas(momentum.stream()
                            .sorted((m1, m2) -> Double.compare(m2.getMomentumScore(), m1.getMomentumScore()))
                            .limit(10)
                            .collect(Collectors.toList()))
                    .build();

        } catch (Exception e) {
            log.error("Error getting trending locations: {}", e.getMessage());
            return TrendingLocations.builder().build();
        }
    }

    // Private helper methods

    private int calculateUniqueGameLocations(List<Game> games) {
        return games.stream()
                .filter(g -> g.getLocation() != null)
                .map(Game::getLocation)
                .collect(Collectors.toSet())
                .size();
    }

    private GeographicDistribution calculateGeographicDistribution(List<Game> games, List<Venue> venues) {
        // Calculate center of activity
        List<LocationPoint> gameLocations = games.stream()
                .filter(g -> g.getLatitude() != null && g.getLongitude() != null)
                .map(g -> new LocationPoint(g.getLatitude(), g.getLongitude()))
                .collect(Collectors.toList());

        List<LocationPoint> venueLocations = venues.stream()
                .filter(v -> v.getLatitude() != null && v.getLongitude() != null)
                .map(v -> new LocationPoint(v.getLatitude().doubleValue(), v.getLongitude().doubleValue()))
                .collect(Collectors.toList());

        List<LocationPoint> allLocations = new ArrayList<>();
        allLocations.addAll(gameLocations);
        allLocations.addAll(venueLocations);

        if (allLocations.isEmpty()) {
            return GeographicDistribution.builder().build();
        }

        double centerLat = allLocations.stream().mapToDouble(LocationPoint::getLatitude).average().orElse(0.0);
        double centerLon = allLocations.stream().mapToDouble(LocationPoint::getLongitude).average().orElse(0.0);

        // Calculate spread
        double maxDistance = allLocations.stream()
                .mapToDouble(loc -> locationService.calculateDistance(centerLat, centerLon, 
                                                                    loc.getLatitude(), loc.getLongitude()))
                .max()
                .orElse(0.0);

        return GeographicDistribution.builder()
                .centerOfActivity(new LocationPoint(centerLat, centerLon))
                .maxSpreadKm(maxDistance)
                .totalLocations(allLocations.size())
                .gameLocationCount(gameLocations.size())
                .venueLocationCount(venueLocations.size())
                .build();
    }

    private List<PopularArea> identifyPopularAreas(List<Game> games, List<Venue> venues) {
        // Use clustering to identify popular areas
        Map<String, List<LocationPoint>> clusters = createLocationClusters(games, venues, 2.0); // 2km clusters

        return clusters.entrySet().stream()
                .filter(entry -> entry.getValue().size() >= 3) // At least 3 locations
                .map(entry -> {
                    List<LocationPoint> locations = entry.getValue();
                    LocationPoint center = calculateClusterCenter(locations);
                    
                    return PopularArea.builder()
                            .name("Area " + entry.getKey())
                            .centerLocation(center)
                            .activityCount(locations.size())
                            .radius(calculateClusterRadius(locations, center))
                            .popularityScore(calculateAreaPopularityScore(locations.size()))
                            .build();
                })
                .sorted((a1, a2) -> Double.compare(a2.getPopularityScore(), a1.getPopularityScore()))
                .limit(20)
                .collect(Collectors.toList());
    }

    private LocationUtilizationMetrics calculateLocationUtilization(List<Game> games, List<Venue> venues) {
        // Calculate how well locations are being utilized
        long activeVenues = venues.stream()
                .filter(v -> v.getStatus() == Venue.VenueStatus.ACTIVE)
                .count();

        long venuesWithRecentActivity = venues.stream()
                .filter(v -> hasRecentActivity(v))
                .count();

        double venueUtilizationRate = activeVenues > 0 ? 
                                     (double) venuesWithRecentActivity / activeVenues * 100 : 0.0;

        // Calculate game distribution efficiency
        Map<String, Long> gamesByLocation = games.stream()
                .filter(g -> g.getLocation() != null)
                .collect(Collectors.groupingBy(Game::getLocation, Collectors.counting()));

        double locationDistributionScore = calculateLocationDistributionScore(gamesByLocation);

        return LocationUtilizationMetrics.builder()
                .totalActiveVenues((int) activeVenues)
                .venuesWithRecentActivity((int) venuesWithRecentActivity)
                .venueUtilizationRate(venueUtilizationRate)
                .uniqueGameLocations(gamesByLocation.size())
                .locationDistributionScore(locationDistributionScore)
                .averageGamesPerLocation(gamesByLocation.values().stream()
                        .mapToDouble(Long::doubleValue)
                        .average()
                        .orElse(0.0))
                .build();
    }

    private LocationGrowthAnalysis analyzeLocationGrowth(List<Game> games, List<Venue> venues) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastMonth = now.minusMonths(1);
        LocalDateTime lastQuarter = now.minusMonths(3);

        // Calculate growth rates
        long recentGames = games.stream()
                .filter(g -> g.getCreatedAt().toLocalDateTime().isAfter(lastMonth))
                .count();
        
        long quarterGames = games.stream()
                .filter(g -> g.getCreatedAt().toLocalDateTime().isAfter(lastQuarter))
                .count();

        long recentVenues = venues.stream()
                .filter(v -> v.getCreatedAt().isAfter(lastMonth))
                .count();

        double gameGrowthRate = calculateGrowthRate(recentGames, quarterGames - recentGames);
        double venueGrowthRate = calculateGrowthRate(recentVenues, 
                venues.stream().filter(v -> v.getCreatedAt().isAfter(lastQuarter) && 
                                           v.getCreatedAt().isBefore(lastMonth)).count());

        return LocationGrowthAnalysis.builder()
                .gamesLastMonth((int) recentGames)
                .venuesLastMonth((int) recentVenues)
                .gameGrowthRate(gameGrowthRate)
                .venueGrowthRate(venueGrowthRate)
                .growthTrend(determineGrowthTrend(gameGrowthRate, venueGrowthRate))
                .emergingAreas(identifyEmergingAreas(games, venues, lastMonth))
                .build();
    }

    /**
     * Get location-based user engagement metrics.
     */
    @Transactional(readOnly = true)
    public LocationEngagementMetrics getLocationEngagementMetrics(String location, int days) {
        try {
            LocalDateTime since = LocalDateTime.now().minusDays(days);
            
            // Find games at this location
            List<Game> locationGames = gameRepository.findAll().stream()
                    .filter(g -> location.equalsIgnoreCase(g.getLocation()))
                    .filter(g -> g.getCreatedAt().toLocalDateTime().isAfter(since))
                    .collect(Collectors.toList());

            if (locationGames.isEmpty()) {
                return LocationEngagementMetrics.builder()
                        .location(location)
                        .hasData(false)
                        .message("No recent activity at this location")
                        .build();
            }

            // Calculate engagement metrics
            double averageParticipants = locationGames.stream()
                    .mapToInt(g -> g.getParticipants().size())
                    .average()
                    .orElse(0.0);

            long totalParticipants = locationGames.stream()
                    .mapToLong(g -> g.getParticipants().size())
                    .sum();

            // Analyze repeat visitors
            Map<String, Long> userFrequency = locationGames.stream()
                    .flatMap(g -> g.getParticipants().stream())
                    .collect(Collectors.groupingBy(User::getUsername, Collectors.counting()));

            long repeatVisitors = userFrequency.values().stream()
                    .filter(count -> count > 1)
                    .count();

            double retentionRate = userFrequency.size() > 0 ? 
                                  (double) repeatVisitors / userFrequency.size() * 100 : 0.0;

            return LocationEngagementMetrics.builder()
                    .location(location)
                    .hasData(true)
                    .analysisPeriodDays(days)
                    .totalGames(locationGames.size())
                    .totalParticipants((int) totalParticipants)
                    .averageParticipants(averageParticipants)
                    .uniqueUsers(userFrequency.size())
                    .repeatVisitors((int) repeatVisitors)
                    .retentionRate(retentionRate)
                    .engagementScore(calculateLocationEngagementScore(locationGames))
                    .build();

        } catch (Exception e) {
            log.error("Error getting location engagement metrics: {}", e.getMessage());
            return LocationEngagementMetrics.builder().build();
        }
    }

    /**
     * Generate location optimization recommendations.
     */
    public LocationOptimizationReport generateLocationOptimizationReport() {
        try {
            List<Game> allGames = gameRepository.findAll();
            List<Venue> allVenues = venueRepository.findAll();

            // Identify underutilized areas
            List<UnderutilizedArea> underutilized = identifyUnderutilizedAreas(allGames, allVenues);
            
            // Identify oversaturated areas
            List<OversaturatedArea> oversaturated = identifyOversaturatedAreas(allGames, allVenues);
            
            // Generate expansion opportunities
            List<ExpansionOpportunity> expansions = identifyExpansionOpportunities(allGames, allVenues);
            
            // Calculate optimization score
            double optimizationScore = calculateLocationOptimizationScore(allGames, allVenues);

            return LocationOptimizationReport.builder()
                    .optimizationScore(optimizationScore)
                    .underutilizedAreas(underutilized)
                    .oversaturatedAreas(oversaturated)
                    .expansionOpportunities(expansions)
                    .recommendations(generateOptimizationRecommendations(underutilized, oversaturated, expansions))
                    .lastAnalyzed(java.time.Instant.now())
                    .build();

        } catch (Exception e) {
            log.error("Error generating location optimization report: {}", e.getMessage());
            return LocationOptimizationReport.builder().build();
        }
    }

    // Private helper methods

    private Map<String, List<LocationPoint>> createLocationClusters(List<Game> games, List<Venue> venues, 
                                                                  double clusterRadiusKm) {
        Map<String, List<LocationPoint>> clusters = new HashMap<>();
        List<LocationPoint> allPoints = new ArrayList<>();

        // Add game locations
        games.stream()
                .filter(g -> g.getLatitude() != null && g.getLongitude() != null)
                .forEach(g -> allPoints.add(new LocationPoint(g.getLatitude(), g.getLongitude())));

        // Add venue locations
        venues.stream()
                .filter(v -> v.getLatitude() != null && v.getLongitude() != null)
                .forEach(v -> allPoints.add(new LocationPoint(v.getLatitude().doubleValue(), 
                                                             v.getLongitude().doubleValue())));

        // Simple clustering algorithm
        int clusterIndex = 0;
        Set<LocationPoint> processed = new HashSet<>();

        for (LocationPoint point : allPoints) {
            if (processed.contains(point)) continue;

            List<LocationPoint> cluster = new ArrayList<>();
            cluster.add(point);
            processed.add(point);

            // Find nearby points
            for (LocationPoint other : allPoints) {
                if (processed.contains(other)) continue;
                
                double distance = locationService.calculateDistance(
                    point.getLatitude(), point.getLongitude(),
                    other.getLatitude(), other.getLongitude());
                
                if (distance <= clusterRadiusKm) {
                    cluster.add(other);
                    processed.add(other);
                }
            }

            clusters.put("cluster_" + clusterIndex++, cluster);
        }

        return clusters;
    }

    private LocationPoint calculateClusterCenter(List<LocationPoint> locations) {
        double avgLat = locations.stream().mapToDouble(LocationPoint::getLatitude).average().orElse(0.0);
        double avgLon = locations.stream().mapToDouble(LocationPoint::getLongitude).average().orElse(0.0);
        return new LocationPoint(avgLat, avgLon);
    }

    private double calculateClusterRadius(List<LocationPoint> locations, LocationPoint center) {
        return locations.stream()
                .mapToDouble(loc -> locationService.calculateDistance(
                    center.getLatitude(), center.getLongitude(),
                    loc.getLatitude(), loc.getLongitude()))
                .max()
                .orElse(0.0);
    }

    private double calculateAreaPopularityScore(int activityCount) {
        return Math.min(100.0, activityCount * 5.0); // 5 points per activity, max 100
    }

    private ActivityMetrics calculateActivityMetrics(List<LocationService.GameWithDistance> games, 
                                                   List<LocationService.VenueWithDistance> venues) {
        double activityDensity = (games.size() + venues.size()) / Math.PI; // Simplified density
        
        Map<String, Long> sportDistribution = games.stream()
                .collect(Collectors.groupingBy(gwd -> gwd.getGame().getSport(), Collectors.counting()));

        String dominantSport = sportDistribution.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("UNKNOWN");

        return ActivityMetrics.builder()
                .totalActivities(games.size() + venues.size())
                .gamesCount(games.size())
                .venuesCount(venues.size())
                .activityDensity(activityDensity)
                .sportDistribution(sportDistribution)
                .dominantSport(dominantSport)
                .diversityIndex(calculateSportDiversityIndex(sportDistribution))
                .build();
    }

    private PopularityTrends calculatePopularityTrends(List<LocationService.GameWithDistance> games, int days) {
        // Group games by week to analyze trends
        Map<Integer, Long> weeklyActivity = games.stream()
                .collect(Collectors.groupingBy(
                    gwd -> getWeekNumber(gwd.getGame().getCreatedAt().toLocalDateTime()),
                    Collectors.counting()
                ));

        String trendDirection = analyzeTrendDirection(weeklyActivity);
        double growthRate = calculateWeeklyGrowthRate(weeklyActivity);

        return PopularityTrends.builder()
                .weeklyActivity(weeklyActivity)
                .trendDirection(trendDirection)
                .growthRate(growthRate)
                .peakWeek(weeklyActivity.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .map(Map.Entry::getKey)
                        .orElse(0))
                .build();
    }

    private AreaInsights generateAreaInsights(List<LocationService.GameWithDistance> games,
                                            List<LocationService.VenueWithDistance> venues,
                                            double centerLat, double centerLon) {
        List<String> insights = new ArrayList<>();
        List<String> opportunities = new ArrayList<>();

        if (games.size() > 20) {
            insights.add("High activity area with " + games.size() + " recent games");
        } else if (games.isEmpty()) {
            insights.add("Low activity area - opportunity for growth");
            opportunities.add("Consider organizing games to build community");
        }

        if (venues.size() > 5) {
            insights.add("Well-equipped area with " + venues.size() + " venues");
        } else if (venues.size() < 2) {
            opportunities.add("Limited venue options - potential for new facilities");
        }

        // Analyze sport diversity
        Set<String> sports = games.stream()
                .map(gwd -> gwd.getGame().getSport())
                .collect(Collectors.toSet());

        if (sports.size() > 5) {
            insights.add("Great sport variety with " + sports.size() + " different activities");
        } else if (sports.size() == 1) {
            opportunities.add("Single sport dominance - opportunity to diversify");
        }

        return AreaInsights.builder()
                .insights(insights)
                .opportunities(opportunities)
                .strengths(identifyAreaStrengths(games, venues))
                .challenges(identifyAreaChallenges(games, venues))
                .build();
    }

    // Additional utility methods

    private boolean hasRecentActivity(Venue venue) {
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        // This would check for recent bookings or games at the venue
        return venue.getCreatedAt().isAfter(oneMonthAgo); // Simplified
    }

    private double calculateLocationDistributionScore(Map<String, Long> gamesByLocation) {
        if (gamesByLocation.isEmpty()) return 0.0;
        
        // Calculate how evenly games are distributed across locations
        double mean = gamesByLocation.values().stream().mapToDouble(Long::doubleValue).average().orElse(0.0);
        double variance = gamesByLocation.values().stream()
                .mapToDouble(count -> Math.pow(count - mean, 2))
                .average()
                .orElse(0.0);
        
        double standardDeviation = Math.sqrt(variance);
        
        // Lower standard deviation = better distribution
        return Math.max(0.0, 100.0 - (standardDeviation / mean * 100));
    }

    private void updateTrendingLocations(String location, String action) {
        try {
            String trendsKey = LOCATION_TRENDS_KEY;
            String locationKey = location.toLowerCase().replace(" ", "_");
            
            // Update action count for this location
            redisTemplate.opsForHash().increment(trendsKey + ":" + locationKey, action, 1);
            redisTemplate.opsForHash().increment(trendsKey + ":" + locationKey, "total", 1);
            
            // Update global trending list
            redisTemplate.opsForZSet().incrementScore(trendsKey + ":ranking", locationKey, 1.0);
            
            // Set expiry
            redisTemplate.expire(trendsKey + ":" + locationKey, 7, TimeUnit.DAYS);
            redisTemplate.expire(trendsKey + ":ranking", 7, TimeUnit.DAYS);

        } catch (Exception e) {
            log.error("Error updating trending locations: {}", e.getMessage());
        }
    }

    private Map<String, LocationTrend> analyzeTrendingLocations(LocalDateTime since) {
        // Analyze location trends from Redis data
        return Map.of(); // Placeholder
    }

    private List<EmergingHotspot> identifyEmergingHotspots(LocalDateTime since) {
        // Identify locations with rapid activity growth
        return List.of(); // Placeholder
    }

    private List<LocationMomentum> calculateLocationMomentum(Map<String, LocationTrend> trends) {
        return trends.entrySet().stream()
                .map(entry -> LocationMomentum.builder()
                        .location(entry.getKey())
                        .trend(entry.getValue())
                        .momentumScore(entry.getValue().getGrowthRate() * entry.getValue().getActivityCount())
                        .build())
                .collect(Collectors.toList());
    }

    private double calculateGrowthRate(long recent, long previous) {
        if (previous == 0) return recent > 0 ? 100.0 : 0.0;
        return ((double) recent - previous) / previous * 100;
    }

    private String determineGrowthTrend(double gameGrowth, double venueGrowth) {
        double avgGrowth = (gameGrowth + venueGrowth) / 2;
        
        if (avgGrowth > 20) return "RAPID_GROWTH";
        if (avgGrowth > 5) return "STEADY_GROWTH";
        if (avgGrowth > -5) return "STABLE";
        return "DECLINING";
    }

    private List<String> identifyEmergingAreas(List<Game> games, List<Venue> venues, LocalDateTime since) {
        // Find locations with recent significant activity
        return games.stream()
                .filter(g -> g.getCreatedAt().toLocalDateTime().isAfter(since))
                .map(Game::getLocation)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(loc -> loc, Collectors.counting()))
                .entrySet().stream()
                .filter(entry -> entry.getValue() >= 3) // At least 3 games
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    // Additional utility methods for comprehensive analytics

    private double calculateSportDiversityIndex(Map<String, Long> sportDistribution) {
        if (sportDistribution.size() <= 1) return 0.0;
        
        long total = sportDistribution.values().stream().mapToLong(Long::longValue).sum();
        
        return sportDistribution.values().stream()
                .mapToDouble(count -> {
                    double proportion = (double) count / total;
                    return -proportion * Math.log(proportion);
                })
                .sum();
    }

    private int getWeekNumber(LocalDateTime dateTime) {
        return dateTime.getDayOfYear() / 7;
    }

    private String analyzeTrendDirection(Map<Integer, Long> weeklyActivity) {
        if (weeklyActivity.size() < 2) return "INSUFFICIENT_DATA";
        
        List<Long> values = weeklyActivity.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(Map.Entry::getValue)
                .collect(Collectors.toList());
        
        long recent = values.get(values.size() - 1);
        long previous = values.get(0);
        
        if (recent > previous * 1.2) return "INCREASING";
        if (recent < previous * 0.8) return "DECREASING";
        return "STABLE";
    }

    private double calculateWeeklyGrowthRate(Map<Integer, Long> weeklyActivity) {
        if (weeklyActivity.size() < 2) return 0.0;
        
        List<Long> values = weeklyActivity.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(Map.Entry::getValue)
                .collect(Collectors.toList());
        
        long recent = values.get(values.size() - 1);
        long previous = values.get(0);
        
        return previous > 0 ? ((double) recent - previous) / previous * 100 : 0.0;
    }

    // Placeholder methods for complex analytics

    private List<String> getUserFrequentAreas(String username) {
        return List.of(); // Placeholder
    }

    private TravelPatterns getUserTravelPatterns(String username) {
        return TravelPatterns.builder().build(); // Placeholder
    }

    private List<Venue> getUserPreferredVenues(String username) {
        return List.of(); // Placeholder
    }

    private LocationHeatmap generateUserActivityHeatmap(String username) {
        return LocationHeatmap.builder().build(); // Placeholder
    }

    private double calculateUserLocationDiversity(String username) {
        return 0.0; // Placeholder
    }

    private Map<String, Double> analyzePerformanceByVenue(List<LocationService.GameWithDistance> games) {
        return Map.of(); // Placeholder
    }

    private Map<String, Double> analyzePerformanceBySport(List<LocationService.GameWithDistance> games) {
        return Map.of(); // Placeholder
    }

    private Map<String, Double> analyzePerformanceByTimeOfDay(List<LocationService.GameWithDistance> games) {
        return Map.of(); // Placeholder
    }

    private List<LocationSuccessFactor> identifyLocationSuccessFactors(List<LocationService.GameWithDistance> games) {
        return List.of(); // Placeholder
    }

    private double calculateLocationRating(List<LocationService.GameWithDistance> games) {
        return 0.0; // Placeholder
    }

    private List<String> generateLocationPerformanceRecommendations(List<LocationService.GameWithDistance> games) {
        return List.of(); // Placeholder
    }

    private double calculateLocationEngagementScore(List<Game> games) {
        return 0.0; // Placeholder
    }

    private List<String> generateCoverageInsights(GeographicDistribution distribution) {
        return List.of(); // Placeholder
    }

    private List<UnderutilizedArea> identifyUnderutilizedAreas(List<Game> games, List<Venue> venues) {
        return List.of(); // Placeholder
    }

    private List<OversaturatedArea> identifyOversaturatedAreas(List<Game> games, List<Venue> venues) {
        return List.of(); // Placeholder
    }

    private List<ExpansionOpportunity> identifyExpansionOpportunities(List<Game> games, List<Venue> venues) {
        return List.of(); // Placeholder
    }

    private double calculateLocationOptimizationScore(List<Game> games, List<Venue> venues) {
        return 0.0; // Placeholder
    }

    private List<String> generateOptimizationRecommendations(List<UnderutilizedArea> underutilized,
                                                           List<OversaturatedArea> oversaturated,
                                                           List<ExpansionOpportunity> expansions) {
        return List.of(); // Placeholder
    }

    private List<String> identifyAreaStrengths(List<LocationService.GameWithDistance> games,
                                             List<LocationService.VenueWithDistance> venues) {
        return List.of(); // Placeholder
    }

    private List<String> identifyAreaChallenges(List<LocationService.GameWithDistance> games,
                                              List<LocationService.VenueWithDistance> venues) {
        return List.of(); // Placeholder
    }

    // Data Transfer Objects

    @lombok.Data
    @lombok.Builder
    public static class PlatformLocationAnalytics {
        private int totalLocationsWithGames;
        private int totalActiveVenues;
        private GeographicDistribution geographicDistribution;
        private List<PopularArea> popularAreas;
        private LocationUtilizationMetrics utilizationMetrics;
        private LocationGrowthAnalysis growthAnalysis;
        private List<String> coverageInsights;
        private java.time.Instant lastAnalyzed;
    }

    @lombok.Data
    @lombok.Builder
    public static class GeographicDistribution {
        private LocationPoint centerOfActivity;
        private double maxSpreadKm;
        private int totalLocations;
        private int gameLocationCount;
        private int venueLocationCount;
    }

    @lombok.Data
    @lombok.Builder
    public static class PopularArea {
        private String name;
        private LocationPoint centerLocation;
        private int activityCount;
        private double radius;
        private double popularityScore;
    }

    @lombok.Data
    @lombok.Builder
    public static class LocationUtilizationMetrics {
        private int totalActiveVenues;
        private int venuesWithRecentActivity;
        private double venueUtilizationRate;
        private int uniqueGameLocations;
        private double locationDistributionScore;
        private double averageGamesPerLocation;
    }

    @lombok.Data
    @lombok.Builder
    public static class LocationGrowthAnalysis {
        private int gamesLastMonth;
        private int venuesLastMonth;
        private double gameGrowthRate;
        private double venueGrowthRate;
        private String growthTrend;
        private List<String> emergingAreas;
    }

    // Additional DTOs for comprehensive analytics
    @lombok.Data
    @lombok.Builder
    public static class AreaAnalytics {
        private LocationPoint centerLocation;
        private double radiusKm;
        private int analysisPeriodDays;
        private int totalGames;
        private int totalVenues;
        private ActivityMetrics activityMetrics;
        private PopularityTrends popularityTrends;
        private AreaInsights insights;
        private String competitorAnalysis;
    }

    @lombok.Data
    @lombok.Builder
    public static class ActivityMetrics {
        private int totalActivities;
        private int gamesCount;
        private int venuesCount;
        private double activityDensity;
        private Map<String, Long> sportDistribution;
        private String dominantSport;
        private double diversityIndex;
    }

    @lombok.Data
    @lombok.Builder
    public static class PopularityTrends {
        private Map<Integer, Long> weeklyActivity;
        private String trendDirection;
        private double growthRate;
        private int peakWeek;
    }

    @lombok.Data
    @lombok.Builder
    public static class AreaInsights {
        private List<String> insights;
        private List<String> opportunities;
        private List<String> strengths;
        private List<String> challenges;
    }

    // Placeholder classes for complex features
    @lombok.Data
    @lombok.Builder
    public static class UserLocationPatterns {
        private String username;
        private int analysisPeriodDays;
        private List<String> frequentAreas;
        private TravelPatterns travelPatterns;
        private List<Venue> preferredVenues;
        private LocationHeatmap activityHeatmap;
        private double locationDiversity;
    }

    @lombok.Data
    @lombok.Builder
    public static class TravelPatterns {
        // Placeholder for travel pattern data
    }

    @lombok.Data
    @lombok.Builder
    public static class LocationHeatmap {
        // Placeholder for heatmap data
    }

    @lombok.Data
    @lombok.Builder
    public static class LocationEngagementMetrics {
        private String location;
        private boolean hasData;
        private int analysisPeriodDays;
        private int totalGames;
        private int totalParticipants;
        private double averageParticipants;
        private int uniqueUsers;
        private int repeatVisitors;
        private double retentionRate;
        private double engagementScore;
        private String message;
    }

    @lombok.Data
    @lombok.Builder
    public static class LocationPerformanceInsights {
        private LocationPoint location;
        private double radiusKm;
        private int totalGamesAnalyzed;
        private Map<String, Double> performanceByVenue;
        private Map<String, Double> performanceBySport;
        private Map<String, Double> performanceByTimeOfDay;
        private List<LocationSuccessFactor> successFactors;
        private double locationRating;
        private List<String> recommendations;
    }

    @lombok.Data
    @lombok.Builder
    public static class LocationSuccessFactor {
        private String factor;
        private double impact;
        private String description;
    }

    @lombok.Data
    @lombok.Builder
    public static class TrendingLocations {
        private int analysisPeriodDays;
        private Map<String, LocationTrend> trends;
        private List<EmergingHotspot> emergingHotspots;
        private List<LocationMomentum> momentum;
        private List<LocationMomentum> topTrendingAreas;
    }

    @lombok.Data
    @lombok.Builder
    public static class LocationTrend {
        private String location;
        private double growthRate;
        private int activityCount;
        private String trendDirection;
    }

    @lombok.Data
    @lombok.Builder
    public static class EmergingHotspot {
        private String name;
        private LocationPoint location;
        private double growthRate;
        private int newActivities;
    }

    @lombok.Data
    @lombok.Builder
    public static class LocationMomentum {
        private String location;
        private LocationTrend trend;
        private double momentumScore;
    }

    @lombok.Data
    @lombok.Builder
    public static class LocationOptimizationReport {
        private double optimizationScore;
        private List<UnderutilizedArea> underutilizedAreas;
        private List<OversaturatedArea> oversaturatedAreas;
        private List<ExpansionOpportunity> expansionOpportunities;
        private List<String> recommendations;
        private java.time.Instant lastAnalyzed;
    }

    @lombok.Data
    @lombok.Builder
    public static class UnderutilizedArea {
        private String name;
        private LocationPoint location;
        private double utilizationRate;
        private String recommendations;
    }

    @lombok.Data
    @lombok.Builder
    public static class OversaturatedArea {
        private String name;
        private LocationPoint location;
        private double saturationLevel;
        private String recommendations;
    }

    @lombok.Data
    @lombok.Builder
    public static class ExpansionOpportunity {
        private String area;
        private LocationPoint suggestedLocation;
        private String opportunity;
        private double potentialImpact;
    }
}
