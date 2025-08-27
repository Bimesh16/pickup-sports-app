package integration.com.bmessi.pickupsportsapp.controller;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=update")
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestMethodOrder(OrderAnnotation.class)
class RsvpIdempotencyIT {

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;

    Long gameId;
    Long bobId;

    @BeforeAll
    void init() {
        jdbc.update("DELETE FROM game_participants");
        jdbc.update("DELETE FROM game");
        jdbc.update("DELETE FROM app_user");
        jdbc.update("INSERT INTO app_user (username, password) VALUES (?, ?)", "bob@example.com", "x");
        bobId = jdbc.queryForObject("SELECT id FROM app_user WHERE username = ?", Long.class, "bob@example.com");
        OffsetDateTime t = OffsetDateTime.now(ZoneOffset.UTC).plusDays(1);
        jdbc.update("""
            INSERT INTO game (sport, location, time, user_id, capacity, waitlist_enabled)
            VALUES (?, ?, ?, ?, ?, ?)
            """, "Soccer", "Park A", java.sql.Timestamp.from(t.toInstant()), bobId, 5, false);
        gameId = jdbc.queryForObject("SELECT id FROM game ORDER BY id DESC LIMIT 1", Long.class);
    }

    @Test
    @Order(1)
    @DirtiesContext
    void joinStoresResult() throws Exception {
        mvc.perform(post("/games/{id}/join", gameId)
                .header("Idempotency-Key", "abc123")
                .with(user("bob@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.joined").value(true));
        Integer participants = jdbc.queryForObject("SELECT COUNT(*) FROM game_participants WHERE game_id = ?", Integer.class, gameId);
        assertThat(participants).isEqualTo(1);
    }

    @Test
    @Order(2)
    void replayAfterRestart() throws Exception {
        mvc.perform(post("/games/{id}/join", gameId)
                .header("Idempotency-Key", "abc123")
                .with(user("bob@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.joined").value(true));
        Integer participants = jdbc.queryForObject("SELECT COUNT(*) FROM game_participants WHERE game_id = ?", Integer.class, gameId);
        assertThat(participants).isEqualTo(1);
    }
}
