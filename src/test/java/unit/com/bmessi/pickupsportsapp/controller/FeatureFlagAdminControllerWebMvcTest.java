package unit.com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.controller.FeatureFlagAdminController;
import com.bmessi.pickupsportsapp.entity.FeatureFlag;
import com.bmessi.pickupsportsapp.service.FeatureFlagService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import support.Quarantined;

import java.util.List;
import support.Quarantined;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FeatureFlagAdminController.class)
@Import(FeatureFlagAdminControllerWebMvcTest.TestConfig.class)
@Quarantined
class FeatureFlagAdminControllerWebMvcTest {

    static class TestConfig {
        @Bean FeatureFlagService featureFlagService() {
            return Mockito.mock(FeatureFlagService.class);
        }
    }

    @Autowired MockMvc mvc;
    @Autowired FeatureFlagService service;

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanListFlags() throws Exception {
        when(service.findAll()).thenReturn(List.of(new FeatureFlag("chat", true, 100)));
        mvc.perform(get("/admin/feature-flags"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void nonAdminForbidden() throws Exception {
        mvc.perform(get("/admin/feature-flags"))
                .andExpect(status().isForbidden());
    }
}
