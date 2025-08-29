package com.bmessi.pickupsportsapp.realtime.event;

import lombok.Getter;

/**
 * Event fired when a game's status changes (DRAFT -> PUBLISHED, PUBLISHED -> FULL, etc.).
 */
@Getter
public class GameStatusChangedEvent extends RealTimeEvent {
    
    private final GameStatusPayload payload;

    public GameStatusChangedEvent(Long gameId, String oldStatus, String newStatus, 
                                 String reason, String changedBy) {
        super("game_status_changed", EventPriority.HIGH, EventTarget.GAME_ROOM, 
              true, 86400L, null);
        
        this.payload = new GameStatusPayload(gameId, oldStatus, newStatus, reason, changedBy);
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
    public static class GameStatusPayload extends EventPayload {
        private final Long gameId;
        private final String oldStatus;
        private final String newStatus;
        private final String reason;
        private final String changedBy;
        private final long timestamp;

        public GameStatusPayload(Long gameId, String oldStatus, String newStatus, 
                                String reason, String changedBy) {
            this.gameId = gameId;
            this.oldStatus = oldStatus;
            this.newStatus = newStatus;
            this.reason = reason;
            this.changedBy = changedBy;
            this.timestamp = System.currentTimeMillis();
        }
    }
}