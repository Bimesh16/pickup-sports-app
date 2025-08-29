package com.bmessi.pickupsportsapp.controller.dashboard;

import com.bmessi.pickupsportsapp.service.dashboard.UserDashboardService;
import com.bmessi.pickupsportsapp.service.dashboard.GameHistoryAnalyticsService;
import com.bmessi.pickupsportsapp.service.dashboard.PerformanceTrackingService;
import com.bmessi.pickupsportsapp.service.dashboard.EnhancedAchievementService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Comprehensive user dashboard API controller.
 * 
 * Provides rich endpoints for:
 * - Personal dashboard summary
 * - Detailed game history and analytics
 * - Performance tracking and predictions
 * - Achievement progress and recommendations
 * - Skill development insights
 * - Social activity and connections
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
@Validated
@Tag(name = "User Dashboard", description = "Personal dashboard and analytics APIs")
public class UserDashboardController {

    private final UserDashboardService dashboardService;
    private final GameHistoryAnalyticsService historyService;
    private final PerformanceTrackingService performanceService;
    private final EnhancedAchievementService achievementService;

    /**
     * Get comprehensive dashboard summary for the authenticated user.
     * GET /api/dashboard/summary
     */
    @GetMapping("/summary")
    @RateLimiter(name = "dashboard")
    @Operation(summary = "Get user dashboard summary", 
               description = "Returns comprehensive dashboard data including stats, achievements, and recommendations")
    public ResponseEntity<UserDashboardService.DashboardSummary> getDashboardSummary(Principal principal) {
        try {
            UserDashboardService.DashboardSummary dashboard = 
                dashboardService.getUserDashboard(principal.getName());
            
            log.debug("Retrieved dashboard summary for user: {}", principal.getName());
            return ResponseEntity.ok(dashboard);
            
        } catch (Exception e) {
            log.error("Error getting dashboard summary for user {}: {}", principal.getName(), e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get detailed game history with pagination.
     * GET /api/dashboard/game-history
     */
    @GetMapping("/game-history")
    @RateLimiter(name = "dashboard")
    @Operation(summary = "Get user game history", 
               description = "Returns paginated game history with detailed participation data")
    public ResponseEntity<Page<UserDashboardService.GameHistoryItem>> getGameHistory(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable,
            Principal principal) {
        
        try {
            Page<UserDashboardService.GameHistoryItem> history = 
                dashboardService.getUserGameHistory(principal.getName(), pageable);
            
            log.debug("Retrieved game history for user: {} (page: {}, size: {})", 
                     principal.getName(), pageable.getPageNumber(), pageable.getPageSize());
            
            return ResponseEntity.ok(history);
            
        } catch (Exception e) {
            log.error("Error getting game history for user {}: {}", principal.getName(), e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get performance analytics for a specific time period.
     * GET /api/dashboard/performance
     */
    @GetMapping("/performance")
    @RateLimiter(name = "dashboard")
    @Operation(summary = "Get performance analytics", 
               description = "Returns detailed performance analytics and trends for specified period")
    public ResponseEntity<UserDashboardService.PerformanceAnalytics> getPerformanceAnalytics(
            @Parameter(description = "Number of days to analyze") 
            @RequestParam(defaultValue = "30") int days,
            Principal principal) {
        
        try {
            UserDashboardService.PerformanceAnalytics analytics = 
                dashboardService.getUserPerformanceAnalytics(principal.getName(), days);
            
            log.debug("Retrieved performance analytics for user: {} (period: {} days)", 
                     principal.getName(), days);
            
            return ResponseEntity.ok(analytics);
            
        } catch (Exception e) {
            log.error("Error getting performance analytics for user {}: {}", principal.getName(), e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get comprehensive game history analytics.
     * GET /api/dashboard/analytics/history
     */
    @GetMapping("/analytics/history")
    @RateLimiter(name = "dashboard")
    @Operation(summary = "Get game history analytics", 
               description = "Returns detailed analytics of user's game participation patterns")
    public ResponseEntity<GameHistoryAnalyticsService.GameHistoryAnalytics> getGameHistoryAnalytics(
            @RequestParam(defaultValue = "90") int days,
            Principal principal) {
        
        try {
            GameHistoryAnalyticsService.GameHistoryAnalytics analytics = 
                historyService.getGameHistoryAnalytics(principal.getName(), days);
            
            return ResponseEntity.ok(analytics);
            
        } catch (Exception e) {
            log.error("Error getting history analytics for user {}: {}", principal.getName(), e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get participation timeline.
     * GET /api/dashboard/analytics/timeline
     */
    @GetMapping("/analytics/timeline")
    @RateLimiter(name = "dashboard")
    @Operation(summary = "Get participation timeline", 
               description = "Returns chronological participation data over specified months")
    public ResponseEntity<GameHistoryAnalyticsService.ParticipationTimeline> getParticipationTimeline(
            @RequestParam(defaultValue = "12") int months,
            Principal principal) {
        
        try {
            GameHistoryAnalyticsService.ParticipationTimeline timeline = 
                historyService.getParticipationTimeline(principal.getName(), months);
            
            return ResponseEntity.ok(timeline);
            
        } catch (Exception e) {
            log.error("Error getting participation timeline for user {}: {}", principal.getName(), e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get sport-specific performance breakdown.
     * GET /api/dashboard/analytics/sports
     */
    @GetMapping("/analytics/sports")
    @RateLimiter(name = "dashboard")
    @Operation(summary = "Get sport performance breakdown", 
               description = "Returns performance analytics broken down by sport")
    public ResponseEntity<List<GameHistoryAnalyticsService.SportPerformanceBreakdown>> getSportBreakdown(
            Principal principal) {
        
        try {
            List<GameHistoryAnalyticsService.SportPerformanceBreakdown> breakdown = 
                historyService.getSportPerformanceBreakdown(principal.getName());
            
            return ResponseEntity.ok(breakdown);
            
        } catch (Exception e) {
            log.error("Error getting sport breakdown for user {}: {}", principal.getName(), e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get performance comparison with peers.
     * GET /api/dashboard/performance/comparison
     */
    @GetMapping("/performance/comparison")
    @RateLimiter(name = "dashboard")
    @Operation(summary = "Get performance comparison", 
               description = "Returns user's performance compared to peers")
    public ResponseEntity<GameHistoryAnalyticsService.PerformanceComparison> getPerformanceComparison(
            Principal principal) {
        
        try {
            GameHistoryAnalyticsService.PerformanceComparison comparison = 
                historyService.getPerformanceComparison(principal.getName());
            
            return ResponseEntity.ok(comparison);
            
        } catch (Exception e) {
            log.error("Error getting performance comparison for user {}: {}", principal.getName(), e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get attendance and reliability analysis.
     * GET /api/dashboard/analytics/attendance
     */
    @GetMapping("/analytics/attendance")
    @RateLimiter(name = "dashboard")
    @Operation(summary = "Get attendance analysis", 
               description = "Returns detailed attendance patterns and reliability metrics")
    public ResponseEntity<GameHistoryAnalyticsService.AttendanceAnalysis> getAttendanceAnalysis(
            @RequestParam(defaultValue = "60") int days,
            Principal principal) {
        
        try {
            GameHistoryAnalyticsService.AttendanceAnalysis analysis = 
                historyService.getAttendanceAnalysis(principal.getName(), days);
            
            return ResponseEntity.ok(analysis);
            
        } catch (Exception e) {
            log.error("Error getting attendance analysis for user {}: {}", principal.getName(), e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get comprehensive performance profile.
     * GET /api/dashboard/performance/profile
     */
    @GetMapping("/performance/profile")
    @RateLimiter(name = "dashboard")
    @Operation(summary = "Get performance profile", 
               description = "Returns comprehensive performance tracking data and predictions")
    public ResponseEntity<PerformanceTrackingService.PerformanceProfile> getPerformanceProfile(
            Principal principal) {
        
        try {
            PerformanceTrackingService.PerformanceProfile profile = 
                performanceService.getPerformanceProfile(principal.getName());
            
            return ResponseEntity.ok(profile);
            
        } catch (Exception e) {
            log.error("Error getting performance profile for user {}: {}", principal.getName(), e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Record performance metrics after a game.
     * POST /api/dashboard/performance/record
     */
    @PostMapping("/performance/record")
    @RateLimiter(name = "dashboard")
    @Operation(summary = "Record game performance", 
               description = "Records performance metrics and updates user analytics")
    public ResponseEntity<PerformanceTrackingService.PerformanceUpdate> recordPerformance(
            @RequestParam Long gameId,
            @RequestBody PerformanceTrackingService.PerformanceMetrics metrics,
            Authentication authentication) {
        
        try {
            // Get user ID from authentication (simplified)
            String username = authentication.getName();
            Long userId = getUserIdFromUsername(username);
            
            PerformanceTrackingService.PerformanceUpdate update = 
                performanceService.recordGamePerformance(userId, gameId, metrics);
            
            log.info("Recorded performance for user {} in game {}: success={}", 
                    username, gameId, update.isSuccess());
            
            return ResponseEntity.ok(update);
            
        } catch (Exception e) {
            log.error("Error recording performance: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Set performance goals for the user.
     * POST /api/dashboard/performance/goals
     */
    @PostMapping("/performance/goals")
    @RateLimiter(name = "dashboard")
    @Operation(summary = "Set performance goals", 
               description = "Sets performance goals and targets for the user")
    public ResponseEntity<Map<String, String>> setPerformanceGoals(
            @RequestBody List<PerformanceTrackingService.PerformanceGoal> goals,
            Authentication authentication) {
        
        try {
            String username = authentication.getName();
            Long userId = getUserIdFromUsername(username);
            
            performanceService.setPerformanceGoals(userId, goals);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Performance goals set successfully",
                "goalCount", String.valueOf(goals.size())
            ));
            
        } catch (Exception e) {
            log.error("Error setting performance goals: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Get skill development recommendations.
     * GET /api/dashboard/performance/recommendations
     */
    @GetMapping("/performance/recommendations")
    @RateLimiter(name = "dashboard")
    @Operation(summary = "Get skill recommendations", 
               description = "Returns personalized skill development recommendations")
    public ResponseEntity<List<PerformanceTrackingService.SkillRecommendation>> getSkillRecommendations(
            Principal principal) {
        
        try {
            List<PerformanceTrackingService.SkillRecommendation> recommendations = 
                performanceService.getSkillRecommendations(principal.getName());
            
            return ResponseEntity.ok(recommendations);
            
        } catch (Exception e) {
            log.error("Error getting skill recommendations for user {}: {}", principal.getName(), e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get achievement analytics and progress.
     * GET /api/dashboard/achievements
     */
    @GetMapping("/achievements")
    @RateLimiter(name = "dashboard")
    @Operation(summary = "Get achievement analytics", 
               description = "Returns comprehensive achievement progress and analytics")
    public ResponseEntity<EnhancedAchievementService.AchievementAnalytics> getAchievementAnalytics(
            Principal principal) {
        
        try {
            EnhancedAchievementService.AchievementAnalytics analytics = 
                achievementService.getAchievementAnalytics(principal.getName());
            
            return ResponseEntity.ok(analytics);
            
        } catch (Exception e) {
            log.error("Error getting achievement analytics for user {}: {}", principal.getName(), e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get achievement leaderboard.
     * GET /api/dashboard/achievements/leaderboard
     */
    @GetMapping("/achievements/leaderboard")
    @RateLimiter(name = "dashboard")
    @Operation(summary = "Get achievement leaderboard", 
               description = "Returns achievement leaderboard and top performers")
    public ResponseEntity<EnhancedAchievementService.AchievementLeaderboard> getAchievementLeaderboard(
            @RequestParam(defaultValue = "10") int limit) {
        
        try {
            EnhancedAchievementService.AchievementLeaderboard leaderboard = 
                achievementService.getAchievementLeaderboard(limit);
            
            return ResponseEntity.ok(leaderboard);
            
        } catch (Exception e) {
            log.error("Error getting achievement leaderboard: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Trigger achievement check for the user.
     * POST /api/dashboard/achievements/check
     */
    @PostMapping("/achievements/check")
    @RateLimiter(name = "dashboard")
    @Operation(summary = "Check for new achievements", 
               description = "Manually triggers achievement progress check and updates")
    public ResponseEntity<Map<String, Object>> checkAchievements(
            @RequestParam(required = false) String triggerEvent,
            Authentication authentication) {
        
        try {
            String username = authentication.getName();
            Long userId = getUserIdFromUsername(username);
            
            List<com.bmessi.pickupsportsapp.entity.Achievement> newAchievements = 
                achievementService.checkAndUpdateAchievements(userId, triggerEvent, Map.of());
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "newAchievements", newAchievements.size(),
                "achievements", newAchievements.stream()
                    .map(a -> Map.of(
                        "id", a.getId(),
                        "name", a.getName(),
                        "points", a.getBasePoints()
                    ))
                    .collect(java.util.stream.Collectors.toList())
            ));
            
        } catch (Exception e) {
            log.error("Error checking achievements for user {}: {}", authentication.getName(), e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Get personalized dashboard insights and recommendations.
     * GET /api/dashboard/insights
     */
    @GetMapping("/insights")
    @RateLimiter(name = "dashboard")
    @Operation(summary = "Get dashboard insights", 
               description = "Returns personalized insights and recommendations")
    public ResponseEntity<DashboardInsights> getDashboardInsights(Principal principal) {
        
        try {
            // Combine insights from multiple services
            UserDashboardService.DashboardSummary dashboard = 
                dashboardService.getUserDashboard(principal.getName());
            
            PerformanceTrackingService.PerformanceProfile performance = 
                performanceService.getPerformanceProfile(principal.getName());
            
            DashboardInsights insights = DashboardInsights.builder()
                    .keyStats(extractKeyStats(dashboard))
                    .recommendations(dashboard.getRecommendations())
                    .performanceInsights(extractPerformanceInsights(performance))
                    .achievementSuggestions(performance.getImprovementRecommendations())
                    .nextMilestones(extractNextMilestones(performance))
                    .socialHighlights(extractSocialHighlights(dashboard))
                    .build();
            
            return ResponseEntity.ok(insights);
            
        } catch (Exception e) {
            log.error("Error getting dashboard insights for user {}: {}", principal.getName(), e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get real-time dashboard metrics.
     * GET /api/dashboard/live-metrics
     */
    @GetMapping("/live-metrics")
    @RateLimiter(name = "dashboard")
    @Operation(summary = "Get live dashboard metrics", 
               description = "Returns real-time metrics and live updates for dashboard")
    public ResponseEntity<LiveDashboardMetrics> getLiveMetrics(Principal principal) {
        
        try {
            // This would integrate with our real-time system to provide live data
            LiveDashboardMetrics metrics = LiveDashboardMetrics.builder()
                    .username(principal.getName())
                    .isOnline(true) // Would check actual presence
                    .activeGames(0) // Would get from real-time service
                    .recentNotifications(List.of()) // Would get recent notifications
                    .liveActivityFeed(List.of()) // Would get from activity feed service
                    .lastUpdated(java.time.Instant.now())
                    .build();
            
            return ResponseEntity.ok(metrics);
            
        } catch (Exception e) {
            log.error("Error getting live metrics for user {}: {}", principal.getName(), e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Export user dashboard data.
     * GET /api/dashboard/export
     */
    @GetMapping("/export")
    @RateLimiter(name = "dashboard-export")
    @Operation(summary = "Export dashboard data", 
               description = "Exports comprehensive user data for backup or analysis")
    public ResponseEntity<DashboardExport> exportDashboardData(
            @RequestParam(defaultValue = "json") String format,
            Principal principal) {
        
        try {
            // Get all user data
            UserDashboardService.DashboardSummary dashboard = 
                dashboardService.getUserDashboard(principal.getName());
            
            GameHistoryAnalyticsService.GameHistoryAnalytics analytics = 
                historyService.getGameHistoryAnalytics(principal.getName(), 365);
            
            PerformanceTrackingService.PerformanceProfile performance = 
                performanceService.getPerformanceProfile(principal.getName());
            
            DashboardExport export = DashboardExport.builder()
                    .username(principal.getName())
                    .exportFormat(format)
                    .exportTimestamp(java.time.Instant.now())
                    .dashboardSummary(dashboard)
                    .historyAnalytics(analytics)
                    .performanceProfile(performance)
                    .build();
            
            log.info("Exported dashboard data for user: {} (format: {})", principal.getName(), format);
            return ResponseEntity.ok(export);
            
        } catch (Exception e) {
            log.error("Error exporting dashboard data for user {}: {}", principal.getName(), e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Helper methods

    private Long getUserIdFromUsername(String username) {
        // This would typically query the user repository
        // For now, return a placeholder
        return 1L; // Placeholder - would implement proper lookup
    }

    private Map<String, Object> extractKeyStats(UserDashboardService.DashboardSummary dashboard) {
        return Map.of(
            "totalGames", dashboard.getStatistics().getTotalGamesPlayed(),
            "winRate", dashboard.getStatistics().getWinRate(),
            "currentStreak", dashboard.getStatistics().getCurrentStreak(),
            "achievementPoints", dashboard.getAchievements().getTotalPoints()
        );
    }

    private List<String> extractPerformanceInsights(PerformanceTrackingService.PerformanceProfile performance) {
        List<String> insights = new ArrayList<>();
        
        if (performance.getOverallPerformance().getTrend().equals("IMPROVING")) {
            insights.add("Your performance is trending upward! Keep up the great work.");
        }
        
        if (performance.getOverallPerformance().getConsistencyScore() > 80) {
            insights.add("You're very consistent in your performance across games.");
        }
        
        return insights;
    }

    private List<String> extractNextMilestones(PerformanceTrackingService.PerformanceProfile performance) {
        return performance.getMilestoneProgress().getMilestones().stream()
                .filter(m -> !m.isCompleted() && m.getProgress() > 50)
                .map(PerformanceTrackingService.PerformanceMilestone::getTitle)
                .limit(3)
                .collect(java.util.stream.Collectors.toList());
    }

    private List<String> extractSocialHighlights(UserDashboardService.DashboardSummary dashboard) {
        List<String> highlights = new ArrayList<>();
        
        if (dashboard.getSocialInsights().getNewConnectionsMade() > 0) {
            highlights.add("Made " + dashboard.getSocialInsights().getNewConnectionsMade() + 
                          " new connections recently");
        }
        
        if (dashboard.getSocialInsights().getAverageTeamChemistry() > 4.0) {
            highlights.add("Excellent team chemistry with an average of " + 
                          String.format("%.1f", dashboard.getSocialInsights().getAverageTeamChemistry()));
        }
        
        return highlights;
    }

    // Data Transfer Objects

    @lombok.Data
    @lombok.Builder
    public static class DashboardInsights {
        private Map<String, Object> keyStats;
        private List<UserDashboardService.DashboardRecommendation> recommendations;
        private List<String> performanceInsights;
        private List<PerformanceTrackingService.SkillRecommendation> achievementSuggestions;
        private List<String> nextMilestones;
        private List<String> socialHighlights;
    }

    @lombok.Data
    @lombok.Builder
    public static class LiveDashboardMetrics {
        private String username;
        private boolean isOnline;
        private int activeGames;
        private List<Object> recentNotifications;
        private List<Object> liveActivityFeed;
        private java.time.Instant lastUpdated;
    }

    @lombok.Data
    @lombok.Builder
    public static class DashboardExport {
        private String username;
        private String exportFormat;
        private java.time.Instant exportTimestamp;
        private UserDashboardService.DashboardSummary dashboardSummary;
        private GameHistoryAnalyticsService.GameHistoryAnalytics historyAnalytics;
        private PerformanceTrackingService.PerformanceProfile performanceProfile;
    }
}
