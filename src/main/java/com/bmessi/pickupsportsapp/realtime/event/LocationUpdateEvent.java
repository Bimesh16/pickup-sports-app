package com.bmessi.pickupsportsapp.realtime.event;

import lombok.Getter;

/**
 * Event fired for location-based updates (weather, venue changes, etc.).
 */
@Getter
public class LocationUpdateEvent extends RealTimeEvent {
    
    private final LocationUpdatePayload payload;

    public LocationUpdateEvent(String location, String updateType, String title, 
                              String message, String severity) {
        super("location_update", EventPriority.NORMAL, EventTarget.LOCATION, 
              true, 86400L, null);
        
        this.payload = new LocationUpdatePayload(location, updateType, title, message, severity);
    }

    @Override
    public String getRoutingKey() {
        return payload.location;
    }

    @Override
    public String getDestination() {
        return "/topic/location/" + payload.location;
    }

    @Override
    public Object getPayload() {
        return payload;
    }

    @Getter
    public static class LocationUpdatePayload extends EventPayload {
        private final String location;
        private final String updateType; // WEATHER, VENUE_CHANGE, TRAFFIC, etc.
        private final String title;
        private final String message;
        private final String severity;
        private final long timestamp;

        public LocationUpdatePayload(String location, String updateType, String title,
                                    String message, String severity) {
            this.location = location;
            this.updateType = updateType;
            this.title = title;
            this.message = message;
            this.severity = severity;
            this.timestamp = System.currentTimeMillis();
        }
    }
}