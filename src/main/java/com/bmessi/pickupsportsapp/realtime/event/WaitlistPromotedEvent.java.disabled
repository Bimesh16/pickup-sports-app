package com.bmessi.pickupsportsapp.realtime.event;

import lombok.Getter;

/**
 * Event fired when a user is promoted from waitlist to participant.
 */
@Getter
public class WaitlistPromotedEvent extends RealTimeEvent {
    
    private final WaitlistPromotedPayload payload;

    public WaitlistPromotedEvent(Long gameId, String promotedUsername, Long promotedUserId,
                                int newParticipantCount, Integer capacity, int newWaitlistCount) {
        super("waitlist_promoted", EventPriority.HIGH, EventTarget.GAME_ROOM, 
              true, 86400L, null);
        
        this.payload = new WaitlistPromotedPayload(gameId, promotedUsername, promotedUserId,
                                                  newParticipantCount, capacity, newWaitlistCount);
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
    public static class WaitlistPromotedPayload extends EventPayload {
        private final Long gameId;
        private final String promotedUsername;
        private final Long promotedUserId;
        private final int participantCount;
        private final Integer capacity;
        private final int waitlistCount;
        private final int remainingSlots;
        private final long timestamp;

        public WaitlistPromotedPayload(Long gameId, String promotedUsername, Long promotedUserId,
                                      int participantCount, Integer capacity, int waitlistCount) {
            this.gameId = gameId;
            this.promotedUsername = promotedUsername;
            this.promotedUserId = promotedUserId;
            this.participantCount = participantCount;
            this.capacity = capacity;
            this.waitlistCount = waitlistCount;
            this.remainingSlots = capacity != null ? Math.max(0, capacity - participantCount) : -1;
            this.timestamp = System.currentTimeMillis();
        }
    }
}