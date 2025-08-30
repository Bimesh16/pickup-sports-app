package com.bmessi.pickupsportsapp.realtime.event;

import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Event fired when game details are updated (time, location, description, etc.).
 */
@Getter
public class GameUpdatedEvent extends RealTimeEvent {
    
    private final GameUpdatedPayload payload;

    public GameUpdatedEvent(Long gameId, String updatedBy, List<String> changedFields, 
                           String newTime, String newLocation, String newDescription) {
        super("game_updated", EventPriority.HIGH, EventTarget.GAME_ROOM, 
              true, 86400L, null);
        
        this.payload = new GameUpdatedPayload(gameId, updatedBy, changedFields, 
                                             newTime, newLocation, newDescription);
    }

    @Override
    public String getRoutingKey() {
        return payload.gameId.toString();
    }

    @Override
    public String getDestination() {
        return "/topic/games/" + payload.gameId;
    }

    @Override
    public Object getPayload() {
        return payload;
    }

    @Getter
    public static class GameUpdatedPayload extends EventPayload {
        private final Long gameId;
        private final String updatedBy;
        private final List<String> changedFields;
        private final String newTime;
        private final String newLocation;
        private final String newDescription;
        private final long timestamp;

        public GameUpdatedPayload(Long gameId, String updatedBy, List<String> changedFields,
                                 String newTime, String newLocation, String newDescription) {
            this.gameId = gameId;
            this.updatedBy = updatedBy;
            this.changedFields = changedFields;
            this.newTime = newTime;
            this.newLocation = newLocation;
            this.newDescription = newDescription;
            this.timestamp = System.currentTimeMillis();
        }
    }
}