package com.bmessi.pickupsportsapp.websocket;

/**
 * Base class for game room WebSocket events.
 * Carries a schema version and creation timestamp.
 */
public abstract class GameRoomEvent {

    private final int schemaVersion = 1;
    private final long timestamp;

    protected GameRoomEvent() {
        this.timestamp = System.currentTimeMillis();
    }

    public int getSchemaVersion() {
        return schemaVersion;
    }

    public long getTimestamp() {
        return timestamp;
    }

    /** Event: a participant joined the game. */
    public static class ParticipantJoined extends GameRoomEvent {
        private final String type = "participant_joined";
        private final Data data;

        public ParticipantJoined(String user, Long userId) {
            this.data = new Data(user, userId);
        }

        public String getType() {
            return type;
        }

        public Data getData() {
            return data;
        }

        public record Data(String user, Long userId) {}
    }

    /** Event: a waitlisted user was promoted. */
    public static class WaitlistPromoted extends GameRoomEvent {
        private final String type = "waitlist_promoted";
        private final Data data;

        public WaitlistPromoted(String user, Long userId) {
            this.data = new Data(user, userId);
        }

        public String getType() {
            return type;
        }

        public Data getData() {
            return data;
        }

        public record Data(String user, Long userId) {}
    }

    /** Event: capacity information changed for the game. */
    public static class CapacityUpdate extends GameRoomEvent {
        private final String type = "capacity_update";
        private final Data data;

        public CapacityUpdate(int remainingSlots, String hint) {
            this.data = new Data(remainingSlots, hint);
        }

        public String getType() {
            return type;
        }

        public Data getData() {
            return data;
        }

        public record Data(int remainingSlots, String hint) {}
    }

    /** Generic event for types without dedicated classes. */
    public static class Generic extends GameRoomEvent {
        private final String type;
        private final java.util.Map<String, Object> data;

        public Generic(String type, java.util.Map<String, Object> data) {
            this.type = type;
            this.data = data;
        }

        public String getType() {
            return type;
        }

        public java.util.Map<String, Object> getData() {
            return data;
        }
    }
}

