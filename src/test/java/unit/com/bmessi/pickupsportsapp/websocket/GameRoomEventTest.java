package com.bmessi.pickupsportsapp.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GameRoomEventTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void participantJoined_hasSchemaVersion() throws Exception {
        GameRoomEvent event = new GameRoomEvent.ParticipantJoined("alice", 1L);
        String json = mapper.writeValueAsString(event);
        assertThat(mapper.readTree(json).has("schemaVersion")).isTrue();
    }

    @Test
    void capacityUpdate_hasSchemaVersion() throws Exception {
        GameRoomEvent event = new GameRoomEvent.CapacityUpdate(3, null);
        String json = mapper.writeValueAsString(event);
        assertThat(mapper.readTree(json).has("schemaVersion")).isTrue();
    }

    @Test
    void waitlistPromoted_hasSchemaVersion() throws Exception {
        GameRoomEvent event = new GameRoomEvent.WaitlistPromoted("bob", 2L);
        String json = mapper.writeValueAsString(event);
        assertThat(mapper.readTree(json).has("schemaVersion")).isTrue();
    }
}
