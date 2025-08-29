package com.bmessi.pickupsportsapp.realtime.event;

import lombok.Getter;

/**
 * Event fired for system-wide announcements.
 */
@Getter
public class SystemAnnouncementEvent extends RealTimeEvent {
    
    private final SystemAnnouncementPayload payload;

    public SystemAnnouncementEvent(String title, String message, String severity, String author) {
        super("system_announcement", EventPriority.URGENT, EventTarget.GLOBAL, 
              true, 604800L, null); // Persist for 7 days
        
        this.payload = new SystemAnnouncementPayload(title, message, severity, author);
    }

    @Override
    public String getRoutingKey() {
        return "global";
    }

    @Override
    public String getDestination() {
        return "/topic/announcements";
    }

    @Override
    public Object getPayload() {
        return payload;
    }

    @Getter
    public static class SystemAnnouncementPayload extends EventPayload {
        private final String title;
        private final String message;
        private final String severity; // INFO, WARNING, ERROR
        private final String author;
        private final long timestamp;
        private final String announcementId;

        public SystemAnnouncementPayload(String title, String message, String severity, String author) {
            this.title = title;
            this.message = message;
            this.severity = severity;
            this.author = author;
            this.timestamp = System.currentTimeMillis();
            this.announcementId = java.util.UUID.randomUUID().toString();
        }
    }
}
