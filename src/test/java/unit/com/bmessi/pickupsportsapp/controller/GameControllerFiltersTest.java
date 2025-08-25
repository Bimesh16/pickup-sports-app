package unit.com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.controller.game.GameController;
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
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GameController.class)
@Import(GameControllerFiltersTest.TestBeans.class)
class GameControllerFiltersTest {

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

    @Test
    void sports_returns200_sorted() throws Exception {
        Mockito.when(gameRepository.findDistinctSports()).thenReturn(Set.of("Soccer", "Basketball"));
        mvc.perform(get("/games/sports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("Basketball"))
                .andExpect(jsonPath("$[1]").value("Soccer"));
    }

    @Test
    void skills_returns200() throws Exception {
        mvc.perform(get("/games/skills"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("Beginner"));
    }
}
