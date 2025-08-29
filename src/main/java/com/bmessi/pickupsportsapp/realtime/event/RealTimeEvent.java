package com.bmessi.pickupsportsapp.realtime.event;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Getter;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Base class for all real-time events in the pickup sports application.
 * 
 * Provides common structure for event identification, timing, routing, and payload.
 * All events are strongly typed for better type safety and easier handling.
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = GameParticipantJoinedEvent.class, name = "game_participant_joined"),
    @JsonSubTypes.Type(value = GameParticipantLeftEvent.class, name = "game_participant_left"),
    @JsonSubTypes.Type(value = GameStatusChangedEvent.class, name = "game_status_changed"),
    @JsonSubTypes.Type(value = GameUpdatedEvent.class, name = "game_updated"),
    @JsonSubTypes.Type(value = GameCancelledEvent.class, name = "game_cancelled"),
    @JsonSubTypes.Type(value = WaitlistPromotedEvent.class, name = "waitlist_promoted"),
    @JsonSubTypes.Type(value = ChatMessageEvent.class, name = "chat_message"),
    @JsonSubTypes.Type(value = UserPresenceEvent.class, name = "user_presence"),
    @JsonSubTypes.Type(value = NotificationEvent.class, name = "notification"),
    @JsonSubTypes.Type(value = SystemAnnouncementEvent.class, name = "system_announcement"),
    @JsonSubTypes.Type(value = LocationUpdateEvent.class, name = "location_update"),
    @JsonSubTypes.Type(value = ActivityFeedEvent.class, name = "activity_feed")
})
@Getter
public abstract class RealTimeEvent {
    
    /**
     * Unique identifier for this event instance
     */
    protected final String eventId;
    
    /**
     * Event type discriminator
     */
    protected final String type;
    
    /**
     * When this event was created
     */
    protected final Instant timestamp;
    
    /**
     * Event format version for backward compatibility
     */
    protected final int version;
    
    /**
     * Event priority for delivery ordering
     */
    protected final EventPriority priority;
    
    /**
     * Target audience for this event (room, user, global)
     */
    protected final EventTarget target;
    
    /**
     * Whether this event should be persisted for offline users
     */
    protected final boolean persistent;
    
    /**
     * Time-to-live for this event (seconds)
     */
    protected final Long ttlSeconds;
    
    /**
     * Additional metadata for the event
     */
    protected final Map<String, Object> metadata;

    protected RealTimeEvent(String type, EventPriority priority, EventTarget target, 
                           boolean persistent, Long ttlSeconds, Map<String, Object> metadata) {
        this.eventId = UUID.randomUUID().toString();
        this.type = type;
        this.timestamp = Instant.now();
        this.version = 1;
        this.priority = priority;
        this.target = target;
        this.persistent = persistent;
        this.ttlSeconds = ttlSeconds;
        this.metadata = metadata;
    }

    /**
     * Get the primary routing key for this event (e.g., gameId, userId)
     */
    public abstract String getRoutingKey();

    /**
     * Get the WebSocket destination topic for this event
     */
    public abstract String getDestination();

    /**
     * Get the event payload data
     */
    public abstract Object getPayload();

    /**
     * Check if this event has expired
     */
    public boolean isExpired() {
        if (ttlSeconds == null) return false;
        return timestamp.plusSeconds(ttlSeconds).isBefore(Instant.now());
    }

    /**
     * Event priority levels for delivery ordering
     */
    public enum EventPriority {
        LOW(1),
        NORMAL(2), 
        HIGH(3),
        URGENT(4);
        
        private final int level;
        
        EventPriority(int level) {
            this.level = level;
        }
        
        public int getLevel() {
            return level;
        }
    }

    /**
     * Event target types for routing
     */
    public enum EventTarget {
        /**
         * Send to all users in a specific game room
         */
        GAME_ROOM,
        
        /**
         * Send to a specific user
         */
        USER,
        
        /**
         * Send to all users in a geographic location
         */
        LOCATION,
        
        /**
         * Send to all connected users (system-wide)
         */
        GLOBAL,
        
        /**
         * Send to users with specific roles/permissions
         */
        ROLE_BASED,
        
        /**
         * Send to users matching custom criteria
         */
        CUSTOM
    }

    /**
     * Base data class for event payloads
     */
    public static abstract class EventPayload {
        // Common payload fields can be added here
    }
}