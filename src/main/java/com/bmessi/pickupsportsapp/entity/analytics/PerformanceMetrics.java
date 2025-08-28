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
 * Performance metrics entity for tracking application performance and system health.
 */
@Entity
@Table(name = "performance_metrics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "metric_name", nullable = false, length = 100)
    private String metricName; // e.g., "response_time", "throughput", "error_rate", "cpu_usage"

    @Column(name = "metric_category", length = 100)
    private String metricCategory; // e.g., "api", "database", "cache", "external_service", "system"

    @Column(name = "metric_type", nullable = false, length = 50)
    private String metricType; // e.g., "gauge", "counter", "histogram", "summary"

    @Column(name = "metric_value", nullable = false, precision = 15, scale = 6)
    private BigDecimal metricValue;

    @Column(name = "metric_unit", length = 20)
    private String metricUnit; // e.g., "ms", "bytes", "requests_per_second", "percentage"

    @Column(name = "min_value", precision = 15, scale = 6)
    private BigDecimal minValue;

    @Column(name = "max_value", precision = 15, scale = 6)
    private BigDecimal maxValue;

    @Column(name = "avg_value", precision = 15, scale = 6)
    private BigDecimal avgValue;

    @Column(name = "p50_value", precision = 15, scale = 6)
    private BigDecimal p50Value; // 50th percentile

    @Column(name = "p90_value", precision = 15, scale = 6)
    private BigDecimal p90Value; // 90th percentile

    @Column(name = "p95_value", precision = 15, scale = 6)
    private BigDecimal p95Value; // 95th percentile

    @Column(name = "p99_value", precision = 15, scale = 6)
    private BigDecimal p99Value; // 99th percentile

    @Column(name = "sample_count")
    private Long sampleCount;

    @Column(name = "sample_rate")
    private BigDecimal sampleRate; // Sampling rate if not 100%

    @Column(name = "endpoint", length = 200)
    private String endpoint; // API endpoint or service being measured

    @Column(name = "http_method", length = 10)
    private String httpMethod; // GET, POST, PUT, DELETE, etc.

    @Column(name = "http_status_code")
    private Integer httpStatusCode;

    @Column(name = "response_size_bytes")
    private Long responseSizeBytes;

    @Column(name = "request_size_bytes")
    private Long requestSizeBytes;

    @Column(name = "database_query", length = 1000)
    private String databaseQuery; // SQL query being measured

    @Column(name = "database_connection_pool_size")
    private Integer databaseConnectionPoolSize;

    @Column(name = "database_active_connections")
    private Integer databaseActiveConnections;

    @Column(name = "database_idle_connections")
    private Integer databaseIdleConnections;

    @Column(name = "cache_hit_rate", precision = 5, scale = 4)
    private BigDecimal cacheHitRate; // 0.0000 to 1.0000

    @Column(name = "cache_size_bytes")
    private Long cacheSizeBytes;

    @Column(name = "cache_eviction_count")
    private Long cacheEvictionCount;

    @Column(name = "memory_usage_bytes")
    private Long memoryUsageBytes;

    @Column(name = "memory_max_bytes")
    private Long memoryMaxBytes;

    @Column(name = "cpu_usage_percentage", precision = 5, scale = 2)
    private BigDecimal cpuUsagePercentage;

    @Column(name = "disk_usage_percentage", precision = 5, scale = 2)
    private BigDecimal diskUsagePercentage;

    @Column(name = "network_io_bytes_per_second")
    private Long networkIoBytesPerSecond;

    @Column(name = "thread_count")
    private Integer threadCount;

    @Column(name = "active_thread_count")
    private Integer activeThreadCount;

    @Column(name = "queue_size")
    private Integer queueSize;

    @Column(name = "processing_time_ms")
    private Long processingTimeMs;

    @Column(name = "wait_time_ms")
    private Long waitTimeMs;

    @Column(name = "timeout_count")
    private Long timeoutCount;

    @Column(name = "error_count")
    private Long errorCount;

    @Column(name = "success_count")
    private Long successCount;

    @Column(name = "retry_count")
    private Long retryCount;

    @Column(name = "circuit_breaker_state", length = 20)
    private String circuitBreakerState; // CLOSED, OPEN, HALF_OPEN

    @Column(name = "bulkhead_available_permits")
    private Integer bulkheadAvailablePermits;

    @Column(name = "bulkhead_max_permits")
    private Integer bulkheadMaxPermits;

    @Column(name = "rate_limiter_available_permits")
    private Integer rateLimiterAvailablePermits;

    @Column(name = "rate_limiter_max_permits")
    private Integer rateLimiterMaxPermits;

    @Column(name = "external_service_name", length = 100)
    private String externalServiceName; // Name of external service being measured

    @Column(name = "external_service_endpoint", length = 500)
    private String externalServiceEndpoint;

    @Column(name = "external_service_response_time_ms")
    private Long externalServiceResponseTimeMs;

    @Column(name = "external_service_success_rate", precision = 5, scale = 4)
    private BigDecimal externalServiceSuccessRate;

    @Column(name = "environment", length = 50)
    private String environment; // dev, staging, prod, etc.

    @Column(name = "instance_id", length = 100)
    private String instanceId; // Application instance identifier

    @Column(name = "version", length = 50)
    private String version; // Application version

    @Column(name = "tags", length = 500)
    private String tags; // Comma-separated tags for categorization

    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata; // JSON string for additional context

    @Column(name = "measurement_timestamp", nullable = false)
    private OffsetDateTime measurementTimestamp;

    @Column(name = "collection_interval_seconds")
    private Integer collectionIntervalSeconds; // How often this metric is collected

    @Column(name = "alert_threshold", precision = 15, scale = 6)
    private BigDecimal alertThreshold; // Threshold for alerting

    @Column(name = "alert_enabled", nullable = false)
    private Boolean alertEnabled;

    @Column(name = "last_alert_sent")
    private OffsetDateTime lastAlertSent;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Common metric names
    public static final String RESPONSE_TIME = "response_time";
    public static final String THROUGHPUT = "throughput";
    public static final String ERROR_RATE = "error_rate";
    public static final String CPU_USAGE = "cpu_usage";
    public static final String MEMORY_USAGE = "memory_usage";
    public static final String DISK_USAGE = "disk_usage";
    public static final String CACHE_HIT_RATE = "cache_hit_rate";
    public static final String DATABASE_CONNECTIONS = "database_connections";
    public static final String ACTIVE_THREADS = "active_threads";
    public static final String QUEUE_SIZE = "queue_size";
    public static final String CIRCUIT_BREAKER_STATE = "circuit_breaker_state";
    public static final String BULKHEAD_PERMITS = "bulkhead_permits";
    public static final String RATE_LIMITER_PERMITS = "rate_limiter_permits";
}
