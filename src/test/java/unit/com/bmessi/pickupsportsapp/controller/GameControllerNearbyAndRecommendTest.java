package unit.com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.controller.game.GameController;
import com.bmessi.pickupsportsapp.dto.game.GameSummaryDTO;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.service.AiRecommendationResilientService;
import com.bmessi.pickupsportsapp.service.SportResolverService;
import com.bmessi.pickupsportsapp.service.chat.ChatService;
import com.bmessi.pickupsportsapp.service.gameaccess.GameAccessService;
import com.bmessi.pickupsportsapp.service.notification.NotificationService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GameController.class)
@Import(GameControllerNearbyAndRecommendTest.TestBeans.class)
class GameControllerNearbyAndRecommendTest {

    @TestConfiguration
    static class TestBeans {
        @Bean GameRepository gameRepository() { return Mockito.mock(GameRepository.class); }
        @Bean NotificationService notificationService() { return Mockito.mock(NotificationService.class); }
        @Bean ApiMapper mapper() { return org.mockito.Mockito.mock(ApiMapper.class); }
        @Bean ChatService chatService() { return Mockito.mock(ChatService.class); }
        @Bean SportResolverService sportResolver() { return Mockito.mock(SportResolverService.class); }
        @Bean com.bmessi.pickupsportsapp.service.IdempotencyService idempotencyService() { return Mockito.mock(com.bmessi.pickupsportsapp.service.IdempotencyService.class); }
        @Bean GameAccessService gameAccessService() { return Mockito.mock(GameAccessService.class); }
        @Bean AiRecommendationResilientService xaiRecommendationService() { return Mockito.mock(AiRecommendationResilientService.class); }
    }

    @Autowired MockMvc mvc;
    @Autowired GameRepository gameRepository;
    @Autowired AiRecommendationResilientService xaiRecommendationService;

    @Test
    void nearby_returns200() throws Exception {
        Mockito.when(gameRepository.findByLocationWithinRadius(
                any(), any(), any(), any(), any(), anyDouble(), anyDouble(), anyDouble(), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of()));

        mvc.perform(get("/games/near")
                        .param("lat", "37.7749")
                        .param("lon", "-122.4194")
                        .param("radiusKm", "5.0"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "alice")
    void recommend_returns200() throws Exception {
        GameSummaryDTO dto = new GameSummaryDTO(1L, "Soccer", "Park A", OffsetDateTime.now(), "Beginner", null, null, null);
        Mockito.when(xaiRecommendationService.recommend(any(), any(), any(), any()))
                .thenReturn(CompletableFuture.completedFuture(new PageImpl<>(List.of(dto))));
        Mockito.when(xaiRecommendationService.getLastSource()).thenReturn("mock");

        mvc.perform(get("/games/recommend"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Recommendation-Source", "mock"));
    }
}
