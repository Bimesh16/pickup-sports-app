package com.bmessi.pickupsportsapp.service.system;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class AdvancedMonitoringService {
    
    @Autowired
    private PerformanceOptimizationEngine performanceEngine;
    
    @Autowired
    private LoadBalancingService loadBalancingService;
    
    // System health monitoring
    private final Map<String, ComponentHealth> componentHealthMap = new ConcurrentHashMap<>();
    private final Map<String, HealthCheck> healthChecks = new ConcurrentHashMap<>();
    
    // Metrics collection
    private final Map<String, MetricCollector> metricCollectors = new ConcurrentHashMap<>();
    private final Map<String, List<MetricDataPoint>> historicalMetrics = new ConcurrentHashMap<>();
    
    // Alerting system
    private final Map<String, AlertRule> alertRules = new ConcurrentHashMap<>();
    private final List<Alert> activeAlerts = new ArrayList<>();
    private final List<Alert> alertHistory = new ArrayList<>();
    
    // Performance thresholds
    private final AtomicReference<MonitoringThresholds> thresholds = new AtomicReference<>(
        new MonitoringThresholds(0.8, 1000, 0.9, 100)
    );
    
    // System status
    private final AtomicReference<SystemStatus> systemStatus = new AtomicReference<>(SystemStatus.HEALTHY);
    private final AtomicLong lastHealthCheck = new AtomicLong(System.currentTimeMillis());
    
    public AdvancedMonitoringService() {
        initializeDefaultHealthChecks();
        initializeDefaultAlertRules();
        initializeMetricCollectors();
    }
    
    /**
     * Perform comprehensive system health check
     */
    public SystemHealthReport performSystemHealthCheck() {
        SystemHealthReport report = new SystemHealthReport();
        report.setTimestamp(OffsetDateTime.now());
        
        // Check all components
        Map<String, ComponentHealthStatus> componentStatuses = new HashMap<>();
        componentHealthMap.forEach((componentId, component) -> {
            ComponentHealthStatus status = checkComponentHealth(component);
            componentStatuses.put(componentId, status);
        });
        
        // Determine overall system status
        SystemStatus overallStatus = determineOverallSystemStatus(componentStatuses);
        systemStatus.set(overallStatus);
        
        // Update last health check time
        lastHealthCheck.set(System.currentTimeMillis());
        
        // Generate report
        report.setComponentStatuses(componentStatuses);
        report.setOverallStatus(overallStatus);
        report.setActiveAlerts(activeAlerts.size());
        report.setCriticalAlerts(getCriticalAlertsCount());
        
        return report;
    }
    
    /**
     * Collect real-time metrics from all components
     */
    public SystemMetrics collectSystemMetrics() {
        SystemMetrics metrics = new SystemMetrics();
        metrics.setTimestamp(OffsetDateTime.now());
        
        // Collect performance metrics
        var performanceMetrics = performanceEngine.getSystemPerformanceMetrics();
        metrics.setCacheHitRate(performanceMetrics.getCacheHitRate());
        metrics.setConnectionUtilization(performanceMetrics.getConnectionUtilization());
        metrics.setTotalRequests(performanceMetrics.getTotalRequests());
        metrics.setSlowQueries(performanceMetrics.getSlowQueries());
        
        // Collect load balancing metrics
        var loadBalancingStats = loadBalancingService.getLoadBalancingStats();
        metrics.setLoadBalancingStrategy(loadBalancingStats.getStrategy().name());
        metrics.setHealthyServers(loadBalancingStats.getHealthyServers());
        metrics.setOverallSuccessRate(loadBalancingStats.getOverallSuccessRate());
        metrics.setCurrentInstances(loadBalancingStats.getCurrentInstances());
        
        // Collect custom metrics
        Map<String, Object> customMetrics = new HashMap<>();
        metricCollectors.forEach((collectorId, collector) -> {
            customMetrics.put(collectorId, collector.collectMetrics());
        });
        metrics.setCustomMetrics(customMetrics);
        
        // Store historical data
        storeHistoricalMetrics(metrics);
        
        return metrics;
    }
    
    /**
     * Check if any alert rules are triggered
     */
    public List<Alert> checkAlertRules() {
        List<Alert> newAlerts = new ArrayList<>();
        
        alertRules.forEach((ruleId, rule) -> {
            if (isAlertRuleTriggered(rule)) {
                Alert alert = createAlert(rule);
                newAlerts.add(alert);
                activeAlerts.add(alert);
                alertHistory.add(alert);
            }
        });
        
        return newAlerts;
    }
    
    /**
     * Get system status overview
     */
    public SystemStatusOverview getSystemStatusOverview() {
        SystemStatusOverview overview = new SystemStatusOverview();
        
        // Current system status
        overview.setSystemStatus(systemStatus.get());
        overview.setLastHealthCheck(OffsetDateTime.ofInstant(
            java.time.Instant.ofEpochMilli(lastHealthCheck.get()), 
            java.time.ZoneOffset.UTC
        ));
        
        // Component health summary
        Map<String, Integer> healthSummary = new HashMap<>();
        healthSummary.put("HEALTHY", 0);
        healthSummary.put("DEGRADED", 0);
        healthSummary.put("UNHEALTHY", 0);
        healthSummary.put("UNKNOWN", 0);
        
        componentHealthMap.values().forEach(component -> {
            String status = component.getStatus().name();
            healthSummary.merge(status, 1, Integer::sum);
        });
        overview.setComponentHealthSummary(healthSummary);
        
        // Active alerts summary
        Map<String, Integer> alertSummary = new HashMap<>();
        alertSummary.put("INFO", 0);
        alertSummary.put("WARNING", 0);
        alertSummary.put("CRITICAL", 0);
        
        activeAlerts.forEach(alert -> {
            String severity = alert.getSeverity();
            alertSummary.merge(severity, 1, Integer::sum);
        });
        overview.setAlertSummary(alertSummary);
        
        // Performance indicators
        var metrics = collectSystemMetrics();
        overview.setCacheHitRate(metrics.getCacheHitRate());
        overview.setConnectionUtilization(metrics.getConnectionUtilization());
        overview.setOverallSuccessRate(metrics.getOverallSuccessRate());
        
        overview.setGeneratedAt(OffsetDateTime.now());
        
        return overview;
    }
    
    /**
     * Add custom health check
     */
    public void addHealthCheck(String checkId, HealthCheck healthCheck) {
        healthChecks.put(checkId, healthCheck);
    }
    
    /**
     * Add custom alert rule
     */
    public void addAlertRule(String ruleId, AlertRule alertRule) {
        alertRules.put(ruleId, alertRule);
    }
    
    /**
     * Add custom metric collector
     */
    public void addMetricCollector(String collectorId, MetricCollector collector) {
        metricCollectors.put(collectorId, collector);
    }
    
    /**
     * Update monitoring thresholds
     */
    public void updateMonitoringThresholds(MonitoringThresholds newThresholds) {
        thresholds.set(newThresholds);
    }
    
    /**
     * Get historical metrics for a specific metric
     */
    public List<MetricDataPoint> getHistoricalMetrics(String metricName, int dataPoints) {
        List<MetricDataPoint> metrics = historicalMetrics.get(metricName);
        if (metrics == null) {
            return new ArrayList<>();
        }
        
        // Return last N data points
        int startIndex = Math.max(0, metrics.size() - dataPoints);
        return metrics.subList(startIndex, metrics.size());
    }
    
    /**
     * Clear resolved alerts
     */
    public void clearResolvedAlerts() {
        activeAlerts.removeIf(alert -> alert.getStatus() == AlertStatus.RESOLVED);
    }
    
    /**
     * Scheduled health check
     */
    @Scheduled(fixedRate = 30000) // Every 30 seconds
    public void scheduledHealthCheck() {
        performSystemHealthCheck();
        checkAlertRules();
    }
    
    /**
     * Scheduled metrics collection
     */
    @Scheduled(fixedRate = 10000) // Every 10 seconds
    public void scheduledMetricsCollection() {
        collectSystemMetrics();
    }
    
    // Private helper methods
    
    private void initializeDefaultHealthChecks() {
        // Database health check
        addHealthCheck("database", new HealthCheck(
            "Database Connectivity",
            "Check database connection and basic queries",
            () -> checkDatabaseHealth()
        ));
        
        // Cache health check
        addHealthCheck("cache", new HealthCheck(
            "Cache System",
            "Check cache availability and performance",
            () -> checkCacheHealth()
        ));
        
        // Load balancer health check
        addHealthCheck("load_balancer", new HealthCheck(
            "Load Balancer",
            "Check load balancer status and server health",
            () -> checkLoadBalancerHealth()
        ));
    }
    
    private void initializeDefaultAlertRules() {
        // High error rate alert
        addAlertRule("high_error_rate", new AlertRule(
            "High Error Rate",
            "System error rate exceeds threshold",
            "CRITICAL",
            () -> checkHighErrorRate()
        ));
        
        // Low cache hit rate alert
        addAlertRule("low_cache_hit_rate", new AlertRule(
            "Low Cache Hit Rate",
            "Cache hit rate below threshold",
            "WARNING",
            () -> checkLowCacheHitRate()
        ));
        
        // High response time alert
        addAlertRule("high_response_time", new AlertRule(
            "High Response Time",
            "Average response time exceeds threshold",
            "WARNING",
            () -> checkHighResponseTime()
        ));
    }
    
    private void initializeMetricCollectors() {
        // Memory usage collector
        addMetricCollector("memory", new MetricCollector(
            "Memory Usage",
            "System memory utilization",
            () -> collectMemoryMetrics()
        ));
        
        // CPU usage collector
        addMetricCollector("cpu", new MetricCollector(
            "CPU Usage",
            "System CPU utilization",
            () -> collectCpuMetrics()
        ));
        
        // Thread count collector
        addMetricCollector("threads", new MetricCollector(
            "Thread Count",
            "Active thread count",
            () -> collectThreadMetrics()
        ));
    }
    
    private ComponentHealthStatus checkComponentHealth(ComponentHealth component) {
        HealthCheck healthCheck = healthChecks.get(component.getHealthCheckId());
        if (healthCheck == null) {
            return new ComponentHealthStatus(ComponentStatus.UNKNOWN, "Health check not found", OffsetDateTime.now());
        }
        
        try {
            HealthCheckResult result = healthCheck.execute();
            component.updateStatus(result.getStatus(), result.getMessage());
            return new ComponentHealthStatus(result.getStatus(), result.getMessage(), OffsetDateTime.now());
        } catch (Exception e) {
            component.updateStatus(ComponentStatus.UNHEALTHY, "Health check failed: " + e.getMessage());
            return new ComponentHealthStatus(ComponentStatus.UNHEALTHY, "Health check failed: " + e.getMessage(), OffsetDateTime.now());
        }
    }
    
    private SystemStatus determineOverallSystemStatus(Map<String, ComponentHealthStatus> componentStatuses) {
        long unhealthyCount = componentStatuses.values().stream()
            .filter(status -> status.getStatus() == ComponentStatus.UNHEALTHY)
            .count();
        
        long degradedCount = componentStatuses.values().stream()
            .filter(status -> status.getStatus() == ComponentStatus.DEGRADED)
            .count();
        
        if (unhealthyCount > 0) {
            return SystemStatus.UNHEALTHY;
        } else if (degradedCount > 0) {
            return SystemStatus.DEGRADED;
        } else {
            return SystemStatus.HEALTHY;
        }
    }
    
    private boolean isAlertRuleTriggered(AlertRule rule) {
        try {
            return rule.getCondition().get();
        } catch (Exception e) {
            return false;
        }
    }
    
    private Alert createAlert(AlertRule rule) {
        return new Alert(
            UUID.randomUUID().toString(),
            rule.getName(),
            rule.getDescription(),
            rule.getSeverity(),
            AlertStatus.ACTIVE,
            OffsetDateTime.now()
        );
    }
    
    private int getCriticalAlertsCount() {
        return (int) activeAlerts.stream()
            .filter(alert -> "CRITICAL".equals(alert.getSeverity()))
            .count();
    }
    
    private void storeHistoricalMetrics(SystemMetrics metrics) {
        // Store cache hit rate
        storeMetricDataPoint("cache_hit_rate", metrics.getCacheHitRate());
        
        // Store connection utilization
        storeMetricDataPoint("connection_utilization", metrics.getConnectionUtilization());
        
        // Store overall success rate
        storeMetricDataPoint("overall_success_rate", metrics.getOverallSuccessRate());
        
        // Store custom metrics
        metrics.getCustomMetrics().forEach((metricName, value) -> {
            if (value instanceof Number) {
                storeMetricDataPoint(metricName, ((Number) value).doubleValue());
            }
        });
    }
    
    private void storeMetricDataPoint(String metricName, double value) {
        List<MetricDataPoint> metrics = historicalMetrics.computeIfAbsent(metricName, k -> new ArrayList<>());
        
        // Keep only last 1000 data points
        if (metrics.size() >= 1000) {
            metrics.remove(0);
        }
        
        metrics.add(new MetricDataPoint(metricName, value, OffsetDateTime.now()));
    }
    
    // Health check implementations
    
    private HealthCheckResult checkDatabaseHealth() {
        // Simulate database health check
        return new HealthCheckResult(ComponentStatus.HEALTHY, "Database connection successful");
    }
    
    private HealthCheckResult checkCacheHealth() {
        // Simulate cache health check
        return new HealthCheckResult(ComponentStatus.HEALTHY, "Cache system operational");
    }
    
    private HealthCheckResult checkLoadBalancerHealth() {
        // Simulate load balancer health check
        return new HealthCheckResult(ComponentStatus.HEALTHY, "Load balancer operational");
    }
    
    // Alert condition implementations
    
    private boolean checkHighErrorRate() {
        var metrics = collectSystemMetrics();
        return metrics.getOverallSuccessRate() < thresholds.get().getMinSuccessRate();
    }
    
    private boolean checkLowCacheHitRate() {
        var metrics = collectSystemMetrics();
        return metrics.getCacheHitRate() < thresholds.get().getMinCacheHitRate();
    }
    
    private boolean checkHighResponseTime() {
        // Simulate response time check
        return false;
    }
    
    // Metric collection implementations
    
    private Map<String, Object> collectMemoryMetrics() {
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;
        
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("total_memory_mb", totalMemory / (1024 * 1024));
        metrics.put("used_memory_mb", usedMemory / (1024 * 1024));
        metrics.put("free_memory_mb", freeMemory / (1024 * 1024));
        metrics.put("memory_utilization_percent", (double) usedMemory / totalMemory * 100);
        
        return metrics;
    }
    
    private Map<String, Object> collectCpuMetrics() {
        // Simulate CPU metrics
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("cpu_usage_percent", Math.random() * 100);
        metrics.put("load_average", Math.random() * 10);
        
        return metrics;
    }
    
    private Map<String, Object> collectThreadMetrics() {
        ThreadGroup rootGroup = Thread.currentThread().getThreadGroup();
        while (rootGroup.getParent() != null) {
            rootGroup = rootGroup.getParent();
        }
        
        int activeThreads = rootGroup.activeCount();
        
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("active_threads", activeThreads);
        metrics.put("max_threads", 1000); // Simulated max
        
        return metrics;
    }
    
    // Inner classes for data structures
    
    public enum SystemStatus {
        HEALTHY, DEGRADED, UNHEALTHY, MAINTENANCE
    }
    
    public enum ComponentStatus {
        HEALTHY, DEGRADED, UNHEALTHY, UNKNOWN
    }
    
    public enum AlertStatus {
        ACTIVE, ACKNOWLEDGED, RESOLVED
    }
    
    public static class MonitoringThresholds {
        private final double minSuccessRate;
        private final int maxResponseTime;
        private final double minCacheHitRate;
        private final int maxActiveAlerts;
        
        public MonitoringThresholds(double minSuccessRate, int maxResponseTime,
                                   double minCacheHitRate, int maxActiveAlerts) {
            this.minSuccessRate = minSuccessRate;
            this.maxResponseTime = maxResponseTime;
            this.minCacheHitRate = minCacheHitRate;
            this.maxActiveAlerts = maxActiveAlerts;
        }
        
        // Getters
        public double getMinSuccessRate() { return minSuccessRate; }
        public int getMaxResponseTime() { return maxResponseTime; }
        public double getMinCacheHitRate() { return minCacheHitRate; }
        public int getMaxActiveAlerts() { return maxActiveAlerts; }
    }
    
    public static class ComponentHealth {
        private final String componentId;
        private final String healthCheckId;
        private ComponentStatus status;
        private String details;
        private OffsetDateTime lastUpdated;
        
        public ComponentHealth(String componentId, String healthCheckId) {
            this.componentId = componentId;
            this.healthCheckId = healthCheckId;
            this.status = ComponentStatus.UNKNOWN;
            this.lastUpdated = OffsetDateTime.now();
        }
        
        public void updateStatus(ComponentStatus status, String details) {
            this.status = status;
            this.details = details;
            this.lastUpdated = OffsetDateTime.now();
        }
        
        // Getters
        public String getComponentId() { return componentId; }
        public String getHealthCheckId() { return healthCheckId; }
        public ComponentStatus getStatus() { return status; }
        public String getDetails() { return details; }
        public OffsetDateTime getLastUpdated() { return lastUpdated; }
    }
    
    public static class HealthCheck {
        private final String name;
        private final String description;
        private final java.util.function.Supplier<HealthCheckResult> checkFunction;
        
        public HealthCheck(String name, String description, 
                          java.util.function.Supplier<HealthCheckResult> checkFunction) {
            this.name = name;
            this.description = description;
            this.checkFunction = checkFunction;
        }
        
        public HealthCheckResult execute() {
            return checkFunction.get();
        }
        
        // Getters
        public String getName() { return name; }
        public String getDescription() { return description; }
    }
    
    public static class HealthCheckResult {
        private final ComponentStatus status;
        private final String message;
        
        public HealthCheckResult(ComponentStatus status, String message) {
            this.status = status;
            this.message = message;
        }
        
        // Getters
        public ComponentStatus getStatus() { return status; }
        public String getMessage() { return message; }
    }
    
    public static class AlertRule {
        private final String name;
        private final String description;
        private final String severity;
        private final java.util.function.Supplier<Boolean> condition;
        
        public AlertRule(String name, String description, String severity,
                        java.util.function.Supplier<Boolean> condition) {
            this.name = name;
            this.description = description;
            this.severity = severity;
            this.condition = condition;
        }
        
        // Getters
        public String getName() { return name; }
        public String getDescription() { return description; }
        public String getSeverity() { return severity; }
        public java.util.function.Supplier<Boolean> getCondition() { return condition; }
    }
    
    public static class Alert {
        private final String alertId;
        private final String name;
        private final String description;
        private final String severity;
        private AlertStatus status;
        private final OffsetDateTime createdAt;
        private OffsetDateTime acknowledgedAt;
        private OffsetDateTime resolvedAt;
        
        public Alert(String alertId, String name, String description, String severity,
                    AlertStatus status, OffsetDateTime createdAt) {
            this.alertId = alertId;
            this.name = name;
            this.description = description;
            this.severity = severity;
            this.status = status;
            this.createdAt = createdAt;
        }
        
        public void acknowledge() {
            this.status = AlertStatus.ACKNOWLEDGED;
            this.acknowledgedAt = OffsetDateTime.now();
        }
        
        public void resolve() {
            this.status = AlertStatus.RESOLVED;
            this.resolvedAt = OffsetDateTime.now();
        }
        
        // Getters
        public String getAlertId() { return alertId; }
        public String getName() { return name; }
        public String getDescription() { return description; }
        public String getSeverity() { return severity; }
        public AlertStatus getStatus() { return status; }
        public OffsetDateTime getCreatedAt() { return createdAt; }
        public OffsetDateTime getAcknowledgedAt() { return acknowledgedAt; }
        public OffsetDateTime getResolvedAt() { return resolvedAt; }
    }
    
    public static class MetricCollector {
        private final String name;
        private final String description;
        private final java.util.function.Supplier<Map<String, Object>> collectorFunction;
        
        public MetricCollector(String name, String description,
                              java.util.function.Supplier<Map<String, Object>> collectorFunction) {
            this.name = name;
            this.description = description;
            this.collectorFunction = collectorFunction;
        }
        
        public Map<String, Object> collectMetrics() {
            return collectorFunction.get();
        }
        
        // Getters
        public String getName() { return name; }
        public String getDescription() { return description; }
    }
    
    public static class MetricDataPoint {
        private final String metricName;
        private final double value;
        private final OffsetDateTime timestamp;
        
        public MetricDataPoint(String metricName, double value, OffsetDateTime timestamp) {
            this.metricName = metricName;
            this.value = value;
            this.timestamp = timestamp;
        }
        
        // Getters
        public String getMetricName() { return metricName; }
        public double getValue() { return value; }
        public OffsetDateTime getTimestamp() { return timestamp; }
    }
    
    public static class ComponentHealthStatus {
        private final ComponentStatus status;
        private final String message;
        private final OffsetDateTime timestamp;
        
        public ComponentHealthStatus(ComponentStatus status, String message, OffsetDateTime timestamp) {
            this.status = status;
            this.message = message;
            this.timestamp = timestamp;
        }
        
        // Getters
        public ComponentStatus getStatus() { return status; }
        public String getMessage() { return message; }
        public OffsetDateTime getTimestamp() { return timestamp; }
    }
    
    public static class SystemHealthReport {
        private Map<String, ComponentHealthStatus> componentStatuses;
        private SystemStatus overallStatus;
        private int activeAlerts;
        private int criticalAlerts;
        private OffsetDateTime timestamp;
        
        // Getters and setters
        public Map<String, ComponentHealthStatus> getComponentStatuses() { return componentStatuses; }
        public void setComponentStatuses(Map<String, ComponentHealthStatus> componentStatuses) { this.componentStatuses = componentStatuses; }
        public SystemStatus getOverallStatus() { return overallStatus; }
        public void setOverallStatus(SystemStatus overallStatus) { this.overallStatus = overallStatus; }
        public int getActiveAlerts() { return activeAlerts; }
        public void setActiveAlerts(int activeAlerts) { this.activeAlerts = activeAlerts; }
        public int getCriticalAlerts() { return criticalAlerts; }
        public void setCriticalAlerts(int criticalAlerts) { this.criticalAlerts = criticalAlerts; }
        public OffsetDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }
    }
    
    public static class SystemMetrics {
        private double cacheHitRate;
        private double connectionUtilization;
        private long totalRequests;
        private long slowQueries;
        private String loadBalancingStrategy;
        private int healthyServers;
        private double overallSuccessRate;
        private int currentInstances;
        private Map<String, Object> customMetrics;
        private OffsetDateTime timestamp;
        
        // Getters and setters
        public double getCacheHitRate() { return cacheHitRate; }
        public void setCacheHitRate(double cacheHitRate) { this.cacheHitRate = cacheHitRate; }
        public double getConnectionUtilization() { return connectionUtilization; }
        public void setConnectionUtilization(double connectionUtilization) { this.connectionUtilization = connectionUtilization; }
        public long getTotalRequests() { return totalRequests; }
        public void setTotalRequests(long totalRequests) { this.totalRequests = totalRequests; }
        public long getSlowQueries() { return slowQueries; }
        public void setSlowQueries(long slowQueries) { this.slowQueries = slowQueries; }
        public String getLoadBalancingStrategy() { return loadBalancingStrategy; }
        public void setLoadBalancingStrategy(String loadBalancingStrategy) { this.loadBalancingStrategy = loadBalancingStrategy; }
        public int getHealthyServers() { return healthyServers; }
        public void setHealthyServers(int healthyServers) { this.healthyServers = healthyServers; }
        public double getOverallSuccessRate() { return overallSuccessRate; }
        public void setOverallSuccessRate(double overallSuccessRate) { this.overallSuccessRate = overallSuccessRate; }
        public int getCurrentInstances() { return currentInstances; }
        public void setCurrentInstances(int currentInstances) { this.currentInstances = currentInstances; }
        public Map<String, Object> getCustomMetrics() { return customMetrics; }
        public void setCustomMetrics(Map<String, Object> customMetrics) { this.customMetrics = customMetrics; }
        public OffsetDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }
    }
    
    public static class SystemStatusOverview {
        private SystemStatus systemStatus;
        private OffsetDateTime lastHealthCheck;
        private Map<String, Integer> componentHealthSummary;
        private Map<String, Integer> alertSummary;
        private double cacheHitRate;
        private double connectionUtilization;
        private double overallSuccessRate;
        private OffsetDateTime generatedAt;
        
        // Getters and setters
        public SystemStatus getSystemStatus() { return systemStatus; }
        public void setSystemStatus(SystemStatus systemStatus) { this.systemStatus = systemStatus; }
        public OffsetDateTime getLastHealthCheck() { return lastHealthCheck; }
        public void setLastHealthCheck(OffsetDateTime lastHealthCheck) { this.lastHealthCheck = lastHealthCheck; }
        public Map<String, Integer> getComponentHealthSummary() { return componentHealthSummary; }
        public void setComponentHealthSummary(Map<String, Integer> componentHealthSummary) { this.componentHealthSummary = componentHealthSummary; }
        public Map<String, Integer> getAlertSummary() { return alertSummary; }
        public void setAlertSummary(Map<String, Integer> alertSummary) { this.alertSummary = alertSummary; }
        public double getCacheHitRate() { return cacheHitRate; }
        public void setCacheHitRate(double cacheHitRate) { this.cacheHitRate = cacheHitRate; }
        public double getConnectionUtilization() { return connectionUtilization; }
        public void setConnectionUtilization(double connectionUtilization) { this.connectionUtilization = connectionUtilization; }
        public double getOverallSuccessRate() { return overallSuccessRate; }
        public void setOverallSuccessRate(double overallSuccessRate) { this.overallSuccessRate = overallSuccessRate; }
        public OffsetDateTime getGeneratedAt() { return generatedAt; }
        public void setGeneratedAt(OffsetDateTime generatedAt) { this.generatedAt = generatedAt; }
    }
}
