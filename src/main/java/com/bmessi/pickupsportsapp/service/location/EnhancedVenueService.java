package com.bmessi.pickupsportsapp.service.location;

import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.entity.VenueBooking;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.repository.VenueRepository;
import com.bmessi.pickupsportsapp.repository.VenueBookingRepository;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.service.VenueService;
import com.bmessi.pickupsportsapp.service.VenueBookingService;
import com.bmessi.pickupsportsapp.realtime.service.RealTimeEventService;
import com.bmessi.pickupsportsapp.realtime.event.LocationUpdateEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Enhanced venue service with advanced location-based features.
 * 
 * Features:
 * - Smart venue recommendations
 * - Real-time availability tracking
 * - Venue utilization analytics
 * - Automated booking management
 * - Venue performance metrics
 * - Location-based venue discovery
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EnhancedVenueService {

    private final VenueRepository venueRepository;
    private final VenueBookingRepository venueBookingRepository;
    private final GameRepository gameRepository;
    private final VenueService venueService;
    private final VenueBookingService venueBookingService;
    private final LocationService locationService;
    private final RealTimeEventService realTimeEventService;

    /**
     * Get comprehensive venue recommendations based on location and requirements.
     */
    @Transactional(readOnly = true)
    public VenueRecommendations getVenueRecommendations(VenueRecommendationRequest request) {
        try {
            // Find venues near the requested location
            List<LocationService.VenueWithDistance> nearbyVenues = locationService
                    .findVenuesNearLocation(request.getLatitude(), request.getLongitude(), 
                                          request.getMaxRadius(), 50);

            // Filter by requirements
            List<LocationService.VenueWithDistance> filteredVenues = filterVenuesByRequirements(
                    nearbyVenues, request);

            // Enhance with availability and booking data
            List<EnhancedVenueRecommendation> enhanced = enhanceVenueRecommendations(
                    filteredVenues, request);

            // Rank by suitability
            List<EnhancedVenueRecommendation> ranked = rankVenueRecommendations(enhanced, request);

            return VenueRecommendations.builder()
                    .searchLocation(new LocationService.LocationPoint(request.getLatitude(), request.getLongitude()))
                    .searchCriteria(request)
                    .totalFound(ranked.size())
                    .recommendations(ranked.stream().limit(request.getMaxResults()).collect(Collectors.toList()))
                    .alternativeOptions(generateAlternativeVenueOptions(request, ranked.size()))
                    .searchSummary(generateVenueRecommendationSummary(ranked))
                    .build();

        } catch (Exception e) {
            log.error("Error getting venue recommendations: {}", e.getMessage());
            return VenueRecommendations.builder().build();
        }
    }

    /**
     * Get real-time venue availability for a specific time window.
     */
    @Transactional(readOnly = true)
    public VenueAvailability getVenueAvailability(Long venueId, OffsetDateTime startTime, 
                                                OffsetDateTime endTime) {
        try {
            Optional<Venue> venueOpt = venueRepository.findById(venueId);
            if (!venueOpt.isPresent()) {
                return VenueAvailability.builder()
                        .venueId(venueId)
                        .isAvailable(false)
                        .reason("Venue not found")
                        .build();
            }

            Venue venue = venueOpt.get();

            // Check venue business hours
            boolean withinBusinessHours = isWithinBusinessHours(venue, startTime);
            if (!withinBusinessHours) {
                return VenueAvailability.builder()
                        .venueId(venueId)
                        .venue(venue)
                        .isAvailable(false)
                        .reason("Outside business hours")
                        .build();
            }

            // Check existing bookings
            List<VenueBooking> conflictingBookings = venueBookingRepository
                    .findConflictingBookings(venueId, startTime.toLocalDateTime(), endTime.toLocalDateTime());

            boolean hasConflicts = !conflictingBookings.isEmpty();

            // Calculate availability percentage
            double availabilityPercentage = calculateAvailabilityPercentage(venue, startTime, endTime);

            return VenueAvailability.builder()
                    .venueId(venueId)
                    .venue(venue)
                    .isAvailable(!hasConflicts)
                    .reason(hasConflicts ? "Time slot already booked" : "Available")
                    .conflictingBookings(conflictingBookings)
                    .availabilityPercentage(availabilityPercentage)
                    .suggestedAlternativeTimes(hasConflicts ? 
                            findAlternativeTimes(venue, startTime, endTime) : List.of())
                    .build();

        } catch (Exception e) {
            log.error("Error checking venue availability for venue {}: {}", venueId, e.getMessage());
            return VenueAvailability.builder()
                    .venueId(venueId)
                    .isAvailable(false)
                    .reason("Error checking availability")
                    .build();
        }
    }

    /**
     * Get venue utilization analytics and insights.
     */
    @Transactional(readOnly = true)
    public VenueAnalytics getVenueAnalytics(Long venueId, int days) {
        try {
            Optional<Venue> venueOpt = venueRepository.findById(venueId);
            if (!venueOpt.isPresent()) {
                return VenueAnalytics.builder().build();
            }

            Venue venue = venueOpt.get();
            LocalDateTime since = LocalDateTime.now().minusDays(days);

            // Get bookings and games for the period
            List<VenueBooking> recentBookings = venueBookingRepository
                    .findByVenueIdAndStartTimeAfter(venueId, since);
            
            List<Game> recentGames = gameRepository.findAll().stream()
                    .filter(g -> venue.equals(g.getVenue()) && 
                                g.getCreatedAt().toLocalDateTime().isAfter(since))
                    .collect(Collectors.toList());

            // Calculate utilization metrics
            double utilizationRate = calculateUtilizationRate(venue, recentBookings, days);
            Map<String, Integer> sportUsage = analyzeSportUsage(recentGames);
            Map<String, Integer> timeSlotPopularity = analyzeTimeSlotPopularity(recentBookings, recentGames);

            return VenueAnalytics.builder()
                    .venueId(venueId)
                    .venue(venue)
                    .analysisPeriodDays(days)
                    .totalBookings(recentBookings.size())
                    .totalGames(recentGames.size())
                    .utilizationRate(utilizationRate)
                    .sportUsageBreakdown(sportUsage)
                    .timeSlotPopularity(timeSlotPopularity)
                    .peakUsageHours(findPeakUsageHours(recentBookings, recentGames))
                    .averageBookingDuration(calculateAverageBookingDuration(recentBookings))
                    .revenueEstimate(estimateRevenue(recentBookings, venue))
                    .build();

        } catch (Exception e) {
            log.error("Error getting venue analytics for venue {}: {}", venueId, e.getMessage());
            return VenueAnalytics.builder().build();
        }
    }

    /**
     * Suggest optimal venues for a planned game.
     */
    @Transactional(readOnly = true)
    public List<VenueSuggestion> suggestVenuesForGame(GameVenueRequest request) {
        try {
            // Find venues that support the sport
            List<Venue> suitableVenues = venueRepository.findBySupportedSportsContaining(request.getSport());

            // Filter by location if specified
            List<LocationService.VenueWithDistance> venuesWithDistance = new ArrayList<>();
            if (request.getLatitude() != null && request.getLongitude() != null) {
                venuesWithDistance = suitableVenues.stream()
                        .filter(v -> v.getLatitude() != null && v.getLongitude() != null)
                        .map(v -> {
                            double distance = locationService.calculateDistance(
                                request.getLatitude(), request.getLongitude(),
                                v.getLatitude().doubleValue(), v.getLongitude().doubleValue());
                            return new LocationService.VenueWithDistance(v, distance);
                        })
                        .filter(vwd -> vwd.getDistance() <= request.getMaxRadius())
                        .sorted(Comparator.comparing(LocationService.VenueWithDistance::getDistance))
                        .collect(Collectors.toList());
            } else {
                venuesWithDistance = suitableVenues.stream()
                        .map(v -> new LocationService.VenueWithDistance(v, 0.0))
                        .collect(Collectors.toList());
            }

            // Check availability and create suggestions
            return venuesWithDistance.stream()
                    .limit(request.getMaxResults())
                    .map(vwd -> createVenueSuggestion(vwd, request))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error suggesting venues for game: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Track venue performance and send updates.
     */
    @Transactional
    public void updateVenuePerformanceMetrics(Long venueId) {
        try {
            Optional<Venue> venueOpt = venueRepository.findById(venueId);
            if (!venueOpt.isPresent()) return;

            Venue venue = venueOpt.get();

            // Calculate recent performance metrics
            VenuePerformanceMetrics metrics = calculateVenuePerformanceMetrics(venue);

            // Send real-time update if significant change
            if (metrics.hasSignificantChange()) {
                sendVenueUpdateNotification(venue, metrics);
            }

            log.debug("Updated performance metrics for venue {}: utilization={}%", 
                     venueId, metrics.getUtilizationRate());

        } catch (Exception e) {
            log.error("Error updating venue performance metrics for venue {}: {}", venueId, e.getMessage());
        }
    }

    // Private helper methods

    private List<LocationService.VenueWithDistance> filterVenuesByRequirements(
            List<LocationService.VenueWithDistance> venues, VenueRecommendationRequest request) {
        
        return venues.stream()
                .filter(vwd -> {
                    Venue venue = vwd.getVenue();
                    
                    // Filter by sport support
                    if (request.getSport() != null && !venueSupportsActivities(venue, request.getSport())) {
                        return false;
                    }
                    
                    // Filter by capacity
                    if (request.getMinCapacity() != null && venue.getMaxCapacity() < request.getMinCapacity()) {
                        return false;
                    }
                    
                    // Filter by price range
                    if (request.getMaxPricePerHour() != null && 
                        venue.getBasePricePerHour() != null && 
                        venue.getBasePricePerHour().doubleValue() > request.getMaxPricePerHour()) {
                        return false;
                    }
                    
                    // Filter by amenities
                    if (request.getRequiredAmenities() != null && !request.getRequiredAmenities().isEmpty()) {
                        // Check if venue has required amenities
                        return hasRequiredAmenities(venue, request.getRequiredAmenities());
                    }
                    
                    return true;
                })
                .collect(Collectors.toList());
    }

    private List<EnhancedVenueRecommendation> enhanceVenueRecommendations(
            List<LocationService.VenueWithDistance> venues, VenueRecommendationRequest request) {
        
        return venues.stream()
                .map(vwd -> {
                    Venue venue = vwd.getVenue();
                    
                    // Get availability for requested time
                    VenueAvailability availability = null;
                    if (request.getDesiredStartTime() != null && request.getDesiredEndTime() != null) {
                        availability = getVenueAvailability(venue.getId(), 
                                                          request.getDesiredStartTime(), 
                                                          request.getDesiredEndTime());
                    }
                    
                    // Calculate venue score
                    double venueScore = calculateVenueScore(venue, vwd.getDistance(), request);
                    
                    // Get recent reviews/ratings
                    VenueRating rating = getVenueRating(venue.getId());
                    
                    return EnhancedVenueRecommendation.builder()
                            .venue(venue)
                            .distance(vwd.getDistance())
                            .availability(availability)
                            .venueScore(venueScore)
                            .rating(rating)
                            .estimatedCost(estimateVenueCost(venue, request))
                            .popularityScore(calculateVenuePopularityScore(venue.getId()))
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<EnhancedVenueRecommendation> rankVenueRecommendations(
            List<EnhancedVenueRecommendation> recommendations, VenueRecommendationRequest request) {
        
        return recommendations.stream()
                .sorted((r1, r2) -> {
                    // Multi-criteria ranking
                    double score1 = calculateOverallVenueScore(r1, request);
                    double score2 = calculateOverallVenueScore(r2, request);
                    return Double.compare(score2, score1);
                })
                .collect(Collectors.toList());
    }

    private double calculateOverallVenueScore(EnhancedVenueRecommendation rec, VenueRecommendationRequest request) {
        double score = rec.getVenueScore() * 0.4; // Base venue score (40%)
        
        // Distance factor (30%)
        double distanceScore = Math.max(0, 100 - (rec.getDistance() * 10));
        score += distanceScore * 0.3;
        
        // Availability factor (20%)
        double availabilityScore = rec.getAvailability() != null && rec.getAvailability().isAvailable() ? 100 : 0;
        score += availabilityScore * 0.2;
        
        // Popularity factor (10%)
        score += rec.getPopularityScore() * 0.1;
        
        return score;
    }

    private List<AlternativeVenueOption> generateAlternativeVenueOptions(VenueRecommendationRequest request, 
                                                                       int currentResults) {
        List<AlternativeVenueOption> alternatives = new ArrayList<>();
        
        if (currentResults < request.getMaxResults() / 2) {
            // Suggest expanding radius
            alternatives.add(AlternativeVenueOption.builder()
                    .type("EXPAND_RADIUS")
                    .title("Expand search area")
                    .description("Search within " + (request.getMaxRadius() * 1.5) + "km for more venues")
                    .actionData(Map.of("suggestedRadius", request.getMaxRadius() * 1.5))
                    .build());
            
            // Suggest different times
            if (request.getDesiredStartTime() != null) {
                alternatives.add(AlternativeVenueOption.builder()
                        .type("FLEXIBLE_TIME")
                        .title("Try different times")
                        .description("More venues may be available at different times")
                        .actionData(Map.of("suggestion", "flexible_timing"))
                        .build());
            }
        }
        
        return alternatives;
    }

    private VenueRecommendationSummary generateVenueRecommendationSummary(
            List<EnhancedVenueRecommendation> recommendations) {
        
        if (recommendations.isEmpty()) {
            return VenueRecommendationSummary.builder()
                    .message("No venues found matching your criteria")
                    .build();
        }

        double avgDistance = recommendations.stream()
                .mapToDouble(EnhancedVenueRecommendation::getDistance)
                .average()
                .orElse(0.0);

        double avgScore = recommendations.stream()
                .mapToDouble(EnhancedVenueRecommendation::getVenueScore)
                .average()
                .orElse(0.0);

        long availableCount = recommendations.stream()
                .filter(r -> r.getAvailability() != null && r.getAvailability().isAvailable())
                .count();

        return VenueRecommendationSummary.builder()
                .totalRecommendations(recommendations.size())
                .averageDistance(avgDistance)
                .averageScore(avgScore)
                .availableVenues((int) availableCount)
                .message(String.format("Found %d venues (avg %.1fkm away, %d available)", 
                        recommendations.size(), avgDistance, availableCount))
                .build();
    }

    private VenueSuggestion createVenueSuggestion(LocationService.VenueWithDistance vwd, 
                                                GameVenueRequest request) {
        Venue venue = vwd.getVenue();
        
        // Check availability for game time
        boolean isAvailable = true;
        if (request.getGameTime() != null) {
            OffsetDateTime endTime = request.getGameTime().plusHours(2); // Assume 2-hour games
            VenueAvailability availability = getVenueAvailability(venue.getId(), 
                                                                request.getGameTime(), endTime);
            isAvailable = availability.isAvailable();
        }

        // Calculate suitability score
        double suitabilityScore = calculateGameVenueSuitability(venue, request);

        return VenueSuggestion.builder()
                .venue(venue)
                .distance(vwd.getDistance())
                .isAvailable(isAvailable)
                .suitabilityScore(suitabilityScore)
                .estimatedCost(calculateGameVenueCost(venue, request))
                .recommendationReason(generateGameVenueReason(venue, request, vwd.getDistance()))
                .build();
    }

    private VenuePerformanceMetrics calculateVenuePerformanceMetrics(Venue venue) {
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        
        List<VenueBooking> recentBookings = venueBookingRepository
                .findByVenueIdAndStartTimeAfter(venue.getId(), since);
        
        double utilizationRate = calculateUtilizationRate(venue, recentBookings, 30);
        double averageRating = calculateAverageVenueRating(venue.getId());
        int totalBookings = recentBookings.size();

        // Check for significant changes (simplified)
        boolean hasSignificantChange = utilizationRate > 80.0 || utilizationRate < 20.0;

        return VenuePerformanceMetrics.builder()
                .venueId(venue.getId())
                .utilizationRate(utilizationRate)
                .averageRating(averageRating)
                .totalBookings(totalBookings)
                .hasSignificantChange(hasSignificantChange)
                .build();
    }

    private void sendVenueUpdateNotification(Venue venue, VenuePerformanceMetrics metrics) {
        try {
            String message = String.format("Venue '%s' utilization: %.1f%%", 
                                         venue.getName(), metrics.getUtilizationRate());
            
            LocationUpdateEvent updateEvent = new LocationUpdateEvent(
                venue.getLocation(),
                "VENUE_UTILIZATION",
                "Venue Update",
                message,
                metrics.getUtilizationRate() > 90 ? "HIGH" : "NORMAL"
            );
            
            realTimeEventService.publishEvent(updateEvent);
            
        } catch (Exception e) {
            log.error("Error sending venue update notification: {}", e.getMessage());
        }
    }

    // Utility methods

    private boolean venueSupportsActivities(Venue venue, String sport) {
        // Check if venue supports the requested sport
        return venue.getSupportedSports().stream()
                .anyMatch(s -> sport.equalsIgnoreCase(s.getName()));
    }

    private boolean hasRequiredAmenities(Venue venue, List<String> requiredAmenities) {
        Set<String> venueAmenities = venue.getAmenities().stream()
                .map(a -> a.getName().toLowerCase())
                .collect(Collectors.toSet());
        
        return requiredAmenities.stream()
                .allMatch(amenity -> venueAmenities.contains(amenity.toLowerCase()));
    }

    private boolean isWithinBusinessHours(Venue venue, OffsetDateTime time) {
        // Check venue business hours
        return venue.getBusinessHours().stream()
                .anyMatch(hours -> {
                    if (hours.getDayOfWeek() == time.getDayOfWeek()) {
                        return !time.toLocalTime().isBefore(hours.getOpenTime()) &&
                               !time.toLocalTime().isAfter(hours.getCloseTime());
                    }
                    return false;
                });
    }

    private double calculateAvailabilityPercentage(Venue venue, OffsetDateTime start, OffsetDateTime end) {
        // Calculate what percentage of the requested time slot is available
        return 100.0; // Placeholder
    }

    private List<OffsetDateTime> findAlternativeTimes(Venue venue, OffsetDateTime start, OffsetDateTime end) {
        // Find alternative available time slots
        return List.of(); // Placeholder
    }

    private double calculateUtilizationRate(Venue venue, List<VenueBooking> bookings, int days) {
        if (bookings.isEmpty()) return 0.0;
        
        // Calculate total booked hours vs total available hours
        double totalBookedHours = bookings.stream()
                .mapToDouble(booking -> {
                    if (booking.getEndTime() != null && booking.getStartTime() != null) {
                        return java.time.Duration.between(booking.getStartTime(), booking.getEndTime()).toHours();
                    }
                    return 2.0; // Default 2 hours
                })
                .sum();
        
        // Assume venue is available 12 hours per day
        double totalAvailableHours = days * 12.0;
        
        return (totalBookedHours / totalAvailableHours) * 100;
    }

    private Map<String, Integer> analyzeSportUsage(List<Game> games) {
        return games.stream()
                .filter(g -> g.getSport() != null)
                .collect(Collectors.groupingBy(
                    Game::getSport,
                    Collectors.summingInt(g -> 1)
                ));
    }

    private Map<String, Integer> analyzeTimeSlotPopularity(List<VenueBooking> bookings, List<Game> games) {
        Map<String, Integer> timeSlots = new HashMap<>();
        
        // Analyze booking times
        for (VenueBooking booking : bookings) {
            if (booking.getStartTime() != null) {
                String timeSlot = getTimeSlot(booking.getStartTime().getHour());
                timeSlots.merge(timeSlot, 1, Integer::sum);
            }
        }
        
        // Analyze game times
        for (Game game : games) {
            if (game.getTime() != null) {
                String timeSlot = getTimeSlot(game.getTime().getHour());
                timeSlots.merge(timeSlot, 1, Integer::sum);
            }
        }
        
        return timeSlots;
    }

    private String getTimeSlot(int hour) {
        if (hour >= 6 && hour < 12) return "MORNING";
        if (hour >= 12 && hour < 17) return "AFTERNOON";
        if (hour >= 17 && hour < 21) return "EVENING";
        return "NIGHT";
    }

    private List<Integer> findPeakUsageHours(List<VenueBooking> bookings, List<Game> games) {
        Map<Integer, Integer> hourlyUsage = new HashMap<>();
        
        // Count bookings by hour
        bookings.forEach(booking -> {
            if (booking.getStartTime() != null) {
                int hour = booking.getStartTime().getHour();
                hourlyUsage.merge(hour, 1, Integer::sum);
            }
        });
        
        // Count games by hour
        games.forEach(game -> {
            if (game.getTime() != null) {
                int hour = game.getTime().getHour();
                hourlyUsage.merge(hour, 1, Integer::sum);
            }
        });
        
        return hourlyUsage.entrySet().stream()
                .sorted(Map.Entry.<Integer, Integer>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .limit(3)
                .collect(Collectors.toList());
    }

    private double calculateAverageBookingDuration(List<VenueBooking> bookings) {
        return bookings.stream()
                .filter(b -> b.getStartTime() != null && b.getEndTime() != null)
                .mapToDouble(b -> java.time.Duration.between(b.getStartTime(), b.getEndTime()).toHours())
                .average()
                .orElse(2.0); // Default 2 hours
    }

    private double estimateRevenue(List<VenueBooking> bookings, Venue venue) {
        if (venue.getHourlyRate() == null) return 0.0;
        
        double totalHours = calculateAverageBookingDuration(bookings) * bookings.size();
        return totalHours * venue.getHourlyRate().doubleValue();
    }

    private double calculateVenueScore(Venue venue, double distance, VenueRecommendationRequest request) {
        double score = 100.0;
        
        // Distance penalty
        score -= distance * 5;
        
        // Capacity bonus
        if (request.getMinCapacity() != null && venue.getMaxCapacity() > request.getMinCapacity()) {
            score += 10;
        }
        
        // Price factor
        if (venue.getBasePricePerHour() != null && request.getMaxPricePerHour() != null) {
            if (venue.getBasePricePerHour().doubleValue() <= request.getMaxPricePerHour() * 0.8) {
                score += 15; // Good value bonus
            }
        }
        
        return Math.max(0.0, score);
    }

    private VenueRating getVenueRating(Long venueId) {
        // Get venue rating from reviews/bookings
        return VenueRating.builder()
                .averageRating(4.2) // Placeholder
                .totalReviews(15) // Placeholder
                .build();
    }

    private double estimateVenueCost(Venue venue, VenueRecommendationRequest request) {
        if (venue.getHourlyRate() == null) return 0.0;
        
        double hours = request.getDurationHours() != null ? request.getDurationHours() : 2.0;
        return venue.getHourlyRate().doubleValue() * hours;
    }

    private double calculateVenuePopularityScore(Long venueId) {
        // Calculate based on recent bookings, games, ratings
        return 75.0; // Placeholder
    }

    private double calculateGameVenueSuitability(Venue venue, GameVenueRequest request) {
        double score = 100.0;
        
        // Sport suitability
        if (request.getSport() != null && !venueSupportsActivities(venue, request.getSport())) {
            score -= 50;
        }
        
        // Capacity suitability
        if (request.getExpectedPlayers() != null) {
            if (venue.getMaxCapacity() < request.getExpectedPlayers()) {
                score -= 30; // Too small
            } else if (venue.getMaxCapacity() > request.getExpectedPlayers() * 3) {
                score -= 10; // Much larger than needed
            }
        }
        
        return Math.max(0.0, score);
    }

    private double calculateGameVenueCost(Venue venue, GameVenueRequest request) {
        if (venue.getHourlyRate() == null) return 0.0;
        
        double hours = request.getDurationHours() != null ? request.getDurationHours() : 2.0;
        double totalCost = venue.getHourlyRate().doubleValue() * hours;
        
        // Calculate per-player cost if players specified
        if (request.getExpectedPlayers() != null && request.getExpectedPlayers() > 0) {
            return totalCost / request.getExpectedPlayers();
        }
        
        return totalCost;
    }

    private String generateGameVenueReason(Venue venue, GameVenueRequest request, double distance) {
        List<String> reasons = new ArrayList<>();
        
        if (distance < 2.0) {
            reasons.add("very close");
        }
        
        if (venueSupportsActivities(venue, request.getSport())) {
            reasons.add("perfect for " + request.getSport());
        }
        
        if (venue.getHourlyRate() != null && venue.getHourlyRate().doubleValue() < 50.0) {
            reasons.add("affordable");
        }
        
        return reasons.isEmpty() ? "suitable for your game" : 
               "Great choice - " + String.join(", ", reasons);
    }

    private double calculateAverageVenueRating(Long venueId) {
        // Calculate from reviews and feedback
        return 4.0; // Placeholder
    }

    // Data Transfer Objects

    @lombok.Data
    @lombok.Builder
    public static class VenueRecommendationRequest {
        private double latitude;
        private double longitude;
        private double maxRadius;
        private String sport;
        private Integer minCapacity;
        private Double maxPricePerHour;
        private List<String> requiredAmenities;
        private OffsetDateTime desiredStartTime;
        private OffsetDateTime desiredEndTime;
        private Double durationHours;
        private int maxResults;
    }

    @lombok.Data
    @lombok.Builder
    public static class GameVenueRequest {
        private Double latitude;
        private Double longitude;
        private double maxRadius;
        private String sport;
        private Integer expectedPlayers;
        private OffsetDateTime gameTime;
        private Double durationHours;
        private int maxResults;
    }

    @lombok.Data
    @lombok.Builder
    public static class VenueRecommendations {
        private LocationService.LocationPoint searchLocation;
        private VenueRecommendationRequest searchCriteria;
        private int totalFound;
        private List<EnhancedVenueRecommendation> recommendations;
        private List<AlternativeVenueOption> alternativeOptions;
        private VenueRecommendationSummary searchSummary;
    }

    @lombok.Data
    @lombok.Builder
    public static class EnhancedVenueRecommendation {
        private Venue venue;
        private double distance;
        private VenueAvailability availability;
        private double venueScore;
        private VenueRating rating;
        private double estimatedCost;
        private double popularityScore;
    }

    @lombok.Data
    @lombok.Builder
    public static class VenueAvailability {
        private Long venueId;
        private Venue venue;
        private boolean isAvailable;
        private String reason;
        private List<VenueBooking> conflictingBookings;
        private double availabilityPercentage;
        private List<OffsetDateTime> suggestedAlternativeTimes;
    }

    @lombok.Data
    @lombok.Builder
    public static class VenueAnalytics {
        private Long venueId;
        private Venue venue;
        private int analysisPeriodDays;
        private int totalBookings;
        private int totalGames;
        private double utilizationRate;
        private Map<String, Integer> sportUsageBreakdown;
        private Map<String, Integer> timeSlotPopularity;
        private List<Integer> peakUsageHours;
        private double averageBookingDuration;
        private double revenueEstimate;
    }

    @lombok.Data
    @lombok.Builder
    public static class VenueSuggestion {
        private Venue venue;
        private double distance;
        private boolean isAvailable;
        private double suitabilityScore;
        private double estimatedCost;
        private String recommendationReason;
    }

    @lombok.Data
    @lombok.Builder
    public static class VenueRating {
        private double averageRating;
        private int totalReviews;
    }

    @lombok.Data
    @lombok.Builder
    public static class AlternativeVenueOption {
        private String type;
        private String title;
        private String description;
        private Map<String, Object> actionData;
    }

    @lombok.Data
    @lombok.Builder
    public static class VenueRecommendationSummary {
        private int totalRecommendations;
        private double averageDistance;
        private double averageScore;
        private int availableVenues;
        private String message;
    }

    @lombok.Data
    @lombok.Builder
    public static class VenuePerformanceMetrics {
        private Long venueId;
        private double utilizationRate;
        private double averageRating;
        private int totalBookings;
        private boolean hasSignificantChange;
    }
}
