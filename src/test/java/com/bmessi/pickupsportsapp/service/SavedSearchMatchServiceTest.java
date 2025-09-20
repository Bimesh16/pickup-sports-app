package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.SavedSearchEntity;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.repository.SavedSearchRepository;
import com.bmessi.pickupsportsapp.service.EmailService;
import com.bmessi.pickupsportsapp.service.SavedSearchMatchService;
import com.bmessi.pickupsportsapp.service.push.PushSenderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SavedSearchMatchServiceTest {

    @Mock
    private SavedSearchRepository repo;

    @Mock
    private PushSenderService pushSender;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private SavedSearchMatchService savedSearchMatchService;

    private User testUser;
    private SavedSearchEntity testSavedSearch;
    private Game testGame;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = User.builder()
            .id(1L)
            .username("testuser")
            .email("test@example.com")
            .build();

        // Setup test saved search entity
        testSavedSearch = SavedSearchEntity.builder()
            .id(1L)
            .user(testUser)
            .sport("Soccer")
            .location("New York")
            .radiusKm(10)
            .createdAt(OffsetDateTime.now())
            .updatedAt(OffsetDateTime.now())
            .build();

        // Setup test game
        testGame = Game.builder()
            .id(1L)
            .sport("Soccer")
            .location("New York Central Park")
            .time(OffsetDateTime.now().plusDays(1))
            .user(testUser)
            .build();
    }

    @Test
    void handleNewGame_WithMatchingSearch_WithEmailService() {
        // Arrange
        List<SavedSearchEntity> savedSearches = Arrays.asList(testSavedSearch);
        when(repo.findAll()).thenReturn(savedSearches);

        // Create a service with emailService present
        savedSearchMatchService = new SavedSearchMatchService(repo, pushSender, Optional.of(emailService));

        // Act
        assertDoesNotThrow(() -> {
            savedSearchMatchService.handleNewGame(testGame);
        });

        // Assert
        verify(repo).findAll();
        verify(pushSender).enqueue(
            eq("testuser"),
            eq("New game: Soccer"),
            eq("Game at New York Central Park"),
            eq("/games/1")
        );
        verify(emailService).sendGameEventEmail(
            eq("testuser"),
            eq("saved-search-match"),
            any()
        );
    }

    @Test
    void handleNewGame_WithMatchingSearch_WithoutEmailService() {
        // Arrange
        List<SavedSearchEntity> savedSearches = Arrays.asList(testSavedSearch);
        when(repo.findAll()).thenReturn(savedSearches);

        // Create a service without emailService
        savedSearchMatchService = new SavedSearchMatchService(repo, pushSender, Optional.empty());

        // Act
        assertDoesNotThrow(() -> {
            savedSearchMatchService.handleNewGame(testGame);
        });

        // Assert
        verify(repo).findAll();
        verify(pushSender).enqueue(
            eq("testuser"),
            eq("New game: Soccer"),
            eq("Game at New York Central Park"),
            eq("/games/1")
        );
        // Email service should not be called since it's not present
        verify(emailService, never()).sendGameEventEmail(any(), any(), any());
    }

    @Test
    void handleNewGame_NoMatchingSearches() {
        // Arrange
        SavedSearchEntity nonMatchingSearch = SavedSearchEntity.builder()
            .id(2L)
            .user(testUser)
            .sport("Basketball")  // Different sport
            .location("New York")
            .radiusKm(10)
            .build();

        List<SavedSearchEntity> savedSearches = Arrays.asList(nonMatchingSearch);
        when(repo.findAll()).thenReturn(savedSearches);

        // Act
        assertDoesNotThrow(() -> {
            savedSearchMatchService.handleNewGame(testGame);
        });

        // Assert
        verify(repo).findAll();
        verify(pushSender, never()).enqueue(any(), any(), any(), any());
        verify(emailService, never()).sendGameEventEmail(any(), any(), any());
    }

    @Test
    void handleNewGame_NoSavedSearches() {
        // Arrange
        when(repo.findAll()).thenReturn(Collections.emptyList());

        // Act
        assertDoesNotThrow(() -> {
            savedSearchMatchService.handleNewGame(testGame);
        });

        // Assert
        verify(repo).findAll();
        verify(pushSender, never()).enqueue(any(), any(), any(), any());
        verify(emailService, never()).sendGameEventEmail(any(), any(), any());
    }

    @Test
    void handleNewGame_EmailServiceThrowsException() {
        // Arrange
        List<SavedSearchEntity> savedSearches = Arrays.asList(testSavedSearch);
        when(repo.findAll()).thenReturn(savedSearches);

        // Mock emailService to throw exception
        doThrow(new RuntimeException("Email service error"))
            .when(emailService).sendGameEventEmail(any(), any(), any());

        savedSearchMatchService = new SavedSearchMatchService(repo, pushSender, Optional.of(emailService));

        // Act - should not throw exception due to try-catch in the service
        assertDoesNotThrow(() -> {
            savedSearchMatchService.handleNewGame(testGame);
        });

        // Assert
        verify(repo).findAll();
        verify(pushSender).enqueue(any(), any(), any(), any());
        verify(emailService).sendGameEventEmail(any(), any(), any());
    }

    @Test
    void matches_ExactSportMatch() {
        // Arrange
        SavedSearchEntity search = SavedSearchEntity.builder()
            .sport("Soccer")
            .location(null)
            .build();
        Game game = Game.builder()
            .sport("Soccer")
            .location("Any Location")
            .build();

        // Act
        boolean result = savedSearchMatchService.matches(search, game);

        // Assert
        assertTrue(result);
    }

    @Test
    void matches_CaseInsensitiveSportMatch() {
        // Arrange
        SavedSearchEntity search = SavedSearchEntity.builder()
            .sport("SOCCER")
            .location(null)
            .build();
        Game game = Game.builder()
            .sport("soccer")
            .location("Any Location")
            .build();

        // Act
        boolean result = savedSearchMatchService.matches(search, game);

        // Assert
        assertTrue(result);
    }

    @Test
    void matches_LocationContains() {
        // Arrange
        SavedSearchEntity search = SavedSearchEntity.builder()
            .sport(null)
            .location("New York")
            .build();
        Game game = Game.builder()
            .sport("Soccer")
            .location("New York Central Park")
            .build();

        // Act
        boolean result = savedSearchMatchService.matches(search, game);

        // Assert
        assertTrue(result);
    }

    @Test
    void matches_CaseInsensitiveLocationMatch() {
        // Arrange
        SavedSearchEntity search = SavedSearchEntity.builder()
            .sport(null)
            .location("CENTRAL PARK")
            .build();
        Game game = Game.builder()
            .sport("Soccer")
            .location("New York Central Park Area")
            .build();

        // Act
        boolean result = savedSearchMatchService.matches(search, game);

        // Assert
        assertTrue(result);
    }

    @Test
    void matches_NoMatch_DifferentSport() {
        // Arrange
        SavedSearchEntity search = SavedSearchEntity.builder()
            .sport("Basketball")
            .location(null)
            .build();
        Game game = Game.builder()
            .sport("Soccer")
            .location("Any Location")
            .build();

        // Act
        boolean result = savedSearchMatchService.matches(search, game);

        // Assert
        assertFalse(result);
    }

    @Test
    void matches_NoMatch_LocationNotContained() {
        // Arrange
        SavedSearchEntity search = SavedSearchEntity.builder()
            .sport(null)
            .location("Brooklyn")
            .build();
        Game game = Game.builder()
            .sport("Soccer")
            .location("Manhattan Central Park")
            .build();

        // Act
        boolean result = savedSearchMatchService.matches(search, game);

        // Assert
        assertFalse(result);
    }

    @Test
    void matches_NullSearchCriteria_AlwaysMatches() {
        // Arrange
        SavedSearchEntity search = SavedSearchEntity.builder()
            .sport(null)
            .location(null)
            .build();
        Game game = Game.builder()
            .sport("Soccer")
            .location("Any Location")
            .build();

        // Act
        boolean result = savedSearchMatchService.matches(search, game);

        // Assert
        assertTrue(result);
    }

    @Test
    void matches_NullGameCriteria_NoMatch() {
        // Arrange
        SavedSearchEntity search = SavedSearchEntity.builder()
            .sport("Soccer")
            .location("New York")
            .build();
        Game game = Game.builder()
            .sport(null)
            .location(null)
            .build();

        // Act
        boolean result = savedSearchMatchService.matches(search, game);

        // Assert
        assertFalse(result);
    }

    @Test
    void serviceInstantiation_ValidDependencies() {
        // Test that the service can be instantiated with valid dependencies
        assertNotNull(savedSearchMatchService);

        // Verify dependencies are properly injected
        assertDoesNotThrow(() -> {
            when(repo.findAll()).thenReturn(Collections.emptyList());
            savedSearchMatchService.handleNewGame(testGame);
        });
    }
}
