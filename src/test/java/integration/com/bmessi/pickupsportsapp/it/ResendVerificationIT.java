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
class ResendVerificationIT {

    @Autowired
    MockMvc mvc;

    @Test
    void resendVerification_requiresUsername_andAlways200WhenProvided() throws Exception {
        // Missing username -> 400
        mvc.perform(post("/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());

        // Provided username -> 200 (whether user exists or not)
        mvc.perform(post("/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"test@example.com\"}"))
                .andExpect(status().isOk());
    }
}
