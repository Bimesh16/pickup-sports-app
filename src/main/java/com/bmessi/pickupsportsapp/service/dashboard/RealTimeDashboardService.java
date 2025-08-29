package com.bmessi.pickupsportsapp.service.dashboard;

import com.bmessi.pickupsportsapp.realtime.service.RealTimeEventService;
import com.bmessi.pickupsportsapp.realtime.service.EnhancedPresenceService;
import com.bmessi.pickupsportsapp.realtime.service.RealTimeActivityFeedService;
import com.bmessi.pickupsportsapp.realtime.event.NotificationEvent;
import com.bmessi.pickupsportsapp.realtime.event.ActivityFeedEvent;
import com.bmessi.pickupsportsapp.service.UserStatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for providing real-time dashboard updates and live user experience.
 * 
 * Integrates with the real-time event system to provide:
 * - Live dashboard metrics
 * - Real-time achievement notifications
 * - Live performance updates
 * - Activity feed integration
 * - Presence-aware features
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RealTimeDashboardService {

    private final RealTimeEventService realTimeEventService;
    private final EnhancedPresenceService presenceService;
    private final RealTimeActivityFeedService activityFeedService;
    private final UserStatsService userStatsService;
    private final UserDashboardService dashboardService;
    private final EnhancedAchievementService achievementService;

    // Cache for live dashboard data
    private final Map<String, LiveDashboardData> dashboardCache = new ConcurrentHashMap<>();
    private final Map<String, Instant> cacheExpiry = new ConcurrentHashMap<>();
    
    private static final long CACHE_TTL_SECONDS = 30; // 30 seconds cache

    /**
     * Get live dashboard data with real-time updates.
     */
    public LiveDashboardData getLiveDashboardData(String username) {
        try {
            // Check cache first
            LiveDashboardData cached = dashboardCache.get(username);
            Instant expiry = cacheExpiry.get(username);
            
            if (cached != null && expiry != null && Instant.now().isBefore(expiry)) {
                return cached;
            }

            // Build live data
            LiveDashboardData liveData = buildLiveDashboardData(username);
            
            // Cache the result
            dashboardCache.put(username, liveData);
            cacheExpiry.put(username, Instant.now().plusSeconds(CACHE_TTL_SECONDS));
            
            return liveData;
            
        } catch (Exception e) {
            log.error("Error getting live dashboard data for user {}: {}", username, e.getMessage());
            return LiveDashboardData.builder()
                    .username(username)
                    .isOnline(false)
                    .error("Unable to load live data")
                    .build();
        }
    }

    /**
     * Send real-time dashboard update to a user.
     */
    public void sendDashboardUpdate(String username, DashboardUpdateType updateType, 
                                  Map<String, Object> updateData) {
        try {
            DashboardUpdateEvent updateEvent = DashboardUpdateEvent.builder()
                    .username(username)
                    .updateType(updateType)
                    .updateData(updateData)
                    .timestamp(Instant.now())
                    .build();

            NotificationEvent notification = new NotificationEvent(
                username,
                "Dashboard Updated",
                "Your " + updateType.getDisplayName() + " has been updated",
                "DASHBOARD_UPDATE",
                "/dashboard"
            );

            realTimeEventService.publishEvent(notification);
            
            // Clear cache to force refresh
            dashboardCache.remove(username);
            cacheExpiry.remove(username);
            
            log.debug("Sent dashboard update to user {}: {}", username, updateType);
            
        } catch (Exception e) {
            log.error("Error sending dashboard update to user {}: {}", username, e.getMessage());
        }
    }

    /**
     * Broadcast achievement progress update.
     */
    public void broadcastAchievementProgress(String username, String achievementName, 
                                           double progressPercentage) {
        try {
            Map<String, Object> updateData = Map.of(
                "achievementName", achievementName,
                "progress", progressPercentage,
                "isNewMilestone", progressPercentage % 25 == 0 // Every 25%
            );
            
            sendDashboardUpdate(username, DashboardUpdateType.ACHIEVEMENT_PROGRESS, updateData);
            
        } catch (Exception e) {
            log.error("Error broadcasting achievement progress: {}", e.getMessage());
        }
    }

    /**
     * Broadcast performance metric update.
     */
    public void broadcastPerformanceUpdate(String username, String sport, double newRating, 
                                         double improvement) {
        try {
            Map<String, Object> updateData = Map.of(
                "sport", sport,
                "newRating", newRating,
                "improvement", improvement,
                "isSignificant", Math.abs(improvement) > 0.2
            );
            
            sendDashboardUpdate(username, DashboardUpdateType.PERFORMANCE_UPDATE, updateData);
            
        } catch (Exception e) {
            log.error("Error broadcasting performance update: {}", e.getMessage());
        }
    }

    /**
     * Broadcast new personal record or milestone.
     */
    public void broadcastPersonalRecord(String username, String recordType, Object oldValue, 
                                      Object newValue) {
        try {
            Map<String, Object> updateData = Map.of(
                "recordType", recordType,
                "oldValue", oldValue,
                "newValue", newValue,
                "improvement", calculateImprovement(oldValue, newValue)
            );
            
            sendDashboardUpdate(username, DashboardUpdateType.PERSONAL_RECORD, updateData);
            
            // Also create activity feed entry
            ActivityFeedEvent activityEvent = new ActivityFeedEvent(
                username,
                "ACHIEVED_PERSONAL_RECORD",
                "USER",
                null,
                username + " achieved a new personal record in " + recordType
            );
            
            realTimeEventService.publishEvent(activityEvent);
            
        } catch (Exception e) {
            log.error("Error broadcasting personal record: {}", e.getMessage());
        }
    }

    /**
     * Get real-time dashboard metrics for admin monitoring.
     */
    public DashboardSystemMetrics getDashboardSystemMetrics() {
        try {
            Map<String, Object> eventMetrics = realTimeEventService.getMetrics();
            Map<String, Object> presenceMetrics = presenceService.getPresenceMetrics();
            
            return DashboardSystemMetrics.builder()
                    .activeDashboardUsers(dashboardCache.size())
                    .cacheHitRate(calculateCacheHitRate())
                    .averageUpdateLatency(calculateAverageUpdateLatency())
                    .totalDashboardUpdates(getTotalDashboardUpdates())
                    .onlineUsers(presenceService.getOnlineUserCount())
                    .systemHealth(calculateDashboardSystemHealth())
                    .lastUpdated(Instant.now())
                    .build();
                    
        } catch (Exception e) {
            log.error("Error getting dashboard system metrics: {}", e.getMessage());
            return DashboardSystemMetrics.builder()
                    .systemHealth("ERROR")
                    .error(e.getMessage())
                    .build();
        }
    }

    /**
     * Perform maintenance on dashboard cache and data.
     */
    public void performMaintenance() {
        try {
            Instant now = Instant.now();
            
            // Clean expired cache entries
            cacheExpiry.entrySet().removeIf(entry -> {
                if (now.isAfter(entry.getValue())) {
                    dashboardCache.remove(entry.getKey());
                    return true;
                }
                return false;
            });
            
            log.debug("Performed dashboard cache maintenance, removed {} expired entries", 
                     dashboardCache.size());
                     
        } catch (Exception e) {
            log.error("Error during dashboard maintenance: {}", e.getMessage());
        }
    }

    // Private helper methods

    private LiveDashboardData buildLiveDashboardData(String username) {
        try {
            // Get basic dashboard data
            UserDashboardService.DashboardSummary dashboard = 
                dashboardService.getUserDashboard(username);

            // Get real-time presence information
            boolean isOnline = presenceService.isUserOnline(username);
            
            // Get recent activity feed
            List<RealTimeActivityFeedService.ActivityItem> recentActivity = 
                activityFeedService.getUserActivityFeed(username, 5, 
                    Instant.now().minus(24, ChronoUnit.HOURS));

            // Get live metrics
            LiveMetrics metrics = LiveMetrics.builder()
                    .currentOnlineUsers((int) presenceService.getOnlineUserCount())
                    .activeGames(getActiveGameCount(username))
                    .recentAchievements(getRecentAchievementCount(username))
                    .liveNotifications(getLiveNotificationCount(username))
                    .build();

            return LiveDashboardData.builder()
                    .username(username)
                    .isOnline(isOnline)
                    .dashboardSummary(dashboard)
                    .recentActivity(recentActivity)
                    .liveMetrics(metrics)
                    .lastUpdated(Instant.now())
                    .build();
                    
        } catch (Exception e) {
            log.error("Error building live dashboard data for {}: {}", username, e.getMessage());
            throw e;
        }
    }

    private int getActiveGameCount(String username) {
        // This would query for games the user is currently participating in
        return 0; // Placeholder
    }

    private int getRecentAchievementCount(String username) {
        // This would count achievements earned in the last 24 hours
        return 0; // Placeholder
    }

    private int getLiveNotificationCount(String username) {
        // This would count unread notifications
        return 0; // Placeholder
    }

    private double calculateCacheHitRate() {
        // Calculate cache hit rate for monitoring
        return 0.85; // Placeholder
    }

    private double calculateAverageUpdateLatency() {
        // Calculate average time to deliver dashboard updates
        return 50.0; // Placeholder - 50ms
    }

    private long getTotalDashboardUpdates() {
        // Count total dashboard updates sent
        return 0L; // Placeholder
    }

    private String calculateDashboardSystemHealth() {
        // Calculate overall dashboard system health
        return "HEALTHY"; // Placeholder
    }

    private double calculateImprovement(Object oldValue, Object newValue) {
        try {
            if (oldValue instanceof Number && newValue instanceof Number) {
                double old = ((Number) oldValue).doubleValue();
                double new_ = ((Number) newValue).doubleValue();
                return new_ - old;
            }
        } catch (Exception e) {
            log.warn("Error calculating improvement: {}", e.getMessage());
        }
        return 0.0;
    }

    // Data Transfer Objects

    @lombok.Data
    @lombok.Builder
    public static class LiveDashboardData {
        private String username;
        private boolean isOnline;
        private UserDashboardService.DashboardSummary dashboardSummary;
        private List<RealTimeActivityFeedService.ActivityItem> recentActivity;
        private LiveMetrics liveMetrics;
        private String error;
        private Instant lastUpdated;
    }

    @lombok.Data
    @lombok.Builder
    public static class LiveMetrics {
        private int currentOnlineUsers;
        private int activeGames;
        private int recentAchievements;
        private int liveNotifications;
    }

    @lombok.Data
    @lombok.Builder
    public static class DashboardUpdateEvent {
        private String username;
        private DashboardUpdateType updateType;
        private Map<String, Object> updateData;
        private Instant timestamp;
    }

    public enum DashboardUpdateType {
        STATS_UPDATE("statistics"),
        ACHIEVEMENT_PROGRESS("achievement progress"),
        PERFORMANCE_UPDATE("performance"),
        PERSONAL_RECORD("personal record"),
        SOCIAL_UPDATE("social activity"),
        GAME_ACTIVITY("game activity");
        
        private final String displayName;
        
        DashboardUpdateType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }

    @lombok.Data
    @lombok.Builder
    public static class DashboardSystemMetrics {
        private int activeDashboardUsers;
        private double cacheHitRate;
        private double averageUpdateLatency;
        private long totalDashboardUpdates;
        private long onlineUsers;
        private String systemHealth;
        private String error;
        private Instant lastUpdated;
    }
}
