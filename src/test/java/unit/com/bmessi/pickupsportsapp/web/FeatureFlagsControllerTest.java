package unit.com.bmessi.pickupsportsapp.web;

import com.bmessi.pickupsportsapp.web.FeatureFlagsController;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.concurrent.TimeUnit;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(FeatureFlagsController.class)
@Import(FeatureFlagsController.class)
@TestPropertySource(properties = {
        "app.env=dev",
        "features.recommend=false",
        "features.chat.enabled=true",
        "spring.mvc.servlet.path=",
        "server.servlet.context-path="
})
@Timeout(value = 30, unit = TimeUnit.SECONDS)
class FeatureFlagsControllerTest {

    @Autowired
    MockMvc mvc;

    @Test
    void flags_returns200_andPayload() throws Exception {
        mvc.perform(get("/config/flags"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.env").value("dev"))
                .andExpect(jsonPath("$.recommend").value(false))
                .andExpect(jsonPath("$.chatEnabled").value(true));
    }
}

