package unit.com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.controller.game.GameController;
import com.bmessi.pickupsportsapp.dto.CreateGameRequest;
import com.bmessi.pickupsportsapp.dto.GameDetailsDTO;
import com.bmessi.pickupsportsapp.dto.UpdateGameRequest;
import com.bmessi.pickupsportsapp.dto.UserDTO;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.service.notification.NotificationService;
import com.bmessi.pickupsportsapp.service.SportResolverService;
import com.bmessi.pickupsportsapp.service.chat.ChatService;
import com.bmessi.pickupsportsapp.service.gameaccess.GameAccessService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.security.Principal;
import java.time.OffsetDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;

@SpringJUnitConfig(classes = {
        GameController.class,
        RsvpCacheEvictTest.TestCacheConfig.class
})
class RsvpCacheEvictTest {

    @TestConfiguration
    static class TestCacheConfig {
        @Bean CacheManager cacheManager() {
            return new ConcurrentMapCacheManager("explore-first", "sports-list");
        }
        @Bean ApiMapper mapper() { return Mockito.mock(ApiMapper.class); }
        @Bean NotificationService notificationService() { return Mockito.mock(NotificationService.class); }
        @Bean ChatService chatService() { return Mockito.mock(ChatService.class); }
        @Bean SportResolverService sportResolver() { return Mockito.mock(SportResolverService.class); }
        @Bean com.bmessi.pickupsportsapp.service.IdempotencyService idempotencyService() { return Mockito.mock(com.bmessi.pickupsportsapp.service.IdempotencyService.class); }
        @Bean GameAccessService gameAccessService() { return Mockito.mock(GameAccessService.class); }
        @Bean GameRepository gameRepository() { return Mockito.mock(GameRepository.class); }
        @Bean UserRepository userRepository() { return Mockito.mock(UserRepository.class); }
    }

    @jakarta.annotation.Resource GameRepository gameRepository;
    @jakarta.annotation.Resource UserRepository userRepository;

    @jakarta.annotation.Resource CacheManager cacheManager;
    @jakarta.annotation.Resource
    GameController controller;
    @jakarta.annotation.Resource ApiMapper mapper;
    @jakarta.annotation.Resource SportResolverService sportResolver;

    User owner;

    @BeforeEach
    void setup() {
        owner = User.builder().id(10L).username("alice").password("x").build();
        Mockito.when(userRepository.findByUsername("alice")).thenReturn(owner);
        Mockito.when(sportResolver.resolveOrCreateCanonical(anyString())).thenAnswer(inv -> inv.getArgument(0));
        Mockito.when(mapper.toGameDetailsDTO(any(Game.class))).thenReturn(
                new GameDetailsDTO(1L, "Soccer", "Park", OffsetDateTime.now(), null, null, null, new UserDTO(10L,"alice",null,null), Set.of())
        );
    }

    @Test
    void createGame_evictsExploreAndSportsList() {
        var cacheExplore = cacheManager.getCache("explore-first");
        var cacheSports = cacheManager.getCache("sports-list");
        assertNotNull(cacheExplore);
        assertNotNull(cacheSports);

        // Put dummy values
        cacheExplore.put("k1", "v1");
        cacheSports.put("k2", "v2");

        CreateGameRequest req = new CreateGameRequest("Soccer", "Park", OffsetDateTime.now().plusHours(1), null, null, null);
        Principal principal = () -> "alice";
        Mockito.when(gameRepository.save(any(Game.class))).thenAnswer(inv -> {
            Game g = inv.getArgument(0);
            g.setId(1L);
            g.setVersion(1L);
            return g;
        });

        controller.createGame(req, null, null, principal);

        assertNull(cacheExplore.get("k1"));
        assertNull(cacheSports.get("k2"));
    }
}
