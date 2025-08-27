package unit.com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.controller.RsvpHoldController;
import com.bmessi.pickupsportsapp.service.game.HoldService;
import com.bmessi.pickupsportsapp.service.notification.NotificationService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RsvpHoldController.class)
@Import(RsvpHoldControllerWebMvcTest.TestBeans.class)
class RsvpHoldControllerWebMvcTest {

    @TestConfiguration
    static class TestBeans {
        @Bean JdbcTemplate jdbc() { return Mockito.mock(JdbcTemplate.class); }
        @Bean HoldService holdService() { return Mockito.mock(HoldService.class); }
        @Bean NotificationService notificationService() { return Mockito.mock(NotificationService.class); }
        @Bean SimpMessagingTemplate simpMessagingTemplate() { return Mockito.mock(SimpMessagingTemplate.class); }
    }

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired HoldService holdService;

    @Test
    @WithMockUser(username = "alice@example.com")
    void confirm_expired_returns410() throws Exception {
        Mockito.when(jdbc.queryForObject(eq("SELECT id FROM app_user WHERE username = ?"), eq(Long.class), any()))
                .thenReturn(1L);
        Mockito.when(holdService.confirmHold(eq(42L), eq(99L), eq(1L)))
                .thenReturn(new HoldService.ConfirmResult(false, "expired"));

        String payload = "{\"holdId\":99}";
        mvc.perform(post("/games/{id}/confirm", 42L)
                .contentType("application/json")
                .content(payload))
                .andExpect(status().isGone())
                .andExpect(header().string("Cache-Control", containsString("no-store")))
                .andExpect(jsonPath("$.error", is("hold_expired")))
                .andExpect(jsonPath("$.message", is("Hold expired")));
    }
}
