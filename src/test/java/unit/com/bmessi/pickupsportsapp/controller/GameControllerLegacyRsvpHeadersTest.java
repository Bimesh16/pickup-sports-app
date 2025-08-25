//package unit.com.bmessi.pickupsportsapp.controller;
//
//import com.bmessi.pickupsportsapp.controller.game.GameController;
//import com.bmessi.pickupsportsapp.mapper.ApiMapper;
//import com.bmessi.pickupsportsapp.repository.GameRepository;
//import com.bmessi.pickupsportsapp.service.AiRecommendationResilientService;
//import com.bmessi.pickupsportsapp.service.SportResolverService;
//import com.bmessi.pickupsportsapp.service.chat.ChatService;
//import com.bmessi.pickupsportsapp.service.gameaccess.GameAccessService;
//import com.bmessi.pickupsportsapp.service.notification.NotificationService;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
//import org.springframework.boot.test.context.TestConfiguration;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Import;
//import org.springframework.security.test.context.support.WithMockUser;
//import org.springframework.test.web.servlet.MockMvc;
//
//import static org.mockito.Mockito.mock;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
//
//@WebMvcTest(GameController.class)
//@Import(GameControllerLegacyRsvpHeadersTest.MockConfig.class)
//class GameControllerLegacyRsvpHeadersTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @TestConfiguration
//    static class MockConfig {
//        @Bean GameRepository gameRepository() { return mock(GameRepository.class); }
//        @Bean ApiMapper apiMapper() { return mock(ApiMapper.class); }
//        @Bean SportResolverService sportResolverService() { return mock(SportResolverService.class); }
//        @Bean ChatService chatService() { return mock(ChatService.class); }
//        @Bean AiRecommendationResilientService aiRecommendationResilientService() { return mock(AiRecommendationResilientService.class); }
//        @Bean NotificationService notificationService() { return mock(NotificationService.class); }
//        @Bean GameAccessService gameAccessService() { return mock(GameAccessService.class); }
//    }
//
//    @WithMockUser
//    @Test
//    void legacyRsvp_returnsDeprecationHeaders() throws Exception {
//        mockMvc.perform(post("/games/1/rsvp"))
//                .andExpect(status().isOk());
//    }
//}
