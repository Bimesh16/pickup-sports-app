package unit.com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.controller.GameWaitlistController;
import com.bmessi.pickupsportsapp.service.game.WaitlistService;
import com.bmessi.pickupsportsapp.service.notification.NotificationService;
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

import java.util.Collections;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GameWaitlistController.class)
@Import(GameWaitlistControllerWebMvcTest.TestBeans.class)
class GameWaitlistControllerWebMvcTest {

    @TestConfiguration
    static class TestBeans {
        @Bean JdbcTemplate jdbc() { return Mockito.mock(JdbcTemplate.class); }
        @Bean WaitlistService waitlistService() { return Mockito.mock(WaitlistService.class); }
        @Bean NotificationService notificationService() { return Mockito.mock(NotificationService.class); }
    }

    @Autowired MockMvc mvc;
    @Autowired WaitlistService waitlistService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void promote_empty_returns409() throws Exception {
        Mockito.when(waitlistService.promoteUpTo(eq(42L), anyInt()))
                .thenReturn(Collections.emptyList());

        mvc.perform(post("/games/{id}/waitlist/promote", 42L))
                .andExpect(status().isConflict())
                .andExpect(header().string("Cache-Control", containsString("no-store")))
                .andExpect(jsonPath("$.error", is("rsvp_closed")))
                .andExpect(jsonPath("$.message", containsString("No waitlisted users")));
    }
}
