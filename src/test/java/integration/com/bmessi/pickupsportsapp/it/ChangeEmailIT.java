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
class ChangeEmailIT {

    @Autowired
    MockMvc mvc;

    @Test
    void changeEmail_requiresAuthentication() throws Exception {
        mvc.perform(post("/auth/change-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"newEmail\":\"new@example.com\",\"currentPassword\":\"x\"}"))
                .andExpect(status().is4xxClientError()); // 401/403 depending on setup
    }
}
