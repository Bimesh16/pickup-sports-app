package com.bmessi.pickupsportsapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
class RsvpControllerConcurrencyIT {

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;

    Long gameId;
    String[] emails;
    Long[] userIds;

    @BeforeEach
    void setup() {
        jdbc.update("DELETE FROM game_participants");
        jdbc.update("DELETE FROM game_waitlist");
        jdbc.update("DELETE FROM game");
        jdbc.update("DELETE FROM app_user");

        emails = new String[]{"owner@example.com", "u1@example.com", "u2@example.com", "u3@example.com", "u4@example.com", "u5@example.com"};
        userIds = new Long[emails.length];
        for (int i = 0; i < emails.length; i++) {
            jdbc.update("INSERT INTO app_user (username, password) VALUES (?, ?)", emails[i], "pw");
            userIds[i] = jdbc.queryForObject("SELECT id FROM app_user WHERE username = ?", Long.class, emails[i]);
        }

        OffsetDateTime t = OffsetDateTime.now(ZoneOffset.UTC).plusDays(1);
        jdbc.update("""
                INSERT INTO game (sport, location, time, user_id, capacity, waitlist_enabled)
                VALUES (?, ?, ?, ?, ?, ?)
                """, "Soccer", "Park", java.sql.Timestamp.from(t.toInstant()), userIds[0], 2, true);
        gameId = jdbc.queryForObject("SELECT id FROM game ORDER BY id DESC LIMIT 1", Long.class);
    }

    @Test
    void parallelJoins_respectCapacityAndWaitlist() throws Exception {
        ExecutorService exec = Executors.newFixedThreadPool(5);
        CountDownLatch latch = new CountDownLatch(1);

        List<Future<Integer>> futures = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            final String email = emails[i];
            futures.add(exec.submit(() -> {
                latch.await();
                return mvc.perform(post("/games/{id}/rsvp2", gameId).with(user(email)))
                        .andReturn()
                        .getResponse()
                        .getStatus();
            }));
        }
        latch.countDown();

        List<Integer> statuses = new ArrayList<>();
        for (Future<Integer> f : futures) {
            statuses.add(f.get(5, TimeUnit.SECONDS));
        }
        exec.shutdown();

        long ok = statuses.stream().filter(s -> s == 200).count();
        long accepted = statuses.stream().filter(s -> s == 202).count();
        assertThat(ok).isEqualTo(2);
        assertThat(accepted).isEqualTo(3);

        Integer participants = jdbc.queryForObject("SELECT COUNT(*) FROM game_participants WHERE game_id = ?", Integer.class, gameId);
        Integer waitlisted = jdbc.queryForObject("SELECT COUNT(*) FROM game_waitlist WHERE game_id = ?", Integer.class, gameId);
        assertThat(participants).isEqualTo(2);
        assertThat(waitlisted).isEqualTo(3);
    }

    @Test
    void parallelLeaves_promoteWaitlistExactlyOnce() throws Exception {
        mvc.perform(post("/games/{id}/rsvp2", gameId).with(user(emails[1]))).andExpect(status().isOk());
        mvc.perform(post("/games/{id}/rsvp2", gameId).with(user(emails[2]))).andExpect(status().isOk());
        mvc.perform(post("/games/{id}/rsvp2", gameId).with(user(emails[3]))).andExpect(status().isAccepted());
        mvc.perform(post("/games/{id}/rsvp2", gameId).with(user(emails[4]))).andExpect(status().isAccepted());

        ExecutorService exec = Executors.newFixedThreadPool(2);
        CountDownLatch latch = new CountDownLatch(1);

        List<Future<Integer>> promos = List.of(
                exec.submit(() -> {
                    latch.await();
                    String json = mvc.perform(delete("/games/{id}/rsvp2", gameId).with(user(emails[1])))
                            .andReturn()
                            .getResponse()
                            .getContentAsString();
                    return mapper.readTree(json).path("promoted").asInt();
                }),
                exec.submit(() -> {
                    latch.await();
                    String json = mvc.perform(delete("/games/{id}/rsvp2", gameId).with(user(emails[2])))
                            .andReturn()
                            .getResponse()
                            .getContentAsString();
                    return mapper.readTree(json).path("promoted").asInt();
                })
        );
        latch.countDown();

        int totalPromoted = 0;
        for (Future<Integer> f : promos) {
            totalPromoted += f.get(5, TimeUnit.SECONDS);
        }
        exec.shutdown();

        assertThat(totalPromoted).isEqualTo(2);

        Integer participants = jdbc.queryForObject("SELECT COUNT(*) FROM game_participants WHERE game_id = ?", Integer.class, gameId);
        Integer waitlisted = jdbc.queryForObject("SELECT COUNT(*) FROM game_waitlist WHERE game_id = ?", Integer.class, gameId);
        assertThat(participants).isEqualTo(2);
        assertThat(waitlisted).isEqualTo(0);

        List<Long> ids = jdbc.queryForList("SELECT user_id FROM game_participants WHERE game_id = ?", Long.class, gameId);
        assertThat(ids).containsExactlyInAnyOrder(userIds[3], userIds[4]);
    }
}

