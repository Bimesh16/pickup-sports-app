package com.bmessi.pickupsportsapp.realtime.event;

import lombok.Getter;

/**
 * Event fired when a notification is sent to a user.
 */
@Getter
public class NotificationEvent extends RealTimeEvent {
    
    private final NotificationPayload payload;

    public NotificationEvent(String targetUsername, String title, String message, 
                           String notificationType, String clickUrl) {
        super("notification", EventPriority.HIGH, EventTarget.USER, 
              true, 2592000L, null); // Persist for 30 days
        
        this.payload = new NotificationPayload(targetUsername, title, message, 
                                              notificationType, clickUrl);
    }

    @Override
    public String getRoutingKey() {
        return payload.targetUsername;
    }

    @Override
    public String getDestination() {
        return "/user/" + payload.targetUsername + "/notifications";
    }

    @Override
    public Object getPayload() {
        return payload;
    }

    @Getter
    public static class NotificationPayload extends EventPayload {
        private final String targetUsername;
        private final String title;
        private final String message;
        private final String notificationType;
        private final String clickUrl;
        private final long timestamp;
        private final String notificationId;

        public NotificationPayload(String targetUsername, String title, String message,
                                  String notificationType, String clickUrl) {
            this.targetUsername = targetUsername;
            this.title = title;
            this.message = message;
            this.notificationType = notificationType;
            this.clickUrl = clickUrl;
            this.timestamp = System.currentTimeMillis();
            this.notificationId = java.util.UUID.randomUUID().toString();
        }
    }
}
