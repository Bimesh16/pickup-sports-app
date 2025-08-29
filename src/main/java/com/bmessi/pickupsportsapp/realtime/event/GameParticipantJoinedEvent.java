package com.bmessi.pickupsportsapp.realtime.event;

import lombok.Getter;

import java.util.Map;

/**
 * Event fired when a user joins a game as a participant.
 */
@Getter
public class GameParticipantJoinedEvent extends RealTimeEvent {
    
    private final GameParticipantPayload payload;

    public GameParticipantJoinedEvent(Long gameId, String username, Long userId, 
                                     int newParticipantCount, Integer capacity, 
                                     boolean gameNowFull) {
        super("game_participant_joined", EventPriority.HIGH, EventTarget.GAME_ROOM, 
              true, 86400L, null); // Persist for 24 hours
        
        this.payload = new GameParticipantPayload(gameId, username, userId, 
                                                 newParticipantCount, capacity, gameNowFull);
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
    public static class GameParticipantPayload extends EventPayload {
        private final Long gameId;
        private final String username;
        private final Long userId;
        private final int participantCount;
        private final Integer capacity;
        private final boolean gameNowFull;
        private final int remainingSlots;

        public GameParticipantPayload(Long gameId, String username, Long userId, 
                                     int participantCount, Integer capacity, boolean gameNowFull) {
            this.gameId = gameId;
            this.username = username;
            this.userId = userId;
            this.participantCount = participantCount;
            this.capacity = capacity;
            this.gameNowFull = gameNowFull;
            this.remainingSlots = capacity != null ? Math.max(0, capacity - participantCount) : -1;
        }
    }
}
