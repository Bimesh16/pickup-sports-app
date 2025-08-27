package unit.com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.controller.RsvpController;
import com.bmessi.pickupsportsapp.service.notification.NotificationService;
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
        @Bean NotificationService notificationService() { return org.mockito.Mockito.mock(NotificationService.class); }
    }

    @Autowired MockMvc mvc;

    @Autowired JdbcTemplate jdbc;
    @Autowired CapacityManager capacityManager;
    @Autowired WaitlistService waitlistService;
    @Autowired NotificationService notificationService;

    @Test
    @WithMockUser(username = "alice@example.com")
    void rsvp2_success_returnsDto() throws Exception {
        Mockito.when(jdbc.queryForObject(eq("SELECT id FROM app_user WHERE username = ?"), eq(Long.class), any()))
                .thenReturn(1L);
        Mockito.when(capacityManager.join(eq(42L), eq(1L)))
                .thenReturn(new CapacityManager.JoinResult(true, false, "ok", 0));

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

    @Test
    @WithMockUser(username = "alice@example.com")
    void rsvp2_waitlisted_returns202() throws Exception {
        Mockito.when(jdbc.queryForObject(eq("SELECT id FROM app_user WHERE username = ?"), eq(Long.class), any()))
                .thenReturn(1L);
        Mockito.when(capacityManager.join(eq(42L), eq(1L)))
                .thenReturn(new CapacityManager.JoinResult(false, true, "waitlisted", 0));

        mvc.perform(post("/games/{id}/rsvp2", 42L))
                .andExpect(status().isAccepted())
                .andExpect(header().string("Cache-Control", containsString("no-store")))
                .andExpect(jsonPath("$.joined", is(false)))
                .andExpect(jsonPath("$.waitlisted", is(true)))
                .andExpect(jsonPath("$.message", is("waitlisted")));
    }

    @Test
    @WithMockUser(username = "alice@example.com")
    void rsvp2_full_returns409() throws Exception {
        Mockito.when(jdbc.queryForObject(eq("SELECT id FROM app_user WHERE username = ?"), eq(Long.class), any()))
                .thenReturn(1L);
        Mockito.when(capacityManager.join(eq(42L), eq(1L)))
                .thenReturn(new CapacityManager.JoinResult(false, false, "full", 0));

        mvc.perform(post("/games/{id}/rsvp2", 42L))
                .andExpect(status().isConflict())
                .andExpect(header().string("Cache-Control", containsString("no-store")))
                .andExpect(jsonPath("$.error", is("game_full")))
                .andExpect(jsonPath("$.message", is("No slots available")));
    }

    @Test
    @WithMockUser(username = "alice@example.com")
    void rsvp2_cutoff_returns409() throws Exception {
        Mockito.when(jdbc.queryForObject(eq("SELECT id FROM app_user WHERE username = ?"), eq(Long.class), any()))
                .thenReturn(1L);
        Mockito.when(capacityManager.join(eq(42L), eq(1L)))
                .thenReturn(new CapacityManager.JoinResult(false, false, "cutoff", 0));

        mvc.perform(post("/games/{id}/rsvp2", 42L))
                .andExpect(status().isConflict())
                .andExpect(header().string("Cache-Control", containsString("no-store")))
                .andExpect(jsonPath("$.error", is("rsvp_closed")))
                .andExpect(jsonPath("$.message", is("RSVP cutoff has passed")));
    }
}
