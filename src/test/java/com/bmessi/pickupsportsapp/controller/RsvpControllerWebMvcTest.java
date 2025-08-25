package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.NotificationDispatcher;
import com.bmessi.pickupsportsapp.service.game.CapacityManager;
import com.bmessi.pickupsportsapp.service.game.WaitlistService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RsvpController.class)
@Import(RsvpControllerWebMvcTest.TestBeans.class)
class RsvpControllerWebMvcTest {

    @TestConfiguration
    static class TestBeans {
        @Bean JdbcTemplate jdbc() { return org.mockito.Mockito.mock(JdbcTemplate.class); }
        @Bean CapacityManager capacityManager() { return org.mockito.Mockito.mock(CapacityManager.class); }
        @Bean WaitlistService waitlistService() { return org.mockito.Mockito.mock(WaitlistService.class); }
        @Bean NotificationDispatcher dispatcher() { return org.mockito.Mockito.mock(NotificationDispatcher.class); }
    }

    @Autowired MockMvc mvc;

    @Autowired JdbcTemplate jdbc;
    @Autowired CapacityManager capacityManager;
    @Autowired WaitlistService waitlistService;
    @Autowired NotificationDispatcher dispatcher;

    @Test
    @WithMockUser(username = "alice@example.com")
    void rsvp2_success_returnsDto() throws Exception {
        Mockito.when(jdbc.queryForObject(eq("SELECT id FROM app_user WHERE username = ?"), eq(Long.class), any()))
                .thenReturn(1L);
        Mockito.when(capacityManager.enforceOnRsvp(eq(42L), eq(1L)))
                .thenReturn(new CapacityManager.Decision(true, false, "ok"));
        Mockito.when(jdbc.update(anyString(), any(), any())).thenReturn(1);

        mvc.perform(post("/games/{id}/rsvp2", 42L))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", containsString("no-store")))
                .andExpect(jsonPath("$.joined", is(true)))
                .andExpect(jsonPath("$.waitlisted", is(false)))
                .andExpect(jsonPath("$.message", anyOf(is("ok"), is("already_participant"))));
    }

    @Test
    @WithMockUser(username = "alice@example.com")
    void unrsvp2_success_returnsDto() throws Exception {
        Mockito.when(jdbc.queryForObject(eq("SELECT id FROM app_user WHERE username = ?"), eq(Long.class), any()))
                .thenReturn(1L);
        Mockito.when(jdbc.update(org.mockito.ArgumentMatchers.startsWith("DELETE FROM game_participants"), any(), any())).thenReturn(1);
        // Make gameMeta fail to avoid deeper DB mapping – controller treats it as null and proceeds
        Mockito.when(jdbc.queryForObject(
                        Mockito.argThat((String sql) -> sql != null && sql.contains("FROM game WHERE id = ?")),
                        org.mockito.Mockito.<org.springframework.jdbc.core.RowMapper<?>>any(),
                        org.mockito.ArgumentMatchers.any()
                ))
                .thenThrow(new RuntimeException("skip meta"));

        mvc.perform(delete("/games/{id}/rsvp2", 42L))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", containsString("no-store")))
                .andExpect(jsonPath("$.removed", is(true)))
                .andExpect(jsonPath("$.promoted", is(greaterThanOrEqualTo(0))));
    }
}
