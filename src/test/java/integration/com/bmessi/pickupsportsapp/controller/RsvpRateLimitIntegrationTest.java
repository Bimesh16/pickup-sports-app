package integration.com.bmessi.pickupsportsapp.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class RsvpRateLimitIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;

    Long gameId;

    @BeforeEach
    void setup() {
        jdbc.update("DELETE FROM game_participants");
        jdbc.update("DELETE FROM game_waitlist");
        jdbc.update("DELETE FROM game");
        jdbc.update("DELETE FROM app_user");

        jdbc.update("INSERT INTO app_user (username, password) VALUES (?, ?)", "alice@example.com", "x");
        Long aliceId = jdbc.queryForObject("SELECT id FROM app_user WHERE username = ?", Long.class, "alice@example.com");

        java.time.OffsetDateTime t = java.time.OffsetDateTime.now(java.time.ZoneOffset.UTC).plusDays(1);
        jdbc.update("""
            INSERT INTO game (sport, location, time, user_id, capacity, waitlist_enabled)
            VALUES (?, ?, ?, ?, ?, ?)
            """, "Soccer", "Park A", java.sql.Timestamp.from(t.toInstant()), aliceId, 5, true);
        gameId = jdbc.queryForObject("SELECT id FROM game ORDER BY id DESC LIMIT 1", Long.class);
    }

    @Test
    void joinRateLimitExceeded() throws Exception {
        for (int i = 0; i < 4; i++) {
            mvc.perform(post("/games/{id}/join", gameId).with(user("alice@example.com")))
                    .andReturn();
        }
        mvc.perform(post("/games/{id}/join", gameId).with(user("alice@example.com")))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string("Retry-After", "10"))
                .andExpect(jsonPath("$.error").value("too_many_requests"))
                .andExpect(jsonPath("$.retryAfter").value(10));
    }

    @Test
    void leaveRateLimitExceeded() throws Exception {
        mvc.perform(post("/games/{id}/join", gameId).with(user("alice@example.com")))
                .andExpect(status().isOk());

        for (int i = 0; i < 4; i++) {
            mvc.perform(delete("/games/{id}/leave", gameId).with(user("alice@example.com")))
                    .andReturn();
        }
        mvc.perform(delete("/games/{id}/leave", gameId).with(user("alice@example.com")))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string("Retry-After", "10"))
                .andExpect(jsonPath("$.error").value("too_many_requests"))
                .andExpect(jsonPath("$.retryAfter").value(10));
    }
}
