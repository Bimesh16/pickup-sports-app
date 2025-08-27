package unit.com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.HostActionAuditService;
import com.bmessi.pickupsportsapp.controller.ProfanityAdminController;
import com.bmessi.pickupsportsapp.service.chat.ProfanityFilterService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import support.Quarantined;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(ProfanityAdminController.class)
@Import(ProfanityAdminControllerWebMvcTest.TestBeans.class)
@Quarantined
class ProfanityAdminControllerWebMvcTest {

    @TestConfiguration
    static class TestBeans {
        @Bean ProfanityFilterService profanity() {
            return Mockito.mock(ProfanityFilterService.class);
        }
        @Bean HostActionAuditService hostAuditService() {
            return Mockito.mock(HostActionAuditService.class);
        }
    }

    @Autowired MockMvc mvc;

    @Autowired ProfanityFilterService profanity;

    @Test
    @WithMockUser(roles = "ADMIN")
    void listWords_returnsDto() throws Exception {
        Mockito.when(profanity.listWords()).thenReturn(List.of("badword1", "badword2"));

        mvc.perform(get("/admin/profanity/words"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", containsString("no-store")))
                .andExpect(jsonPath("$.count", is(2)))
                .andExpect(jsonPath("$.words", hasSize(2)));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateConfig_returnsDto() throws Exception {
        doNothing().when(profanity).setEnabled(true);
        doNothing().when(profanity).setReject(false);
        Mockito.when(profanity.isEnabled()).thenReturn(true);
        Mockito.when(profanity.shouldReject()).thenReturn(false);

        mvc.perform(put("/admin/profanity/config")
                        .contentType("application/json")
                        .content("{\"enabled\":true,\"reject\":false}"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", containsString("no-store")))
                .andExpect(jsonPath("$.enabled", is(true)))
                .andExpect(jsonPath("$.reject", is(false)));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void addWord_returnsMessage() throws Exception {
        doNothing().when(profanity).addWord("xyz");

        mvc.perform(post("/admin/profanity/words/{word}", "xyz"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", containsString("no-store")))
                .andExpect(jsonPath("$.message", is("Added")));
    }
}


