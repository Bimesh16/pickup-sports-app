package com.bmessi.pickupsportsapp.realtime.event;

import lombok.Getter;

/**
 * Event fired when a new chat message is sent.
 */
@Getter
public class ChatMessageEvent extends RealTimeEvent {
    
    private final ChatMessagePayload payload;

    public ChatMessageEvent(Long gameId, String username, String message, String messageId) {
        super("chat_message", EventPriority.NORMAL, EventTarget.GAME_ROOM, 
              true, 604800L, null); // Persist for 7 days
        
        this.payload = new ChatMessagePayload(gameId, username, message, messageId);
    }

    @Override
    public String getRoutingKey() {
        return payload.gameId.toString();
    }

    @Override
    public String getDestination() {
        return "/topic/games/" + payload.gameId + "/chat";
    }

    @Override
    public Object getPayload() {
        return payload;
    }

    @Getter
    public static class ChatMessagePayload extends EventPayload {
        private final Long gameId;
        private final String username;
        private final String message;
        private final String messageId;
        private final long timestamp;

        public ChatMessagePayload(Long gameId, String username, String message, String messageId) {
            this.gameId = gameId;
            this.username = username;
            this.message = message;
            this.messageId = messageId;
            this.timestamp = System.currentTimeMillis();
        }
    }
}