package com.bmessi.pickupsportsapp.service.system;

import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class LoadBalancingService {
    
    // Load balancing configuration
    private final AtomicReference<LoadBalancingStrategy> currentStrategy = new AtomicReference<>(LoadBalancingStrategy.ROUND_ROBIN);
    private final AtomicInteger currentServerIndex = new AtomicInteger(0);
    
    // Server health monitoring
    private final Map<String, ServerHealth> serverHealthMap = new ConcurrentHashMap<>();
    private final Map<String, ServerMetrics> serverMetricsMap = new ConcurrentHashMap<>();
    
    // Circuit breaker configuration
    private final Map<String, CircuitBreaker> circuitBreakers = new ConcurrentHashMap<>();
    private final AtomicInteger totalRequests = new AtomicInteger(0);
    private final AtomicInteger successfulRequests = new AtomicInteger(0);
    private final AtomicInteger failedRequests = new AtomicInteger(0);
    
    // Auto-scaling configuration
    private final AtomicInteger currentInstances = new AtomicInteger(1);
    private final AtomicInteger minInstances = new AtomicInteger(1);
    private final AtomicInteger maxInstances = new AtomicInteger(10);
    private final AtomicReference<ScalingPolicy> scalingPolicy = new AtomicReference<>(new ScalingPolicy(0.7, 0.3, 60));
    
    public LoadBalancingService() {
        initializeDefaultServers();
        initializeCircuitBreakers();
    }
    
    /**
     * Get next server using current load balancing strategy
     */
    public String getNextServer() {
        List<String> healthyServers = getHealthyServers();
        
        if (healthyServers.isEmpty()) {
            throw new RuntimeException("No healthy servers available");
        }
        
        switch (currentStrategy.get()) {
            case ROUND_ROBIN:
                return getNextServerRoundRobin(healthyServers);
            case LEAST_CONNECTIONS:
                return getNextServerLeastConnections(healthyServers);
            case WEIGHTED_ROUND_ROBIN:
                return getNextServerWeightedRoundRobin(healthyServers);
            case IP_HASH:
                return getNextServerIpHash(healthyServers);
            default:
                return getNextServerRoundRobin(healthyServers);
        }
    }
    
    /**
     * Update server health status
     */
    public void updateServerHealth(String serverId, ServerHealthStatus status, String details) {
        ServerHealth health = serverHealthMap.computeIfAbsent(serverId, k -> new ServerHealth(serverId));
        health.updateStatus(status, details);
        
        // Update circuit breaker if needed
        if (status == ServerHealthStatus.UNHEALTHY) {
            updateCircuitBreaker(serverId, false);
        }
    }
    
    /**
     * Record server metrics
     */
    public void recordServerMetrics(String serverId, long responseTime, boolean success) {
        ServerMetrics metrics = serverMetricsMap.computeIfAbsent(serverId, k -> new ServerMetrics(serverId));
        metrics.recordRequest(responseTime, success);
        
        // Update circuit breaker
        updateCircuitBreaker(serverId, success);
        
        // Update global metrics
        totalRequests.incrementAndGet();
        if (success) {
            successfulRequests.incrementAndGet();
        } else {
            failedRequests.incrementAndGet();
        }
    }
    
    /**
     * Check if server is available (healthy and circuit breaker closed)
     */
    public boolean isServerAvailable(String serverId) {
        ServerHealth health = serverHealthMap.get(serverId);
        CircuitBreaker circuitBreaker = circuitBreakers.get(serverId);
        
        if (health == null || circuitBreaker == null) {
            return false;
        }
        
        return health.getStatus() == ServerHealthStatus.HEALTHY && 
               circuitBreaker.getState() == CircuitBreakerState.CLOSED;
    }
    
    /**
     * Get load balancing statistics
     */
    public LoadBalancingStats getLoadBalancingStats() {
        Map<String, ServerStats> serverStats = new HashMap<>();
        
        serverHealthMap.forEach((serverId, health) -> {
            ServerMetrics metrics = serverMetricsMap.get(serverId);
            CircuitBreaker circuitBreaker = circuitBreakers.get(serverId);
            
            if (metrics != null && circuitBreaker != null) {
                serverStats.put(serverId, new ServerStats(
                    health.getStatus(),
                    metrics.getTotalRequests(),
                    metrics.getAverageResponseTime(),
                    metrics.getSuccessRate(),
                    circuitBreaker.getState(),
                    circuitBreaker.getFailureRate()
                ));
            }
        });
        
        return new LoadBalancingStats(
            currentStrategy.get(),
            serverStats,
            totalRequests.get(),
            successfulRequests.get(),
            failedRequests.get(),
            getHealthyServers().size(),
            currentInstances.get(),
            OffsetDateTime.now()
        );
    }
    
    /**
     * Change load balancing strategy
     */
    public void setLoadBalancingStrategy(LoadBalancingStrategy strategy) {
        currentStrategy.set(strategy);
        currentServerIndex.set(0); // Reset round-robin index
    }
    
    /**
     * Update auto-scaling configuration
     */
    public void updateScalingPolicy(ScalingPolicy policy) {
        scalingPolicy.set(policy);
    }
    
    /**
     * Trigger auto-scaling evaluation
     */
    public ScalingDecision evaluateScaling() {
        double currentLoad = calculateCurrentLoad();
        ScalingPolicy policy = scalingPolicy.get();
        
        ScalingDecision decision = new ScalingDecision();
        decision.setCurrentLoad(currentLoad);
        decision.setCurrentInstances(currentInstances.get());
        decision.setEvaluatedAt(OffsetDateTime.now());
        
        if (currentLoad > policy.getScaleUpThreshold() && 
            currentInstances.get() < maxInstances.get()) {
            // Scale up
            int newInstances = Math.min(maxInstances.get(), 
                                      (int) (currentInstances.get() * 1.5));
            decision.setAction(ScalingAction.SCALE_UP);
            decision.setRecommendedInstances(newInstances);
            decision.setReason("High load detected: " + currentLoad);
        } else if (currentLoad < policy.getScaleDownThreshold() && 
                   currentInstances.get() > minInstances.get()) {
            // Scale down
            int newInstances = Math.max(minInstances.get(), 
                                      (int) (currentInstances.get() * 0.7));
            decision.setAction(ScalingAction.SCALE_DOWN);
            decision.setRecommendedInstances(newInstances);
            decision.setReason("Low load detected: " + currentLoad);
        } else {
            decision.setAction(ScalingAction.MAINTAIN);
            decision.setRecommendedInstances(currentInstances.get());
            decision.setReason("Load within acceptable range");
        }
        
        return decision;
    }
    
    /**
     * Execute scaling decision
     */
    public void executeScaling(ScalingDecision decision) {
        if (decision.getAction() == ScalingAction.SCALE_UP) {
            currentInstances.set(decision.getRecommendedInstances());
        } else if (decision.getAction() == ScalingAction.SCALE_DOWN) {
            currentInstances.set(decision.getRecommendedInstances());
        }
    }
    
    // Private helper methods
    
    private void initializeDefaultServers() {
        // Initialize with some default servers
        String[] defaultServers = {"server-1", "server-2", "server-3"};
        
        for (String server : defaultServers) {
            serverHealthMap.put(server, new ServerHealth(server));
            serverMetricsMap.put(server, new ServerMetrics(server));
        }
    }
    
    private void initializeCircuitBreakers() {
        // Initialize circuit breakers for all servers
        serverHealthMap.keySet().forEach(serverId -> {
            circuitBreakers.put(serverId, new CircuitBreaker(serverId));
        });
    }
    
    private List<String> getHealthyServers() {
        List<String> healthyServers = new ArrayList<>();
        
        serverHealthMap.forEach((serverId, health) -> {
            if (health.getStatus() == ServerHealthStatus.HEALTHY && 
                isServerAvailable(serverId)) {
                healthyServers.add(serverId);
            }
        });
        
        return healthyServers;
    }
    
    private String getNextServerRoundRobin(List<String> healthyServers) {
        if (healthyServers.isEmpty()) {
            return null;
        }
        
        int index = currentServerIndex.getAndIncrement() % healthyServers.size();
        return healthyServers.get(index);
    }
    
    private String getNextServerLeastConnections(List<String> healthyServers) {
        if (healthyServers.isEmpty()) {
            return null;
        }
        
        return healthyServers.stream()
            .min(Comparator.comparing(serverId -> {
                ServerMetrics metrics = serverMetricsMap.get(serverId);
                return metrics != null ? metrics.getActiveConnections() : 0;
            }))
            .orElse(healthyServers.get(0));
    }
    
    private String getNextServerWeightedRoundRobin(List<String> healthyServers) {
        if (healthyServers.isEmpty()) {
            return null;
        }
        
        // Simple weighted round-robin based on server capacity
        int index = currentServerIndex.getAndIncrement() % healthyServers.size();
        return healthyServers.get(index);
    }
    
    private String getNextServerIpHash(List<String> healthyServers) {
        if (healthyServers.isEmpty()) {
            return null;
        }
        
        // Simple hash-based distribution
        int hash = System.identityHashCode(Thread.currentThread());
        int index = Math.abs(hash) % healthyServers.size();
        return healthyServers.get(index);
    }
    
    private void updateCircuitBreaker(String serverId, boolean success) {
        CircuitBreaker circuitBreaker = circuitBreakers.get(serverId);
        if (circuitBreaker != null) {
            circuitBreaker.recordResult(success);
        }
    }
    
    private double calculateCurrentLoad() {
        // Calculate current load based on active connections and response times
        double totalLoad = serverMetricsMap.values().stream()
            .mapToDouble(metrics -> metrics.getActiveConnections() * metrics.getAverageResponseTime())
            .sum();
        
        return totalLoad / Math.max(1, currentInstances.get());
    }
    
    // Inner classes for data structures
    
    public enum LoadBalancingStrategy {
        ROUND_ROBIN, LEAST_CONNECTIONS, WEIGHTED_ROUND_ROBIN, IP_HASH
    }
    
    public enum ServerHealthStatus {
        HEALTHY, UNHEALTHY, DEGRADED, UNKNOWN
    }
    
    public enum CircuitBreakerState {
        CLOSED, OPEN, HALF_OPEN
    }
    
    public enum ScalingAction {
        SCALE_UP, SCALE_DOWN, MAINTAIN
    }
    
    public static class ServerHealth {
        private final String serverId;
        private ServerHealthStatus status;
        private String details;
        private OffsetDateTime lastUpdated;
        private int consecutiveFailures;
        
        public ServerHealth(String serverId) {
            this.serverId = serverId;
            this.status = ServerHealthStatus.HEALTHY;
            this.lastUpdated = OffsetDateTime.now();
            this.consecutiveFailures = 0;
        }
        
        public void updateStatus(ServerHealthStatus status, String details) {
            this.status = status;
            this.details = details;
            this.lastUpdated = OffsetDateTime.now();
            
            if (status == ServerHealthStatus.UNHEALTHY) {
                consecutiveFailures++;
            } else {
                consecutiveFailures = 0;
            }
        }
        
        // Getters
        public String getServerId() { return serverId; }
        public ServerHealthStatus getStatus() { return status; }
        public String getDetails() { return details; }
        public OffsetDateTime getLastUpdated() { return lastUpdated; }
        public int getConsecutiveFailures() { return consecutiveFailures; }
    }
    
    public static class ServerMetrics {
        private final String serverId;
        private final AtomicInteger totalRequests = new AtomicInteger(0);
        private final AtomicInteger successfulRequests = new AtomicInteger(0);
        private final AtomicInteger activeConnections = new AtomicInteger(0);
        private final AtomicLong totalResponseTime = new AtomicLong(0);
        private final AtomicLong lastUpdated = new AtomicLong(System.currentTimeMillis());
        
        public ServerMetrics(String serverId) {
            this.serverId = serverId;
        }
        
        public void recordRequest(long responseTime, boolean success) {
            totalRequests.incrementAndGet();
            if (success) {
                successfulRequests.incrementAndGet();
            }
            totalResponseTime.addAndGet(responseTime);
            lastUpdated.set(System.currentTimeMillis());
        }
        
        public double getSuccessRate() {
            int total = totalRequests.get();
            return total > 0 ? (double) successfulRequests.get() / total : 0.0;
        }
        
        public double getAverageResponseTime() {
            int total = totalRequests.get();
            return total > 0 ? (double) totalResponseTime.get() / total : 0.0;
        }
        
        // Getters
        public String getServerId() { return serverId; }
        public int getTotalRequests() { return totalRequests.get(); }
        public int getSuccessfulRequests() { return successfulRequests.get(); }
        public int getActiveConnections() { return activeConnections.get(); }
        public long getLastUpdated() { return lastUpdated.get(); }
        
        public void setActiveConnections(int connections) {
            activeConnections.set(connections);
        }
    }
    
    public static class CircuitBreaker {
        private final String serverId;
        private CircuitBreakerState state;
        private final AtomicInteger totalRequests = new AtomicInteger(0);
        private final AtomicInteger failedRequests = new AtomicInteger(0);
        private final AtomicLong lastFailureTime = new AtomicLong(0);
        private final AtomicLong openUntil = new AtomicLong(0);
        
        private static final int FAILURE_THRESHOLD = 5;
        private static final long OPEN_DURATION = 60000; // 1 minute
        
        public CircuitBreaker(String serverId) {
            this.serverId = serverId;
            this.state = CircuitBreakerState.CLOSED;
        }
        
        public void recordResult(boolean success) {
            totalRequests.incrementAndGet();
            
            if (!success) {
                failedRequests.incrementAndGet();
                lastFailureTime.set(System.currentTimeMillis());
                
                if (state == CircuitBreakerState.CLOSED && 
                    failedRequests.get() >= FAILURE_THRESHOLD) {
                    // Open the circuit breaker
                    state = CircuitBreakerState.OPEN;
                    openUntil.set(System.currentTimeMillis() + OPEN_DURATION);
                }
            } else if (state == CircuitBreakerState.HALF_OPEN) {
                // Reset on success
                state = CircuitBreakerState.CLOSED;
                failedRequests.set(0);
            }
        }
        
        public void checkState() {
            if (state == CircuitBreakerState.OPEN && 
                System.currentTimeMillis() > openUntil.get()) {
                // Try to close the circuit breaker
                state = CircuitBreakerState.HALF_OPEN;
            }
        }
        
        public double getFailureRate() {
            int total = totalRequests.get();
            return total > 0 ? (double) failedRequests.get() / total : 0.0;
        }
        
        // Getters
        public String getServerId() { return serverId; }
        public CircuitBreakerState getState() { return state; }
        public int getTotalRequests() { return totalRequests.get(); }
        public int getFailedRequests() { return failedRequests.get(); }
    }
    
    public static class ScalingPolicy {
        private final double scaleUpThreshold;
        private final double scaleDownThreshold;
        private final int cooldownPeriod;
        
        public ScalingPolicy(double scaleUpThreshold, double scaleDownThreshold, int cooldownPeriod) {
            this.scaleUpThreshold = scaleUpThreshold;
            this.scaleDownThreshold = scaleDownThreshold;
            this.cooldownPeriod = cooldownPeriod;
        }
        
        // Getters
        public double getScaleUpThreshold() { return scaleUpThreshold; }
        public double getScaleDownThreshold() { return scaleDownThreshold; }
        public int getCooldownPeriod() { return cooldownPeriod; }
    }
    
    public static class ScalingDecision {
        private ScalingAction action;
        private int currentInstances;
        private int recommendedInstances;
        private double currentLoad;
        private String reason;
        private OffsetDateTime evaluatedAt;
        
        // Getters and setters
        public ScalingAction getAction() { return action; }
        public void setAction(ScalingAction action) { this.action = action; }
        public int getCurrentInstances() { return currentInstances; }
        public void setCurrentInstances(int currentInstances) { this.currentInstances = currentInstances; }
        public int getRecommendedInstances() { return recommendedInstances; }
        public void setRecommendedInstances(int recommendedInstances) { this.recommendedInstances = recommendedInstances; }
        public double getCurrentLoad() { return currentLoad; }
        public void setCurrentLoad(double currentLoad) { this.currentLoad = currentLoad; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public OffsetDateTime getEvaluatedAt() { return evaluatedAt; }
        public void setEvaluatedAt(OffsetDateTime evaluatedAt) { this.evaluatedAt = evaluatedAt; }
    }
    
    public static class ServerStats {
        private final ServerHealthStatus healthStatus;
        private final int totalRequests;
        private final double averageResponseTime;
        private final double successRate;
        private final CircuitBreakerState circuitBreakerState;
        private final double failureRate;
        
        public ServerStats(ServerHealthStatus healthStatus, int totalRequests,
                          double averageResponseTime, double successRate,
                          CircuitBreakerState circuitBreakerState, double failureRate) {
            this.healthStatus = healthStatus;
            this.totalRequests = totalRequests;
            this.averageResponseTime = averageResponseTime;
            this.successRate = successRate;
            this.circuitBreakerState = circuitBreakerState;
            this.failureRate = failureRate;
        }
        
        // Getters
        public ServerHealthStatus getHealthStatus() { return healthStatus; }
        public int getTotalRequests() { return totalRequests; }
        public double getAverageResponseTime() { return averageResponseTime; }
        public double getSuccessRate() { return successRate; }
        public CircuitBreakerState getCircuitBreakerState() { return circuitBreakerState; }
        public double getFailureRate() { return failureRate; }
    }
    
    public static class LoadBalancingStats {
        private final LoadBalancingStrategy strategy;
        private final Map<String, ServerStats> serverStats;
        private final int totalRequests;
        private final int successfulRequests;
        private final int failedRequests;
        private final int healthyServers;
        private final int currentInstances;
        private final OffsetDateTime timestamp;
        
        public LoadBalancingStats(LoadBalancingStrategy strategy, Map<String, ServerStats> serverStats,
                                 int totalRequests, int successfulRequests, int failedRequests,
                                 int healthyServers, int currentInstances, OffsetDateTime timestamp) {
            this.strategy = strategy;
            this.serverStats = serverStats;
            this.totalRequests = totalRequests;
            this.successfulRequests = successfulRequests;
            this.failedRequests = failedRequests;
            this.healthyServers = healthyServers;
            this.currentInstances = currentInstances;
            this.timestamp = timestamp;
        }
        
        // Getters
        public LoadBalancingStrategy getStrategy() { return strategy; }
        public Map<String, ServerStats> getServerStats() { return serverStats; }
        public int getTotalRequests() { return totalRequests; }
        public int getSuccessfulRequests() { return successfulRequests; }
        public int getFailedRequests() { return failedRequests; }
        public int getHealthyServers() { return healthyServers; }
        public int getCurrentInstances() { return currentInstances; }
        public OffsetDateTime getTimestamp() { return timestamp; }
        
        public double getOverallSuccessRate() {
            return totalRequests > 0 ? (double) successfulRequests / totalRequests : 0.0;
        }
    }
}
