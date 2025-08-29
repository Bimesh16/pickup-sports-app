package com.bmessi.pickupsportsapp.entity.analytics;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Business intelligence entity for tracking business metrics and KPIs.
 */
// Temporarily disabled - missing migration
// @Entity
// @Table(name = "business_intelligence")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessIntelligence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "metric_name", nullable = false, length = 100)
    private String metricName; // e.g., "revenue", "user_growth", "retention_rate", "conversion_rate"

    @Column(name = "metric_category", length = 100)
    private String metricCategory; // e.g., "financial", "user_metrics", "engagement", "operational", "marketing"

    @Column(name = "metric_type", nullable = false, length = 50)
    private String metricType; // e.g., "gauge", "counter", "ratio", "percentage", "currency"

    @Column(name = "metric_value", nullable = false, precision = 15, scale = 6)
    private BigDecimal metricValue;

    @Column(name = "metric_unit", length = 20)
    private String metricUnit; // e.g., "users", "percentage", "dollars", "games", "bookings"

    @Column(name = "previous_value", precision = 15, scale = 6)
    private BigDecimal previousValue; // Value from previous period

    @Column(name = "change_amount", precision = 15, scale = 6)
    private BigDecimal changeAmount; // Absolute change from previous period

    @Column(name = "change_percentage", precision = 8, scale = 4)
    private BigDecimal changePercentage; // Percentage change from previous period

    @Column(name = "target_value", precision = 15, scale = 6)
    private BigDecimal targetValue; // Target/goal for this metric

    @Column(name = "target_achievement_percentage", precision = 8, scale = 4)
    private BigDecimal targetAchievementPercentage; // How close to target

    @Column(name = "period_type", length = 20)
    private String periodType; // daily, weekly, monthly, quarterly, yearly

    @Column(name = "period_start", nullable = false)
    private OffsetDateTime periodStart;

    @Column(name = "period_end", nullable = false)
    private OffsetDateTime periodEnd;

    @Column(name = "year")
    private Integer year;

    @Column(name = "month")
    private Integer month; // 1-12

    @Column(name = "week")
    private Integer week; // 1-53

    @Column(name = "day_of_year")
    private Integer dayOfYear; // 1-366

    @Column(name = "day_of_week")
    private Integer dayOfWeek; // 1-7 (Monday=1)

    @Column(name = "hour")
    private Integer hour; // 0-23

    // Financial metrics
    @Column(name = "revenue", precision = 15, scale = 2)
    private BigDecimal revenue;

    @Column(name = "cost", precision = 15, scale = 2)
    private BigDecimal cost;

    @Column(name = "profit", precision = 15, scale = 2)
    private BigDecimal profit;

    @Column(name = "profit_margin", precision = 8, scale = 4)
    private BigDecimal profitMargin; // Percentage

    @Column(name = "average_order_value", precision = 10, scale = 2)
    private BigDecimal averageOrderValue;

    @Column(name = "customer_lifetime_value", precision = 10, scale = 2)
    private BigDecimal customerLifetimeValue;

    @Column(name = "customer_acquisition_cost", precision = 10, scale = 2)
    private BigDecimal customerAcquisitionCost;

    @Column(name = "return_on_investment", precision = 8, scale = 4)
    private BigDecimal returnOnInvestment; // Percentage

    // User metrics
    @Column(name = "total_users")
    private Long totalUsers;

    @Column(name = "active_users")
    private Long activeUsers;

    @Column(name = "new_users")
    private Long newUsers;

    @Column(name = "returning_users")
    private Long returningUsers;

    @Column(name = "churned_users")
    private Long churnedUsers;

    @Column(name = "user_growth_rate", precision = 8, scale = 4)
    private BigDecimal userGrowthRate; // Percentage

    @Column(name = "retention_rate", precision = 8, scale = 4)
    private BigDecimal retentionRate; // Percentage

    @Column(name = "churn_rate", precision = 8, scale = 4)
    private BigDecimal churnRate; // Percentage

    @Column(name = "engagement_rate", precision = 8, scale = 4)
    private BigDecimal engagementRate; // Percentage

    @Column(name = "session_duration_minutes")
    private Integer sessionDurationMinutes;

    @Column(name = "sessions_per_user")
    private BigDecimal sessionsPerUser;

    @Column(name = "page_views_per_session")
    private BigDecimal pageViewsPerSession;

    // Game and venue metrics
    @Column(name = "total_games")
    private Long totalGames;

    @Column(name = "active_games")
    private Long activeGames;

    @Column(name = "completed_games")
    private Long completedGames;

    @Column(name = "cancelled_games")
    private Long cancelledGames;

    @Column(name = "game_creation_rate", precision = 8, scale = 4)
    private BigDecimal gameCreationRate; // Games per day/week/month

    @Column(name = "game_completion_rate", precision = 8, scale = 4)
    private BigDecimal gameCompletionRate; // Percentage

    @Column(name = "total_venues")
    private Long totalVenues;

    @Column(name = "active_venues")
    private Long activeVenues;

    @Column(name = "venue_utilization_rate", precision = 8, scale = 4)
    private BigDecimal venueUtilizationRate; // Percentage

    @Column(name = "total_bookings")
    private Long totalBookings;

    @Column(name = "confirmed_bookings")
    private Long confirmedBookings;

    @Column(name = "cancelled_bookings")
    private Long cancelledBookings;

    @Column(name = "booking_confirmation_rate", precision = 8, scale = 4)
    private BigDecimal bookingConfirmationRate; // Percentage

    // Tournament metrics
    @Column(name = "total_tournaments")
    private Long totalTournaments;

    @Column(name = "active_tournaments")
    private Long activeTournaments;

    @Column(name = "completed_tournaments")
    private Long completedTournaments;

    @Column(name = "tournament_participation_rate", precision = 8, scale = 4)
    private BigDecimal tournamentParticipationRate; // Percentage

    @Column(name = "average_tournament_size")
    private BigDecimal averageTournamentSize; // Teams per tournament

    // Equipment metrics
    @Column(name = "total_equipment")
    private Long totalEquipment;

    @Column(name = "available_equipment")
    private Long availableEquipment;

    @Column(name = "rented_equipment")
    private Long rentedEquipment;

    @Column(name = "equipment_utilization_rate", precision = 8, scale = 4)
    private BigDecimal equipmentUtilizationRate; // Percentage

    @Column(name = "equipment_revenue", precision = 15, scale = 2)
    private BigDecimal equipmentRevenue;

    // Geographic metrics
    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    // Sport-specific metrics
    @Column(name = "sport", length = 50)
    private String sport;

    @Column(name = "sport_popularity_rank")
    private Integer sportPopularityRank;

    @Column(name = "sport_participation_rate", precision = 8, scale = 4)
    private BigDecimal sportParticipationRate; // Percentage

    // Marketing metrics
    @Column(name = "marketing_spend", precision = 15, scale = 2)
    private BigDecimal marketingSpend;

    @Column(name = "marketing_roi", precision = 8, scale = 4)
    private BigDecimal marketingRoi; // Return on marketing investment

    @Column(name = "customer_acquisition_rate", precision = 8, scale = 4)
    private BigDecimal customerAcquisitionRate; // New users per marketing dollar

    @Column(name = "referral_rate", precision = 8, scale = 4)
    private BigDecimal referralRate; // Percentage of users from referrals

    // Operational metrics
    @Column(name = "system_uptime_percentage", precision = 8, scale = 4)
    private BigDecimal systemUptimePercentage;

    @Column(name = "average_response_time_ms")
    private Long averageResponseTimeMs;

    @Column(name = "error_rate", precision = 8, scale = 4)
    private BigDecimal errorRate; // Percentage

    @Column(name = "support_tickets")
    private Long supportTickets;

    @Column(name = "resolved_tickets")
    private Long resolvedTickets;

    @Column(name = "average_resolution_time_hours")
    private BigDecimal averageResolutionTimeHours;

    // Predictive metrics
    @Column(name = "predicted_revenue", precision = 15, scale = 2)
    private BigDecimal predictedRevenue;

    @Column(name = "predicted_users", precision = 15, scale = 0)
    private BigDecimal predictedUsers;

    @Column(name = "prediction_confidence", precision = 5, scale = 4)
    private BigDecimal predictionConfidence; // 0.0000 to 1.0000

    @Column(name = "trend_direction", length = 20)
    private String trendDirection; // increasing, decreasing, stable

    @Column(name = "seasonality_factor", precision = 8, scale = 4)
    private BigDecimal seasonalityFactor; // Multiplier for seasonal effects

    @Column(name = "forecast_horizon_days")
    private Integer forecastHorizonDays; // How many days ahead this prediction is

    @Column(name = "data_quality_score", precision = 5, scale = 4)
    private BigDecimal dataQualityScore; // 0.0000 to 1.0000

    @Column(name = "last_updated")
    private OffsetDateTime lastUpdated;

    @Column(name = "update_frequency_hours")
    private Integer updateFrequencyHours; // How often this metric is updated

    @Column(name = "data_source", length = 100)
    private String dataSource; // Where this data comes from

    @Column(name = "calculation_method", length = 200)
    private String calculationMethod; // How this metric is calculated

    @Column(name = "notes", length = 1000)
    private String notes; // Additional context or explanations

    @Column(name = "tags", length = 500)
    private String tags; // Comma-separated tags for categorization

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Common metric names
    public static final String REVENUE = "revenue";
    public static final String USER_GROWTH = "user_growth";
    public static final String RETENTION_RATE = "retention_rate";
    public static final String CONVERSION_RATE = "conversion_rate";
    public static final String CUSTOMER_LIFETIME_VALUE = "customer_lifetime_value";
    public static final String CUSTOMER_ACQUISITION_COST = "customer_acquisition_cost";
    public static final String RETURN_ON_INVESTMENT = "return_on_investment";
    public static final String ENGAGEMENT_RATE = "engagement_rate";
    public static final String CHURN_RATE = "churn_rate";
    public static final String VENUE_UTILIZATION = "venue_utilization";
    public static final String EQUIPMENT_UTILIZATION = "equipment_utilization";
    public static final String GAME_COMPLETION_RATE = "game_completion_rate";
    public static final String TOURNAMENT_PARTICIPATION = "tournament_participation";
}
