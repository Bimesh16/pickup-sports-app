package com.bmessi.pickupsportsapp.realtime.service;

import com.bmessi.pickupsportsapp.realtime.event.RealTimeEvent;
import io.micrometer.core.instrument.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Service for collecting and managing metrics for the real-time event system.
 * 
 * Tracks performance, delivery rates, errors, and provides insights for monitoring
 * and optimization of the real-time communication system.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RealTimeEventMetricsService {

    private final MeterRegistry meterRegistry;
    
    // Counters for different event types
    private final Map<String, Counter> eventTypeCounters = new ConcurrentHashMap<>();
    private final Map<String, Timer> eventProcessingTimers = new ConcurrentHashMap<>();
    
    // Atomic counters for quick access
    private final AtomicLong totalPublishedEvents = new AtomicLong(0);
    private final AtomicLong totalDeliveredEvents = new AtomicLong(0);
    private final AtomicLong totalFailedEvents = new AtomicLong(0);
    private final AtomicLong totalRateLimitedEvents = new AtomicLong(0);
    private final AtomicLong totalFilteredEvents = new AtomicLong(0);
    private final AtomicLong activeSubscriptions = new AtomicLong(0);
    
    // Gauges for current state
    private final Gauge.Builder<AtomicLong> activeSubscriptionsGauge;
    private final Gauge.Builder<AtomicLong> publishedEventsGauge;
    private final Gauge.Builder<AtomicLong> deliveredEventsGauge;
    
    // Distribution summaries for event sizes and delivery times
    private final DistributionSummary eventSizeDistribution;
    private final Timer eventDeliveryTimer;
    private final Timer eventProcessingTimer;
    
    // Custom metrics
    private final Counter rateLimitedEventsCounter;
    private final Counter filteredEventsCounter;
    private final Counter failedDeliveriesCounter;
    private final Counter onlineUserDeliveriesCounter;
    private final Counter offlineUserDeliveriesCounter;

    public RealTimeEventMetricsService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        
        // Initialize gauges
        this.activeSubscriptionsGauge = Gauge.builder("realtime.subscriptions.active", activeSubscriptions, AtomicLong::doubleValue)
                                           .description("Number of active real-time subscriptions")
                                           .register(meterRegistry);
        
        this.publishedEventsGauge = Gauge.builder("realtime.events.published.total", totalPublishedEvents, AtomicLong::doubleValue)
                                       .description("Total number of published events")
                                       .register(meterRegistry);
        
        this.deliveredEventsGauge = Gauge.builder("realtime.events.delivered.total", totalDeliveredEvents, AtomicLong::doubleValue)
                                       .description("Total number of delivered events")
                                       .register(meterRegistry);
        
        // Initialize distribution summaries
        this.eventSizeDistribution = DistributionSummary.builder("realtime.event.size")
                                                       .description("Size of real-time events in bytes")
                                                       .register(meterRegistry);
        
        // Initialize timers
        this.eventDeliveryTimer = Timer.builder("realtime.event.delivery.duration")
                                      .description("Time taken to deliver real-time events")
                                      .register(meterRegistry);
        
        this.eventProcessingTimer = Timer.builder("realtime.event.processing.duration")
                                        .description("Time taken to process real-time events")
                                        .register(meterRegistry);
        
        // Initialize counters
        this.rateLimitedEventsCounter = Counter.builder("realtime.events.rate_limited")
                                             .description("Number of events rejected due to rate limiting")
                                             .register(meterRegistry);
        
        this.filteredEventsCounter = Counter.builder("realtime.events.filtered")
                                          .description("Number of events filtered out")
                                          .register(meterRegistry);
        
        this.failedDeliveriesCounter = Counter.builder("realtime.deliveries.failed")
                                            .description("Number of failed event deliveries")
                                            .register(meterRegistry);
        
        this.onlineUserDeliveriesCounter = Counter.builder("realtime.deliveries.online_users")
                                                .description("Number of deliveries to online users")
                                                .register(meterRegistry);
        
        this.offlineUserDeliveriesCounter = Counter.builder("realtime.deliveries.offline_users")
                                                 .description("Number of deliveries to offline users")
                                                 .register(meterRegistry);
    }

    /**
     * Increment the counter for published events.
     */
    public void incrementPublishedEvents() {
        totalPublishedEvents.incrementAndGet();
    }

    /**
     * Increment the counter for published events by event type.
     */
    public void incrementPublishedEvents(String eventType) {
        incrementPublishedEvents();
        getEventTypeCounter(eventType).increment();
    }

    /**
     * Increment the counter for delivered events.
     */
    public void incrementDeliveredEvents() {
        totalDeliveredEvents.incrementAndGet();
    }

    /**
     * Increment the counter for failed events.
     */
    public void incrementFailedEvents() {
        totalFailedEvents.incrementAndGet();
    }

    /**
     * Increment the counter for rate limited events.
     */
    public void incrementRateLimitedEvents() {
        totalRateLimitedEvents.incrementAndGet();
        rateLimitedEventsCounter.increment();
    }

    /**
     * Increment the counter for filtered events.
     */
    public void incrementFilteredEvents() {
        totalFilteredEvents.incrementAndGet();
        filteredEventsCounter.increment();
    }

    /**
     * Increment the counter for failed deliveries.
     */
    public void incrementFailedDeliveries() {
        failedDeliveriesCounter.increment();
    }

    /**
     * Increment active subscriptions counter.
     */
    public void incrementActiveSubscriptions() {
        activeSubscriptions.incrementAndGet();
    }

    /**
     * Decrement active subscriptions counter.
     */
    public void decrementActiveSubscriptions() {
        activeSubscriptions.decrementAndGet();
    }

    /**
     * Record event delivery metrics.
     */
    public void recordEventDelivery(RealTimeEvent event) {
        incrementDeliveredEvents();
        
        // Record event size (estimated)
        int estimatedSize = estimateEventSize(event);
        eventSizeDistribution.record(estimatedSize);
        
        // Record by event type
        getEventTypeCounter(event.getType()).increment();
        
        // Record delivery timing
        recordEventDeliveryTime(event);
    }

    /**
     * Record delivery to subscribers.
     */
    public void recordDeliveryToSubscribers(int subscriberCount) {
        for (int i = 0; i < subscriberCount; i++) {
            incrementDeliveredEvents();
        }
    }

    /**
     * Record user delivery (online vs offline).
     */
    public void recordUserDelivery(boolean isOnline) {
        if (isOnline) {
            onlineUserDeliveriesCounter.increment();
        } else {
            offlineUserDeliveriesCounter.increment();
        }
        incrementDeliveredEvents();
    }

    /**
     * Record global delivery.
     */
    public void recordGlobalDelivery(int userCount) {
        for (int i = 0; i < userCount; i++) {
            incrementDeliveredEvents();
        }
    }

    /**
     * Time event processing duration.
     */
    public Timer.Sample startProcessingTimer() {
        return Timer.start(meterRegistry);
    }

    /**
     * Stop processing timer and record the result.
     */
    public void stopProcessingTimer(Timer.Sample sample, String eventType) {
        sample.stop(getEventProcessingTimer(eventType));
    }

    /**
     * Time event delivery duration.
     */
    public Timer.Sample startDeliveryTimer() {
        return Timer.start(meterRegistry);
    }

    /**
     * Stop delivery timer and record the result.
     */
    public void stopDeliveryTimer(Timer.Sample sample) {
        sample.stop(eventDeliveryTimer);
    }

    /**
     * Get comprehensive metrics data.
     */
    public Map<String, Object> getMetrics() {
        Map<String, Object> metrics = new ConcurrentHashMap<>();
        
        // Basic counters
        metrics.put("totalPublishedEvents", totalPublishedEvents.get());
        metrics.put("totalDeliveredEvents", totalDeliveredEvents.get());
        metrics.put("totalFailedEvents", totalFailedEvents.get());
        metrics.put("totalRateLimitedEvents", totalRateLimitedEvents.get());
        metrics.put("totalFilteredEvents", totalFilteredEvents.get());
        metrics.put("activeSubscriptions", activeSubscriptions.get());
        
        // Success rate
        long published = totalPublishedEvents.get();
        long delivered = totalDeliveredEvents.get();
        double successRate = published > 0 ? (double) delivered / published * 100 : 0;
        metrics.put("deliverySuccessRate", successRate);
        
        // Event type breakdown
        Map<String, Double> eventTypeStats = new ConcurrentHashMap<>();
        eventTypeCounters.forEach((type, counter) -> 
            eventTypeStats.put(type, counter.count()));
        metrics.put("eventTypeBreakdown", eventTypeStats);
        
        // Performance metrics
        metrics.put("averageEventSize", eventSizeDistribution.mean());
        metrics.put("averageDeliveryTime", eventDeliveryTimer.mean(java.util.concurrent.TimeUnit.MILLISECONDS));
        metrics.put("averageProcessingTime", eventProcessingTimer.mean(java.util.concurrent.TimeUnit.MILLISECONDS));
        
        // Throughput (events per second - approximate)
        metrics.put("estimatedThroughput", calculateThroughput());
        
        metrics.put("lastUpdated", Instant.now());
        
        return metrics;
    }

    /**
     * Get or create event type counter.
     */
    private Counter getEventTypeCounter(String eventType) {
        return eventTypeCounters.computeIfAbsent(eventType, type ->
            Counter.builder("realtime.events.by_type")
                  .description("Number of events by type")
                  .tag("event_type", type)
                  .register(meterRegistry));
    }

    /**
     * Get or create event processing timer by type.
     */
    private Timer getEventProcessingTimer(String eventType) {
        return eventProcessingTimers.computeIfAbsent(eventType, type ->
            Timer.builder("realtime.event.processing.duration.by_type")
                 .description("Event processing duration by type")
                 .tag("event_type", type)
                 .register(meterRegistry));
    }

    /**
     * Record event delivery timing.
     */
    private void recordEventDeliveryTime(RealTimeEvent event) {
        // Calculate time since event creation
        long deliveryTimeMs = Instant.now().toEpochMilli() - event.getTimestamp().toEpochMilli();
        eventDeliveryTimer.record(deliveryTimeMs, java.util.concurrent.TimeUnit.MILLISECONDS);
    }

    /**
     * Estimate event size in bytes.
     */
    private int estimateEventSize(RealTimeEvent event) {
        // Rough estimation based on event type and payload
        int baseSize = 200; // Base overhead
        int typeSize = event.getType().length() * 2; // Rough UTF-8 estimation
        int payloadSize = estimatePayloadSize(event.getPayload());
        
        return baseSize + typeSize + payloadSize;
    }

    /**
     * Estimate payload size.
     */
    private int estimatePayloadSize(Object payload) {
        if (payload == null) return 0;
        
        // Very rough estimation - in practice, you might serialize and measure
        String payloadStr = payload.toString();
        return payloadStr.length() * 2; // Rough UTF-8 estimation
    }

    /**
     * Calculate approximate throughput.
     */
    private double calculateThroughput() {
        // This is a simplified calculation
        // In practice, you'd track events over time windows
        long delivered = totalDeliveredEvents.get();
        if (delivered == 0) return 0.0;
        
        // Assume we've been running for at least 1 minute
        return delivered / 60.0; // Events per second over last minute (rough estimate)
    }

    /**
     * Reset metrics (for testing or maintenance).
     */
    public void resetMetrics() {
        totalPublishedEvents.set(0);
        totalDeliveredEvents.set(0);
        totalFailedEvents.set(0);
        totalRateLimitedEvents.set(0);
        totalFilteredEvents.set(0);
        activeSubscriptions.set(0);
        
        log.info("Real-time event metrics reset");
    }
}
