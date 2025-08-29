package com.bmessi.pickupsportsapp.realtime.event;

import lombok.Getter;

/**
 * Event fired when a game is cancelled.
 */
@Getter
public class GameCancelledEvent extends RealTimeEvent {
    
    private final GameCancelledPayload payload;

    public GameCancelledEvent(Long gameId, String cancelledBy, String reason, 
                             String sport, String location, String originalTime) {
        super("game_cancelled", EventPriority.URGENT, EventTarget.GAME_ROOM, 
              true, 604800L, null); // Persist for 7 days
        
        this.payload = new GameCancelledPayload(gameId, cancelledBy, reason, 
                                               sport, location, originalTime);
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
    public static class GameCancelledPayload extends EventPayload {
        private final Long gameId;
        private final String cancelledBy;
        private final String reason;
        private final String sport;
        private final String location;
        private final String originalTime;
        private final long timestamp;

        public GameCancelledPayload(Long gameId, String cancelledBy, String reason,
                                   String sport, String location, String originalTime) {
            this.gameId = gameId;
            this.cancelledBy = cancelledBy;
            this.reason = reason;
            this.sport = sport;
            this.location = location;
            this.originalTime = originalTime;
            this.timestamp = System.currentTimeMillis();
        }
    }
}
