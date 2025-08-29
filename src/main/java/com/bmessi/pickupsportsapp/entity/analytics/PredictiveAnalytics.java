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
 * Predictive analytics entity for machine learning predictions and forecasting.
 */
// Temporarily disabled - missing migration
// @Entity
// @Table(name = "predictive_analytics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictiveAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "prediction_type", nullable = false, length = 100)
    private String predictionType; // e.g., "user_churn", "revenue_forecast", "demand_prediction", "equipment_failure"

    @Column(name = "prediction_category", length = 100)
    private String predictionCategory; // e.g., "user_behavior", "business_metrics", "operational", "financial", "marketing"

    @Column(name = "model_name", nullable = false, length = 100)
    private String modelName; // e.g., "random_forest", "neural_network", "linear_regression", "time_series"

    @Column(name = "model_version", length = 50)
    private String modelVersion; // e.g., "1.0.0", "2.1.3"

    @Column(name = "model_accuracy", precision = 5, scale = 4)
    private BigDecimal modelAccuracy; // 0.0000 to 1.0000

    @Column(name = "model_precision", precision = 5, scale = 4)
    private BigDecimal modelPrecision; // 0.0000 to 1.0000

    @Column(name = "model_recall", precision = 5, scale = 4)
    private BigDecimal modelRecall; // 0.0000 to 1.0000

    @Column(name = "model_f1_score", precision = 5, scale = 4)
    private BigDecimal modelF1Score; // 0.0000 to 1.0000

    @Column(name = "model_auc", precision = 5, scale = 4)
    private BigDecimal modelAuc; // Area Under Curve, 0.0000 to 1.0000

    @Column(name = "prediction_horizon_days")
    private Integer predictionHorizonDays; // How many days ahead this prediction is

    @Column(name = "prediction_confidence", precision = 5, scale = 4)
    private BigDecimal predictionConfidence; // 0.0000 to 1.0000

    @Column(name = "prediction_interval_lower", precision = 15, scale = 6)
    private BigDecimal predictionIntervalLower; // Lower bound of confidence interval

    @Column(name = "prediction_interval_upper", precision = 15, scale = 6)
    private BigDecimal predictionIntervalUpper; // Upper bound of confidence interval

    @Column(name = "predicted_value", nullable = false, precision = 15, scale = 6)
    private BigDecimal predictedValue;

    @Column(name = "actual_value", precision = 15, scale = 6)
    private BigDecimal actualValue; // Actual value when it becomes available

    @Column(name = "prediction_error", precision = 15, scale = 6)
    private BigDecimal predictionError; // Difference between predicted and actual

    @Column(name = "prediction_error_percentage", precision = 8, scale = 4)
    private BigDecimal predictionErrorPercentage; // Error as percentage of actual value

    @Column(name = "prediction_timestamp", nullable = false)
    private OffsetDateTime predictionTimestamp; // When the prediction was made

    @Column(name = "actual_timestamp")
    private OffsetDateTime actualTimestamp; // When the actual value was recorded

    @Column(name = "target_entity_type", length = 100)
    private String targetEntityType; // e.g., "user", "game", "venue", "tournament", "equipment"

    @Column(name = "target_entity_id")
    private Long targetEntityId; // ID of the specific entity being predicted

    @Column(name = "target_entity_attributes", columnDefinition = "TEXT")
    private String targetEntityAttributes; // JSON string of entity attributes used for prediction

    // User behavior predictions
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "churn_probability", precision = 5, scale = 4)
    private BigDecimal churnProbability; // 0.0000 to 1.0000

    @Column(name = "engagement_score", precision = 5, scale = 4)
    private BigDecimal engagementScore; // 0.0000 to 1.0000

    @Column(name = "lifetime_value_prediction", precision = 10, scale = 2)
    private BigDecimal lifetimeValuePrediction;

    @Column(name = "next_purchase_probability", precision = 5, scale = 4)
    private BigDecimal nextPurchaseProbability; // 0.0000 to 1.0000

    @Column(name = "preferred_sport", length = 50)
    private String preferredSport;

    @Column(name = "activity_frequency_prediction")
    private Integer activityFrequencyPrediction; // Games per month

    @Column(name = "social_influence_score", precision = 5, scale = 4)
    private BigDecimal socialInfluenceScore; // 0.0000 to 1.0000

    // Business metric predictions
    @Column(name = "revenue_prediction", precision = 15, scale = 2)
    private BigDecimal revenuePrediction;

    @Column(name = "user_growth_prediction")
    private Long userGrowthPrediction;

    @Column(name = "conversion_rate_prediction", precision = 8, scale = 4)
    private BigDecimal conversionRatePrediction; // Percentage

    @Column(name = "retention_rate_prediction", precision = 8, scale = 4)
    private BigDecimal retentionRatePrediction; // Percentage

    @Column(name = "customer_acquisition_cost_prediction", precision = 10, scale = 2)
    private BigDecimal customerAcquisitionCostPrediction;

    @Column(name = "market_share_prediction", precision = 8, scale = 4)
    private BigDecimal marketSharePrediction; // Percentage

    // Operational predictions
    @Column(name = "venue_utilization_prediction", precision = 8, scale = 4)
    private BigDecimal venueUtilizationPrediction; // Percentage

    @Column(name = "equipment_demand_prediction")
    private Long equipmentDemandPrediction;

    @Column(name = "maintenance_schedule_prediction")
    private OffsetDateTime maintenanceSchedulePrediction;

    @Column(name = "equipment_failure_probability", precision = 5, scale = 4)
    private BigDecimal equipmentFailureProbability; // 0.0000 to 1.0000

    @Column(name = "peak_usage_time_prediction")
    private OffsetDateTime peakUsageTimePrediction;

    @Column(name = "capacity_requirement_prediction")
    private Long capacityRequirementPrediction;

    // Game and tournament predictions
    @Column(name = "game_attendance_prediction")
    private Long gameAttendancePrediction;

    @Column(name = "tournament_participation_prediction")
    private Long tournamentParticipationPrediction;

    @Column(name = "game_cancellation_probability", precision = 5, scale = 4)
    private BigDecimal gameCancellationProbability; // 0.0000 to 1.0000

    @Column(name = "weather_impact_prediction", precision = 5, scale = 4)
    private BigDecimal weatherImpactPrediction; // 0.0000 to 1.0000

    @Column(name = "optimal_game_time_prediction")
    private OffsetDateTime optimalGameTimePrediction;

    @Column(name = "optimal_venue_prediction")
    private Long optimalVenuePrediction;

    // Marketing predictions
    @Column(name = "campaign_effectiveness_prediction", precision = 5, scale = 4)
    private BigDecimal campaignEffectivenessPrediction; // 0.0000 to 1.0000

    @Column(name = "customer_segment_prediction", length = 100)
    private String customerSegmentPrediction; // e.g., "high_value", "at_risk", "new_user"

    @Column(name = "personalization_score", precision = 5, scale = 4)
    private BigDecimal personalizationScore; // 0.0000 to 1.0000

    @Column(name = "recommendation_click_probability", precision = 5, scale = 4)
    private BigDecimal recommendationClickProbability; // 0.0000 to 1.0000

    @Column(name = "ad_conversion_probability", precision = 5, scale = 4)
    private BigDecimal adConversionProbability; // 0.0000 to 1.0000

    // Feature importance and model insights
    @Column(name = "feature_importance", columnDefinition = "TEXT")
    private String featureImportance; // JSON string of feature importance scores

    @Column(name = "model_insights", columnDefinition = "TEXT")
    private String modelInsights; // JSON string of model insights and explanations

    @Column(name = "data_drift_score", precision = 5, scale = 4)
    private BigDecimal dataDriftScore; // 0.0000 to 1.0000, measures data drift

    @Column(name = "model_drift_score", precision = 5, scale = 4)
    private BigDecimal modelDriftScore; // 0.0000 to 1.0000, measures model performance drift

    @Column(name = "retraining_recommendation", length = 100)
    private String retrainingRecommendation; // e.g., "immediate", "soon", "not_needed"

    @Column(name = "next_retraining_date")
    private OffsetDateTime nextRetrainingDate;

    // Model metadata
    @Column(name = "training_data_size")
    private Long trainingDataSize; // Number of samples used for training

    @Column(name = "training_duration_minutes")
    private Integer trainingDurationMinutes;

    @Column(name = "last_training_date")
    private OffsetDateTime lastTrainingDate;

    @Column(name = "hyperparameters", columnDefinition = "TEXT")
    private String hyperparameters; // JSON string of model hyperparameters

    @Column(name = "feature_engineering_steps", columnDefinition = "TEXT")
    private String featureEngineeringSteps; // JSON string of feature engineering steps

    @Column(name = "data_preprocessing_steps", columnDefinition = "TEXT")
    private String dataPreprocessingSteps; // JSON string of data preprocessing steps

    // Validation and testing
    @Column(name = "cross_validation_score", precision = 5, scale = 4)
    private BigDecimal crossValidationScore; // 0.0000 to 1.0000

    @Column(name = "test_set_score", precision = 5, scale = 4)
    private BigDecimal testSetScore; // 0.0000 to 1.0000

    @Column(name = "holdout_set_score", precision = 5, scale = 4)
    private BigDecimal holdoutSetScore; // 0.0000 to 1.0000

    @Column(name = "backtesting_score", precision = 5, scale = 4)
    private BigDecimal backtestingScore; // 0.0000 to 1.0000

    @Column(name = "out_of_sample_score", precision = 5, scale = 4)
    private BigDecimal outOfSampleScore; // 0.0000 to 1.0000

    // Business impact
    @Column(name = "business_impact_score", precision = 5, scale = 4)
    private BigDecimal businessImpactScore; // 0.0000 to 1.0000

    @Column(name = "roi_prediction", precision = 8, scale = 4)
    private BigDecimal roiPrediction; // Return on investment percentage

    @Column(name = "cost_savings_prediction", precision = 15, scale = 2)
    private BigDecimal costSavingsPrediction;

    @Column(name = "revenue_increase_prediction", precision = 15, scale = 2)
    private BigDecimal revenueIncreasePrediction;

    @Column(name = "risk_assessment", length = 100)
    private String riskAssessment; // e.g., "low", "medium", "high", "critical"

    @Column(name = "confidence_interval_width", precision = 15, scale = 6)
    private BigDecimal confidenceIntervalWidth; // Width of prediction interval

    @Column(name = "prediction_stability_score", precision = 5, scale = 4)
    private BigDecimal predictionStabilityScore; // 0.0000 to 1.0000

    @Column(name = "seasonality_detected", nullable = false)
    private Boolean seasonalityDetected;

    @Column(name = "trend_detected", nullable = false)
    private Boolean trendDetected;

    @Column(name = "cyclical_pattern_detected", nullable = false)
    private Boolean cyclicalPatternDetected;

    @Column(name = "anomaly_detected", nullable = false)
    private Boolean anomalyDetected;

    @Column(name = "data_quality_issues", columnDefinition = "TEXT")
    private String dataQualityIssues; // JSON string of detected data quality issues

    @Column(name = "model_limitations", columnDefinition = "TEXT")
    private String modelLimitations; // JSON string of model limitations and assumptions

    @Column(name = "recommendations", columnDefinition = "TEXT")
    private String recommendations; // JSON string of actionable recommendations

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

    // Common prediction types
    public static final String USER_CHURN = "user_churn";
    public static final String REVENUE_FORECAST = "revenue_forecast";
    public static final String DEMAND_PREDICTION = "demand_prediction";
    public static final String EQUIPMENT_FAILURE = "equipment_failure";
    public static final String VENUE_UTILIZATION = "venue_utilization";
    public static final String GAME_ATTENDANCE = "game_attendance";
    public static final String TOURNAMENT_PARTICIPATION = "tournament_participation";
    public static final String CUSTOMER_LIFETIME_VALUE = "customer_lifetime_value";
    public static final String CAMPAIGN_EFFECTIVENESS = "campaign_effectiveness";
    public static final String WEATHER_IMPACT = "weather_impact";
}
