package integration.com.bmessi.pickupsportsapp.it;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ChangePasswordIT {

    @Autowired
    MockMvc mvc;

    @Test
    void changePassword_requiresAuthentication() throws Exception {
        mvc.perform(post("/auth/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"secret\",\"newPassword\":\"NewPass123\"}"))
                .andExpect(status().is4xxClientError()); // 401/403 depends on security config
    }
}
