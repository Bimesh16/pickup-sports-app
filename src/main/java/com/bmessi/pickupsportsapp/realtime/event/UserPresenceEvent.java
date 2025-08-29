package com.bmessi.pickupsportsapp.realtime.event;

import lombok.Getter;

/**
 * Event fired when user presence changes (online, offline, viewing game, etc.).
 */
@Getter
public class UserPresenceEvent extends RealTimeEvent {
    
    private final UserPresencePayload payload;

    public UserPresenceEvent(Long gameId, String username, PresenceStatus status, 
                            long totalOnlineCount) {
        super("user_presence", EventPriority.LOW, EventTarget.GAME_ROOM, 
              false, 300L, null); // Short TTL for presence events
        
        this.payload = new UserPresencePayload(gameId, username, status, totalOnlineCount);
    }

    @Override
    public String getRoutingKey() {
        return payload.gameId != null ? payload.gameId.toString() : "global";
    }

    @Override
    public String getDestination() {
        return payload.gameId != null ? 
               "/topic/games/" + payload.gameId + "/presence" : 
               "/topic/presence";
    }

    @Override
    public Object getPayload() {
        return payload;
    }

    @Getter
    public static class UserPresencePayload extends EventPayload {
        private final Long gameId; // null for global presence
        private final String username;
        private final PresenceStatus status;
        private final long onlineCount;
        private final long timestamp;

        public UserPresencePayload(Long gameId, String username, PresenceStatus status, 
                                  long onlineCount) {
            this.gameId = gameId;
            this.username = username;
            this.status = status;
            this.onlineCount = onlineCount;
            this.timestamp = System.currentTimeMillis();
        }
    }

    public enum PresenceStatus {
        ONLINE,
        OFFLINE,
        VIEWING_GAME,
        TYPING,
        AWAY,
        BUSY
    }
}
