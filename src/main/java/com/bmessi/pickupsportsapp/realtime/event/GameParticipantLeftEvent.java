package com.bmessi.pickupsportsapp.realtime.event;

import lombok.Getter;

/**
 * Event fired when a user leaves a game (removes their RSVP).
 */
@Getter
public class GameParticipantLeftEvent extends RealTimeEvent {
    
    private final GameParticipantLeftPayload payload;

    public GameParticipantLeftEvent(Long gameId, String username, Long userId, 
                                   int newParticipantCount, Integer capacity, 
                                   boolean gameReopened, String promotedUsername) {
        super("game_participant_left", EventPriority.HIGH, EventTarget.GAME_ROOM, 
              true, 86400L, null);
        
        this.payload = new GameParticipantLeftPayload(gameId, username, userId, 
                                                     newParticipantCount, capacity, 
                                                     gameReopened, promotedUsername);
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
    public static class GameParticipantLeftPayload extends EventPayload {
        private final Long gameId;
        private final String username;
        private final Long userId;
        private final int participantCount;
        private final Integer capacity;
        private final boolean gameReopened;
        private final String promotedUsername; // User promoted from waitlist (if any)
        private final int remainingSlots;

        public GameParticipantLeftPayload(Long gameId, String username, Long userId, 
                                         int participantCount, Integer capacity, 
                                         boolean gameReopened, String promotedUsername) {
            this.gameId = gameId;
            this.username = username;
            this.userId = userId;
            this.participantCount = participantCount;
            this.capacity = capacity;
            this.gameReopened = gameReopened;
            this.promotedUsername = promotedUsername;
            this.remainingSlots = capacity != null ? Math.max(0, capacity - participantCount) : -1;
        }
    }
}