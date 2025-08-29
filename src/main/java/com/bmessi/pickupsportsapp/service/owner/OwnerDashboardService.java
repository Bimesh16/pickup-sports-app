package com.bmessi.pickupsportsapp.service.owner;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.game.GameTemplate;
import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.GameTemplateRepository;
import com.bmessi.pickupsportsapp.repository.VenueRepository;
import com.bmessi.pickupsportsapp.service.game.GameTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * Service for app owner dashboard functionality.
 * 
 * <p>This service provides comprehensive tools for app owners to:</p>
 * <ul>
 *   <li><strong>Manage Venues:</strong> Book fields and manage availability</li>
 *   <li><strong>Create Games:</strong> Bulk game creation from templates</li>
 *   <li><strong>Analytics:</strong> Revenue tracking and performance metrics</li>
 *   <li><strong>Operations:</strong> Game monitoring and player management</li>
 * </ul>
 * 
 * <p><strong>Key Features:</strong></p>
 * <ul>
 *   <li><strong>Dashboard Metrics:</strong> Real-time KPIs and performance data</li>
 *   <li><strong>Revenue Analytics:</strong> Financial reporting and payout calculations</li>
 *   <li><strong>Game Management:</strong> Bulk operations and template-based creation</li>
 *   <li><strong>Venue Optimization:</strong> Utilization tracking and pricing recommendations</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OwnerDashboardService {

    private final GameRepository gameRepository;
    private final VenueRepository venueRepository;
    private final GameTemplateRepository gameTemplateRepository;
    private final GameTemplateService gameTemplateService;

    /**
     * Get comprehensive metrics for an app owner.
     */
    @Cacheable(cacheNames = "owner-metrics", key = "#ownerId + '_' + #timeRange")
    @Transactional(readOnly = true)
    public OwnerMetrics getOwnerMetrics(Long ownerId, TimeRange timeRange) {
        log.info("Generating metrics for owner {} for time range {}", ownerId, timeRange);
        
        OffsetDateTime startDate = calculateStartDate(timeRange);
        OffsetDateTime endDate = OffsetDateTime.now();
        
        // Game Statistics
        long totalGames = gameRepository.countByUserIdAndCreatedAtBetween(ownerId, startDate, endDate);
        long publishedGames = gameRepository.countByUserIdAndStatusAndCreatedAtBetween(
                ownerId, Game.GameStatus.PUBLISHED, startDate, endDate);
        long completedGames = gameRepository.countByUserIdAndStatusAndCreatedAtBetween(
                ownerId, Game.GameStatus.COMPLETED, startDate, endDate);
        long cancelledGames = gameRepository.countByUserIdAndStatusAndCreatedAtBetween(
                ownerId, Game.GameStatus.CANCELLED, startDate, endDate);

        // Revenue Statistics
        BigDecimal totalRevenue = gameRepository.sumTotalCostByUserIdAndStatusAndCreatedAtBetween(
                ownerId, Game.GameStatus.COMPLETED, startDate, endDate);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        
        BigDecimal averageGameRevenue = completedGames > 0 ? 
                totalRevenue.divide(BigDecimal.valueOf(completedGames), 2, java.math.RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        // Player Statistics  
        long totalPlayers = gameRepository.sumParticipantsByUserIdAndCreatedAtBetween(ownerId, startDate, endDate);
        double averagePlayersPerGame = totalGames > 0 ? (double) totalPlayers / totalGames : 0.0;
        
        // Venue Utilization
        List<VenueUtilization> venueStats = getVenueUtilizationStats(ownerId, startDate, endDate);
        
        return OwnerMetrics.builder()
                .ownerId(ownerId)
                .timeRange(timeRange)
                .totalGames(totalGames)
                .publishedGames(publishedGames)
                .completedGames(completedGames)
                .cancelledGames(cancelledGames)
                .gameCompletionRate(totalGames > 0 ? (double) completedGames / totalGames * 100 : 0.0)
                .totalRevenue(totalRevenue)
                .averageGameRevenue(averageGameRevenue)
                .totalPlayers(totalPlayers)
                .averagePlayersPerGame(averagePlayersPerGame)
                .venueUtilization(venueStats)
                .build();
    }

    /**
     * Get revenue analytics for detailed financial reporting.
     */
    @Cacheable(cacheNames = "revenue-analytics", key = "#ownerId + '_' + #timeRange")
    @Transactional(readOnly = true)
    public RevenueAnalytics getRevenueAnalytics(Long ownerId, TimeRange timeRange) {
        log.info("Generating revenue analytics for owner {} for time range {}", ownerId, timeRange);
        
        OffsetDateTime startDate = calculateStartDate(timeRange);
        OffsetDateTime endDate = OffsetDateTime.now();
        
        // Daily revenue breakdown
        List<DailyRevenue> dailyRevenue = getDailyRevenueBreakdown(ownerId, startDate, endDate);
        
        // Sport-wise revenue breakdown  
        List<SportRevenue> sportRevenue = getSportRevenueBreakdown(ownerId, startDate, endDate);
        
        // Venue performance
        List<VenueRevenue> venueRevenue = getVenueRevenueBreakdown(ownerId, startDate, endDate);
        
        // Calculate projections
        BigDecimal monthlyProjection = calculateMonthlyProjection(dailyRevenue);
        
        return RevenueAnalytics.builder()
                .timeRange(timeRange)
                .dailyRevenue(dailyRevenue)
                .sportBreakdown(sportRevenue)
                .venueBreakdown(venueRevenue)
                .monthlyProjection(monthlyProjection)
                .build();
    }

    /**
     * Get popular games and templates for owner insights.
     */
    @Cacheable(cacheNames = "popular-games", key = "#ownerId")
    @Transactional(readOnly = true)
    public PopularGamesReport getPopularGames(Long ownerId) {
        log.info("Generating popular games report for owner {}", ownerId);
        
        // Most popular sports
        List<SportPopularity> popularSports = getPopularSports(ownerId);
        
        // Most used templates
        List<TemplateUsage> popularTemplates = getPopularTemplates(ownerId);
        
        // Best performing venues
        List<VenuePerformance> topVenues = getTopPerformingVenues(ownerId);
        
        // Peak time analysis
        List<TimeSlotPopularity> peakTimes = getPeakTimeAnalysis(ownerId);
        
        return PopularGamesReport.builder()
                .popularSports(popularSports)
                .popularTemplates(popularTemplates)
                .topVenues(topVenues)
                .peakTimes(peakTimes)
                .build();
    }

    /**
     * Create multiple games from a template across different time slots.
     */
    @Transactional
    public List<Game> createGamesFromTemplate(BulkGameCreationRequest request) {
        log.info("Creating {} games from template {} for owner {}", 
                 request.getTimeSlots().size(), request.getTemplateId(), request.getOwnerId());
        
        GameTemplate template = gameTemplateRepository.findByIdAndIsActiveTrue(request.getTemplateId())
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + request.getTemplateId()));
        
        User owner = getUserById(request.getOwnerId());
        List<Game> createdGames = new ArrayList<>();
        
        for (TimeSlotVenue slot : request.getTimeSlots()) {
            try {
                GameTemplateService.ApplyTemplateRequest applyRequest = new GameTemplateService.ApplyTemplateRequest();
                applyRequest.setTemplateId(request.getTemplateId());
                applyRequest.setVenueId(slot.getVenueId());
                applyRequest.setStartTime(slot.getStartTime());
                applyRequest.setVenueCost(slot.getVenueCost());
                applyRequest.setCreator(owner);
                applyRequest.setDescription(request.getDescription());
                
                Game game = gameTemplateService.createGameFromTemplate(applyRequest);
                createdGames.add(game);
                
                log.debug("Created game {} for time slot {}", game.getId(), slot.getStartTime());
                
            } catch (Exception e) {
                log.error("Failed to create game for time slot {}: {}", slot.getStartTime(), e.getMessage());
                // Continue creating other games even if one fails
            }
        }
        
        log.info("Successfully created {}/{} games from template {}", 
                 createdGames.size(), request.getTimeSlots().size(), request.getTemplateId());
        
        return createdGames;
    }

    // Private helper methods

    private OffsetDateTime calculateStartDate(TimeRange timeRange) {
        OffsetDateTime now = OffsetDateTime.now();
        return switch (timeRange) {
            case TODAY -> now.withHour(0).withMinute(0).withSecond(0);
            case WEEK -> now.minusWeeks(1);
            case MONTH -> now.minusMonths(1);
            case QUARTER -> now.minusMonths(3);
            case YEAR -> now.minusYears(1);
        };
    }

    private User getUserById(Long userId) {
        // TODO: Inject UserRepository and implement
        return null; // Placeholder
    }

    private List<VenueUtilization> getVenueUtilizationStats(Long ownerId, OffsetDateTime start, OffsetDateTime end) {
        // TODO: Implement venue utilization calculation
        return Collections.emptyList();
    }

    private List<DailyRevenue> getDailyRevenueBreakdown(Long ownerId, OffsetDateTime start, OffsetDateTime end) {
        // TODO: Implement daily revenue calculation
        return Collections.emptyList();
    }

    private List<SportRevenue> getSportRevenueBreakdown(Long ownerId, OffsetDateTime start, OffsetDateTime end) {
        // TODO: Implement sport revenue calculation  
        return Collections.emptyList();
    }

    private List<VenueRevenue> getVenueRevenueBreakdown(Long ownerId, OffsetDateTime start, OffsetDateTime end) {
        // TODO: Implement venue revenue calculation
        return Collections.emptyList();
    }

    private BigDecimal calculateMonthlyProjection(List<DailyRevenue> dailyRevenue) {
        // TODO: Implement projection calculation based on trends
        return BigDecimal.ZERO;
    }

    private List<SportPopularity> getPopularSports(Long ownerId) {
        // TODO: Implement sport popularity calculation
        return Collections.emptyList();
    }

    private List<TemplateUsage> getPopularTemplates(Long ownerId) {
        // TODO: Implement template usage tracking
        return Collections.emptyList();
    }

    private List<VenuePerformance> getTopPerformingVenues(Long ownerId) {
        // TODO: Implement venue performance metrics
        return Collections.emptyList();
    }

    private List<TimeSlotPopularity> getPeakTimeAnalysis(Long ownerId) {
        // TODO: Implement time slot analysis
        return Collections.emptyList();
    }

    // Data classes for dashboard responses

    public enum TimeRange {
        TODAY, WEEK, MONTH, QUARTER, YEAR
    }

    @lombok.Builder
    @lombok.Data
    public static class OwnerMetrics {
        private Long ownerId;
        private TimeRange timeRange;
        private long totalGames;
        private long publishedGames;
        private long completedGames;
        private long cancelledGames;
        private double gameCompletionRate;
        private BigDecimal totalRevenue;
        private BigDecimal averageGameRevenue;
        private long totalPlayers;
        private double averagePlayersPerGame;
        private List<VenueUtilization> venueUtilization;
    }

    @lombok.Builder  
    @lombok.Data
    public static class RevenueAnalytics {
        private TimeRange timeRange;
        private List<DailyRevenue> dailyRevenue;
        private List<SportRevenue> sportBreakdown;
        private List<VenueRevenue> venueBreakdown;
        private BigDecimal monthlyProjection;
    }

    @lombok.Builder
    @lombok.Data
    public static class PopularGamesReport {
        private List<SportPopularity> popularSports;
        private List<TemplateUsage> popularTemplates;
        private List<VenuePerformance> topVenues;
        private List<TimeSlotPopularity> peakTimes;
    }

    @lombok.Builder
    @lombok.Data
    public static class BulkGameCreationRequest {
        private Long ownerId;
        private Long templateId;
        private List<TimeSlotVenue> timeSlots;
        private String description;
    }

    @lombok.Builder
    @lombok.Data
    public static class TimeSlotVenue {
        private Long venueId;
        private OffsetDateTime startTime;
        private BigDecimal venueCost;
    }

    // Placeholder data classes - implement based on requirements
    @lombok.Data
    public static class VenueUtilization {
        private Long venueId;
        private String venueName;
        private int gamesHosted;
        private double utilizationRate;
    }

    @lombok.Data
    public static class DailyRevenue {
        private LocalDate date;
        private BigDecimal revenue;
        private int gamesCount;
    }

    @lombok.Data
    public static class SportRevenue {
        private String sport;
        private BigDecimal revenue;
        private int gamesCount;
        private double percentage;
    }

    @lombok.Data
    public static class VenueRevenue {
        private Long venueId;
        private String venueName;
        private BigDecimal revenue;
        private int gamesCount;
    }

    @lombok.Data
    public static class SportPopularity {
        private String sport;
        private int gamesCount;
        private int playersCount;
        private double averageRating;
    }

    @lombok.Data
    public static class TemplateUsage {
        private Long templateId;
        private String templateName;
        private int usageCount;
        private double successRate;
    }

    @lombok.Data
    public static class VenuePerformance {
        private Long venueId;
        private String venueName;
        private int gamesHosted;
        private double averageRating;
        private BigDecimal totalRevenue;
    }

    @lombok.Data
    public static class TimeSlotPopularity {
        private String timeSlot; // "Morning", "Afternoon", "Evening"
        private int gamesCount;
        private double averageFillRate;
    }
}