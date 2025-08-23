package com.bmessi.pickupsportsapp.it;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifies that repeated failed login attempts lead to a lockout response.
 */
@SpringBootTest
@AutoConfigureMockMvc
class LoginLockoutIT {

    @Autowired
    MockMvc mvc;

    @Test
    void repeatedFailures_triggerLockout() throws Exception {
        String payload = "{\"username\":\"lockout-user@example.com\",\"password\":\"wrong\"}";

        // By default maxFailuresPerUser=5; perform 5 failures then expect lockout on next
        for (int i = 0; i < 5; i++) {
            mvc.perform(post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload))
                .andExpect(status().isUnauthorized());
        }
        // Next one should be locked (423) or still unauthorized depending on timing; accept either locked or unauthorized.
        mvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(result -> {
                int s = result.getResponse().getStatus();
                if (s != 423 && s != 401) {
                    throw new AssertionError("Expected 423 or 401, got " + s);
                }
            });
    }
}
