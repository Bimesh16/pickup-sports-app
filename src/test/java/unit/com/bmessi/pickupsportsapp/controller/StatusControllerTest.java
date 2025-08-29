package unit.com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.controller.StatusController;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import support.Quarantined;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(StatusController.class)
@TestPropertySource(properties = "app.version=9.9.9-test")
@Quarantined
class StatusControllerTest {

    @Autowired
    MockMvc mvc;

    @Test
    void status_returnsAppStatusResponse() throws Exception {
        mvc.perform(get("/status"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", containsString("no-store")))
                .andExpect(jsonPath("$.app", is("Pickup Sports API")))
                .andExpect(jsonPath("$.version", is("9.9.9-test")))
                .andExpect(jsonPath("$.status", is("ok")))
                .andExpect(jsonPath("$.timestamp", notNullValue()));
    }
}
