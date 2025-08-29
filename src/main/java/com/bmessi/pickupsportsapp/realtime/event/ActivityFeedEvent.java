package com.bmessi.pickupsportsapp.realtime.event;

import lombok.Getter;

/**
 * Event fired for activity feed updates.
 */
@Getter
public class ActivityFeedEvent extends RealTimeEvent {
    
    private final ActivityFeedPayload payload;

    public ActivityFeedEvent(String actorUsername, String action, String entityType, 
                            Long entityId, String description) {
        super("activity_feed", EventPriority.LOW, EventTarget.GLOBAL, 
              true, 604800L, null);
        
        this.payload = new ActivityFeedPayload(actorUsername, action, entityType, entityId, description);
    }

    @Override
    public String getRoutingKey() {
        return "activity";
    }

    @Override
    public String getDestination() {
        return "/topic/activity";
    }

    @Override
    public Object getPayload() {
        return payload;
    }

    @Getter
    public static class ActivityFeedPayload extends EventPayload {
        private final String actorUsername;
        private final String action; // JOINED_GAME, CREATED_GAME, etc.
        private final String entityType; // GAME, USER, etc.
        private final Long entityId;
        private final String description;
        private final long timestamp;
        private final String activityId;

        public ActivityFeedPayload(String actorUsername, String action, String entityType,
                                  Long entityId, String description) {
            this.actorUsername = actorUsername;
            this.action = action;
            this.entityType = entityType;
            this.entityId = entityId;
            this.description = description;
            this.timestamp = System.currentTimeMillis();
            this.activityId = java.util.UUID.randomUUID().toString();
        }
    }
}
