package com.bmessi.pickupsportsapp.entity.analytics;

import com.bmessi.pickupsportsapp.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;

/**
 * Analytics event entity for tracking comprehensive user behavior and app usage patterns.
 * 
 * <p>This entity captures detailed analytics data for user interactions, system performance,
 * and business intelligence. It provides the foundation for data-driven decision making,
 * user experience optimization, and business growth strategies.</p>
 * 
 * <p><strong>Event Categories:</strong></p>
 * <ul>
 *   <li><strong>Navigation:</strong> Page views, navigation patterns, and user flow</li>
 *   <li><strong>Game Management:</strong> Game creation, joining, and management actions</li>
 *   <li><strong>Social:</strong> User interactions, ratings, and community engagement</li>
 *   <li><strong>Payment:</strong> Financial transactions and revenue tracking</li>
 *   <li><strong>Performance:</strong> App performance metrics and user experience data</li>
 * </ul>
 * 
 * <p><strong>Event Types:</strong></p>
 * <ul>
 *   <li><strong>PAGE_VIEW:</strong> User viewed a specific page or screen</li>
 *   <li><strong>BUTTON_CLICK:</strong> User clicked on interactive elements</li>
 *   <li><strong>FORM_SUBMIT:</strong> User submitted forms or data</li>
 *   <li><strong>GAME_CREATED:</strong> New game was created by user</li>
 *   <li><strong>GAME_JOINED:</strong> User joined an existing game</li>
 *   <li><strong>VENUE_BOOKED:</strong> Venue booking was completed</li>
 *   <li><strong>PAYMENT_COMPLETED:</strong> Financial transaction was successful</li>
 *   <li><strong>USER_REGISTERED:</strong> New user account was created</li>
 *   <li><strong>SEARCH_PERFORMED:</strong> User performed a search operation</li>
 *   <li><strong>NOTIFICATION_RECEIVED:</strong> Push notification was delivered</li>
 *   <li><strong>CHAT_MESSAGE_SENT:</strong> User sent a chat message</li>
 *   <li><strong>RATING_SUBMITTED:</strong> User submitted a rating or review</li>
 *   <li><strong>TOURNAMENT_JOINED:</strong> User joined a tournament</li>
 *   <li><strong>EQUIPMENT_RENTED:</strong> Equipment rental was completed</li>
 *   <li><strong>ERROR_OCCURRED:</strong> System error or exception occurred</li>
 *   <li><strong>PERFORMANCE_MEASURED:</strong> Performance metric was recorded</li>
 * </ul>
 * 
 * <p><strong>Data Collection:</strong></p>
 * <ul>
 *   <li><strong>User Context:</strong> User ID, session ID, and authentication status</li>
 *   <li><strong>Device Information:</strong> Device type, OS, browser, and screen resolution</li>
 *   <li><strong>Geographic Data:</strong> Location coordinates, city, state, and country</li>
 *   <li><strong>Performance Metrics:</strong> Load times, interaction times, and scroll depth</li>
 *   <li><strong>Conversion Tracking:</strong> Goal completion, funnel progression, and value</li>
 *   <li><strong>Technical Data:</strong> Network conditions, battery level, and offline status</li>
 * </ul>
 * 
 * <p><strong>Business Intelligence:</strong></p>
 * <ul>
 *   <li>User behavior analysis and pattern recognition</li>
 *   <li>Conversion funnel optimization and A/B testing</li>
 *   <li>Geographic user distribution and market analysis</li>
 *   <li>Performance monitoring and user experience optimization</li>
 *   <li>Revenue tracking and financial analytics</li>
 *   <li>Feature adoption and user engagement metrics</li>
 * </ul>
 * 
 * <p><strong>Privacy & Compliance:</strong></p>
 * <ul>
 *   <li>GDPR-compliant data collection and processing</li>
 *   <li>User consent management and data anonymization</li>
 *   <li>Data retention policies and automatic cleanup</li>
 *   <li>Secure data transmission and storage</li>
 *   <li>Audit trails and compliance reporting</li>
 * </ul>
 * 
 * <p><strong>Processing Pipeline:</strong></p>
 * <ul>
 *   <li>Real-time event streaming and processing</li>
 *   <li>Batch analytics and reporting generation</li>
 *   <li>Machine learning model training and prediction</li>
 *   <li>Alert generation and anomaly detection</li>
 *   <li>Data warehouse integration and business intelligence</li>
 * </ul>
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
@Entity
@Table(name = "analytics_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // Null for anonymous events

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType; // e.g., "page_view", "button_click", "game_created", "rsvp_submitted"

    @Column(name = "event_category", length = 100)
    private String eventCategory; // e.g., "navigation", "game_management", "social", "payment"

    @Column(name = "event_action", length = 100)
    private String eventAction; // e.g., "view", "create", "update", "delete", "submit"

    @Column(name = "event_label", length = 200)
    private String eventLabel; // e.g., "home_page", "soccer_game", "venue_booking"

    @Column(name = "event_value")
    private BigDecimal eventValue; // Numeric value associated with the event

    @Column(name = "page_url", length = 500)
    private String pageUrl;

    @Column(name = "referrer_url", length = 500)
    private String referrerUrl;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "device_type", length = 50)
    private String deviceType; // e.g., "mobile", "desktop", "tablet"

    @Column(name = "operating_system", length = 100)
    private String operatingSystem;

    @Column(name = "browser", length = 100)
    private String browser;

    @Column(name = "screen_resolution", length = 50)
    private String screenResolution;

    @Column(name = "language", length = 10)
    private String language;

    @Column(name = "timezone", length = 50)
    private String timezone;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "load_time_ms")
    private Integer loadTimeMs;

    @Column(name = "interaction_time_ms")
    private Integer interactionTimeMs;

    @Column(name = "scroll_depth_percentage")
    private Integer scrollDepthPercentage;

    @Column(name = "time_on_page_seconds")
    private Integer timeOnPageSeconds;

    @Column(name = "bounce_rate")
    private Boolean bounceRate; // True if user left without interaction

    @Column(name = "conversion_goal", length = 100)
    private String conversionGoal; // e.g., "game_creation", "venue_booking", "user_registration"

    @Column(name = "conversion_value", precision = 10, scale = 2)
    private BigDecimal conversionValue;

    @Column(name = "funnel_step", length = 50)
    private String funnelStep; // e.g., "awareness", "consideration", "conversion", "retention"

    @Column(name = "ab_test_variant", length = 100)
    private String abTestVariant;

    @Column(name = "feature_flag", length = 100)
    private String featureFlag;

    @Column(name = "custom_attributes", columnDefinition = "TEXT")
    private String customAttributes; // JSON string for additional custom data

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(name = "error_stack_trace", columnDefinition = "TEXT")
    private String errorStackTrace;

    @Column(name = "performance_metrics", columnDefinition = "TEXT")
    private String performanceMetrics; // JSON string for performance data

    @Column(name = "network_conditions", length = 100)
    private String networkConditions; // e.g., "4g", "wifi", "3g", "offline"

    @Column(name = "battery_level")
    private Integer batteryLevel; // Percentage

    @Column(name = "is_offline", nullable = false)
    private Boolean isOffline;

    @Column(name = "app_version", length = 50)
    private String appVersion;

    @Column(name = "platform_version", length = 50)
    private String platformVersion;

    @Column(name = "event_timestamp", nullable = false)
    private OffsetDateTime eventTimestamp;

    @Column(name = "processed", nullable = false)
    private Boolean processed; // Whether this event has been processed by analytics pipeline

    @Column(name = "processing_priority")
    private Integer processingPriority; // Higher numbers = higher priority

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Common event types
    public static final String PAGE_VIEW = "page_view";
    public static final String BUTTON_CLICK = "button_click";
    public static final String FORM_SUBMIT = "form_submit";
    public static final String GAME_CREATED = "game_created";
    public static final String GAME_JOINED = "game_joined";
    public static final String VENUE_BOOKED = "venue_booked";
    public static final String PAYMENT_COMPLETED = "payment_completed";
    public static final String USER_REGISTERED = "user_registered";
    public static final String SEARCH_PERFORMED = "search_performed";
    public static final String NOTIFICATION_RECEIVED = "notification_received";
    public static final String CHAT_MESSAGE_SENT = "chat_message_sent";
    public static final String RATING_SUBMITTED = "rating_submitted";
    public static final String TOURNAMENT_JOINED = "tournament_joined";
    public static final String EQUIPMENT_RENTED = "equipment_rented";
    public static final String ERROR_OCCURRED = "error_occurred";
    public static final String PERFORMANCE_MEASURED = "performance_measured";
}
