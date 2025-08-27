package integration.com.bmessi.pickupsportsapp.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
class RsvpControllerIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;

    Long gameId;
    Long aliceId;
    Long bobId;

    @BeforeEach
    void setup() {
        // Clean state
        jdbc.update("DELETE FROM game_participants");
        jdbc.update("DELETE FROM game_waitlist");
        jdbc.update("DELETE FROM game");
        jdbc.update("DELETE FROM app_user");

        // Seed users
        jdbc.update("INSERT INTO app_user (username, password) VALUES (?, ?)", "alice@example.com", "x");
        jdbc.update("INSERT INTO app_user (username, password) VALUES (?, ?)", "bob@example.com", "x");
        aliceId = jdbc.queryForObject("SELECT id FROM app_user WHERE username = ?", Long.class, "alice@example.com");
        bobId = jdbc.queryForObject("SELECT id FROM app_user WHERE username = ?", Long.class, "bob@example.com");

        // Seed game with capacity=1, waitlist enabled, start time in future
        OffsetDateTime t = OffsetDateTime.now(ZoneOffset.UTC).plusDays(1);
        jdbc.update("""
            INSERT INTO game (sport, location, time, user_id, capacity, waitlist_enabled)
            VALUES (?, ?, ?, ?, ?, ?)
            """, "Soccer", "Park A", java.sql.Timestamp.from(t.toInstant()), aliceId, 1, true);
        gameId = jdbc.queryForObject("SELECT id FROM game ORDER BY id DESC LIMIT 1", Long.class);
    }

    @Test
    void rsvp_waitlist_and_promotion_flow() throws Exception {
        // Alice joins (as authenticated alice)
        mvc.perform(post("/games/{id}/rsvp2", gameId).with(user("alice@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.joined").value(true))
                .andExpect(jsonPath("$.waitlisted").value(false));

        // Bob attempts to join -> should be waitlisted
        mvc.perform(post("/games/{id}/rsvp2", gameId).with(user("bob@example.com")))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.joined").value(false))
                .andExpect(jsonPath("$.waitlisted").value(true));

        // Alice unRSVPs -> bob should be promoted
        mvc.perform(delete("/games/{id}/rsvp2", gameId).with(user("alice@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.promoted").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));

        // Verify DB: bob is participant, waitlist empty
        Integer participants = jdbc.queryForObject("SELECT COUNT(*) FROM game_participants WHERE game_id = ?", Integer.class, gameId);
        Integer waitlisted = jdbc.queryForObject("SELECT COUNT(*) FROM game_waitlist WHERE game_id = ?", Integer.class, gameId);
        assertThat(participants).isEqualTo(1);
        assertThat(waitlisted).isEqualTo(0);
    }
}
