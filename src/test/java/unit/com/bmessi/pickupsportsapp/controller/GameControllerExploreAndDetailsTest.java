package unit.com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.controller.game.GameController;
import com.bmessi.pickupsportsapp.dto.GameDetailsDTO;
import com.bmessi.pickupsportsapp.dto.UserDTO;
import com.bmessi.pickupsportsapp.dto.chat.ChatMessageDTO;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.service.AiRecommendationResilientService;
import com.bmessi.pickupsportsapp.service.SportResolverService;
import com.bmessi.pickupsportsapp.service.chat.ChatService;
import com.bmessi.pickupsportsapp.service.gameaccess.GameAccessService;
import com.bmessi.pickupsportsapp.service.notification.NotificationService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GameController.class)
@Import(GameControllerExploreAndDetailsTest.TestBeans.class)
class GameControllerExploreAndDetailsTest {

    @TestConfiguration
    static class TestBeans {
        @Bean GameRepository gameRepository() { return Mockito.mock(GameRepository.class); }
        @Bean UserRepository userRepository() { return Mockito.mock(UserRepository.class); }
        @Bean NotificationService notificationService() { return Mockito.mock(NotificationService.class); }
        @Bean AiRecommendationResilientService xaiRecommendationService() { return Mockito.mock(AiRecommendationResilientService.class); }
        @Bean ApiMapper mapper() { return Mockito.mock(ApiMapper.class); }
        @Bean ChatService chatService() { return Mockito.mock(ChatService.class); }
        @Bean SportResolverService sportResolver() { return Mockito.mock(SportResolverService.class); }
        @Bean com.bmessi.pickupsportsapp.service.IdempotencyService idempotencyService() { return Mockito.mock(com.bmessi.pickupsportsapp.service.IdempotencyService.class); }
        @Bean GameAccessService gameAccessService() { return Mockito.mock(GameAccessService.class); }
    }

    @Autowired MockMvc mvc;
    @Autowired GameRepository gameRepository;
    @Autowired UserRepository userRepository;
    @Autowired NotificationService notificationService;
    @Autowired ApiMapper mapper;
    @Autowired ChatService chatService;

    @Test
    void explore_returns200_withEmptyList() throws Exception {
        Mockito.when(gameRepository.findAll(any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 10), 0));
        mvc.perform(get("/games"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "private, max-age=30"));
    }

    @Test
    void gameDetails_returns200_whenFound() throws Exception {
        Game g = Game.builder()
                .id(42L).sport("Soccer").location("Park")
                .time(Instant.now()).user(User.builder().id(7L).username("alice").build())
                .version(1L).createdAt(OffsetDateTime.now()).updatedAt(OffsetDateTime.now())
                .participants(new java.util.HashSet<>())
                .build();
        Mockito.when(gameRepository.findWithParticipantsById(42L)).thenReturn(Optional.of(g));
        Mockito.when(mapper.toGameDetailsDTO(any(Game.class)))
                .thenReturn(new GameDetailsDTO(42L, "Soccer", "Park", OffsetDateTime.now(), null, null, null, new UserDTO(7L,"alice",null,null), Set.of()));

        mvc.perform(get("/games/{id}", 42L))
                .andExpect(status().isOk())
                .andExpect(header().exists("Last-Modified"))
                .andExpect(header().string("Cache-Control", "private, max-age=30"));
    }

    @Test
    @WithMockUser(username = "alice")
    void chatHistory_returns200() throws Exception {
        Mockito.when(gameRepository.findWithParticipantsById(5L)).thenReturn(Optional.of(Game.builder().id(5L).user(User.builder().id(1L).username("alice").build()).build()));
        Mockito.when(chatService.history(eq(5L), any(), anyInt()))
                .thenReturn(List.of(new ChatMessageDTO()));

        mvc.perform(get("/games/{id}/chat/history", 5L))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @WithMockUser(username = "bob")
    void rsvp_returns200() throws Exception {
        User owner = User.builder().id(1L).username("alice").build();
        User bob = User.builder().id(2L).username("bob").build();
        Mockito.when(userRepository.findByUsername("bob")).thenReturn(bob);

        Game g = Game.builder()
                .id(10L).sport("Soccer").location("Park").time(Instant.now())
                .user(owner).version(1L).createdAt(OffsetDateTime.now()).updatedAt(OffsetDateTime.now())
                .participants(new java.util.HashSet<>())
                .build();
        Mockito.when(gameRepository.findWithParticipantsById(10L)).thenReturn(Optional.of(g));
        Mockito.when(gameRepository.existsParticipant(10L, 2L)).thenReturn(false);
        Mockito.when(gameRepository.save(any(Game.class))).thenReturn(g);
        Mockito.when(mapper.toGameDetailsDTO(any(Game.class)))
                .thenReturn(new GameDetailsDTO(10L, "Soccer", "Park", OffsetDateTime.now(), null, null, null, new UserDTO(1L,"alice",null,null), Set.of()));

        mvc.perform(post("/games/{id}/rsvp", 10L))
                .andExpect(status().isOk())
                .andExpect(header().string("Deprecation", "true"));
    }
}
