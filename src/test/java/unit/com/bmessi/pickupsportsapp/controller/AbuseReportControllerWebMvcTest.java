package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.entity.AbuseReport;
import com.bmessi.pickupsportsapp.service.AbuseReportService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AbuseReportController.class)
@Import(AbuseReportControllerWebMvcTest.TestConfig.class)
class AbuseReportControllerWebMvcTest {

    static class TestConfig {
        @Bean AbuseReportService abuseReportService() {
            return Mockito.mock(AbuseReportService.class);
        }
    }

    @Autowired MockMvc mvc;
    @Autowired AbuseReportService service;

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanListReports() throws Exception {
        when(service.list(isNull(), any())).thenReturn(Page.empty());
        mvc.perform(get("/abuse-reports"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void nonAdminCannotListReports() throws Exception {
        mvc.perform(get("/abuse-reports"))
                .andExpect(status().isForbidden());
    }
}
