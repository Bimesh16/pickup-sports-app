package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.GameDetailsDTO;
import com.bmessi.pickupsportsapp.dto.UserDTO;
import com.bmessi.pickupsportsapp.entity.Game;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.service.NotificationService;
import com.bmessi.pickupsportsapp.service.SportResolverService;
import com.bmessi.pickupsportsapp.service.AiRecommendationResilientService;
import com.bmessi.pickupsportsapp.service.chat.ChatService;
import com.bmessi.pickupsportsapp.service.gameaccess.GameAccessService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.Set;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GameController.class)
@Import(GameControllerLegacyRsvpHeadersTest.TestBeans.class)
class GameControllerLegacyRsvpHeadersTest {

    @TestConfiguration
    static class TestBeans {
        @Bean GameRepository gameRepository() { return org.mockito.Mockito.mock(GameRepository.class); }
        @Bean UserRepository userRepository() { return org.mockito.Mockito.mock(UserRepository.class); }
        @Bean NotificationService notificationService() { return org.mockito.Mockito.mock(NotificationService.class); }
        @Bean AiRecommendationResilientService xaiRecommendationService() { return org.mockito.Mockito.mock(AiRecommendationResilientService.class); }
        @Bean ApiMapper mapper() { return org.mockito.Mockito.mock(ApiMapper.class); }
        @Bean ChatService chatService() { return org.mockito.Mockito.mock(ChatService.class); }
        @Bean SportResolverService sportResolver() { return org.mockito.Mockito.mock(SportResolverService.class); }
        @Bean com.bmessi.pickupsportsapp.service.IdempotencyService idempotencyService() { return org.mockito.Mockito.mock(com.bmessi.pickupsportsapp.service.IdempotencyService.class); }
        @Bean GameAccessService gameAccessService() { return org.mockito.Mockito.mock(GameAccessService.class); }
    }

    @Autowired MockMvc mvc;

    @Autowired GameRepository gameRepository;
    @Autowired UserRepository userRepository;
    @Autowired NotificationService notificationService;
    @Autowired AiRecommendationResilientService xaiRecommendationService;
    @Autowired ApiMapper mapper;
    @Autowired ChatService chatService;
    @Autowired SportResolverService sportResolver;
    @Autowired com.bmessi.pickupsportsapp.service.IdempotencyService idempotencyService;
    @Autowired GameAccessService gameAccessService;

    @Test
    @WithMockUser(username = "alice")
    void legacyRsvp_returnsDeprecationHeaders() throws Exception {
        User user = User.builder().id(10L).username("alice").password("x").build();
        Mockito.when(userRepository.findByUsername("alice")).thenReturn(user);

        Game game = Game.builder()
                .id(42L).sport("Soccer").location("Park").time(java.time.Instant.now())
                .user(user).version(1L).createdAt(OffsetDateTime.now()).updatedAt(OffsetDateTime.now())
                .participants(new java.util.HashSet<>())
                .build();
        Mockito.when(gameRepository.findWithParticipantsById(42L)).thenReturn(Optional.of(game));
        Mockito.when(gameRepository.existsParticipant(42L, 10L)).thenReturn(false);
        Mockito.when(gameRepository.save(any(Game.class))).thenReturn(game);
        Mockito.doNothing().when(notificationService).createGameNotification(anyString(), anyString(), anyString(), anyString(), anyString());
        Mockito.when(mapper.toGameDetailsDTO(any(Game.class)))
                .thenReturn(new GameDetailsDTO(42L, "Soccer", "Park", OffsetDateTime.now(), null, null, null, new UserDTO(10L,"alice",null,null), Set.of()));

        mvc.perform(post("/games/{id}/rsvp", 42L))
                .andExpect(status().isOk())
                .andExpect(header().string("Deprecation", "true"))
                .andExpect(header().string("Link", containsString("</games/42/rsvp2>; rel=\"successor-version\"")));
    }
}
