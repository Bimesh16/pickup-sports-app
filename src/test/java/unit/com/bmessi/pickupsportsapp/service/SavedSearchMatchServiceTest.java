package unit.com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.SavedSearchEntity;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.repository.SavedSearchRepository;
import com.bmessi.pickupsportsapp.service.SavedSearchMatchService;
import com.bmessi.pickupsportsapp.service.push.PushSenderService;
import com.bmessi.pickupsportsapp.service.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SavedSearchMatchServiceTest {

    @Mock SavedSearchRepository repo;
    @Mock PushSenderService pushSender;
    @Mock EmailService emailService;

    @Test
    void matchTriggersNotifications() {
        // Create service with Optional.of(emailService) to avoid NullPointerException
        SavedSearchMatchService service = new SavedSearchMatchService(repo, pushSender, Optional.of(emailService));

        User user = User.builder().id(1L).username("alice").password("pw").build();
        SavedSearchEntity search = SavedSearchEntity.builder().id(5L).user(user).sport("Soccer").location("Park").build();
        when(repo.findAll()).thenReturn(List.of(search));

        Game game = Game.builder().id(99L).sport("Soccer").location("Central Park").build();

        assertDoesNotThrow(() -> {
            service.handleNewGame(game);
        });

        verify(pushSender).enqueue(eq("alice"), anyString(), anyString(), anyString());
        verify(emailService).sendGameEventEmail(eq("alice"), eq("saved-search-match"), anyMap());
    }

    @Test
    void matchTriggersNotifications_WithoutEmailService() {
        // Create service with Optional.empty() to test without email service
        SavedSearchMatchService service = new SavedSearchMatchService(repo, pushSender, Optional.empty());

        User user = User.builder().id(1L).username("alice").password("pw").build();
        SavedSearchEntity search = SavedSearchEntity.builder().id(5L).user(user).sport("Soccer").location("Park").build();
        when(repo.findAll()).thenReturn(List.of(search));

        Game game = Game.builder().id(99L).sport("Soccer").location("Central Park").build();

        assertDoesNotThrow(() -> {
            service.handleNewGame(game);
        });

        verify(pushSender).enqueue(eq("alice"), anyString(), anyString(), anyString());
        // Email service should not be called when Optional is empty
        verify(emailService, never()).sendGameEventEmail(any(), any(), any());
    }

    @Test
    void matchTriggersNotifications_EmailServiceThrowsException() {
        // Create service with emailService that throws exception
        SavedSearchMatchService service = new SavedSearchMatchService(repo, pushSender, Optional.of(emailService));

        User user = User.builder().id(1L).username("alice").password("pw").build();
        SavedSearchEntity search = SavedSearchEntity.builder().id(5L).user(user).sport("Soccer").location("Park").build();
        when(repo.findAll()).thenReturn(List.of(search));

        // Mock emailService to throw exception
        doThrow(new RuntimeException("Email service error"))
            .when(emailService).sendGameEventEmail(any(), any(), any());

        Game game = Game.builder().id(99L).sport("Soccer").location("Central Park").build();

        // Should not throw exception due to try-catch in the service
        assertDoesNotThrow(() -> {
            service.handleNewGame(game);
        });

        verify(pushSender).enqueue(eq("alice"), anyString(), anyString(), anyString());
        verify(emailService).sendGameEventEmail(eq("alice"), eq("saved-search-match"), anyMap());
    }

    @Test
    void noMatchWhenSportDoesNotMatch() {
        SavedSearchMatchService service = new SavedSearchMatchService(repo, pushSender, Optional.of(emailService));

        User user = User.builder().id(1L).username("alice").password("pw").build();
        SavedSearchEntity search = SavedSearchEntity.builder().id(5L).user(user).sport("Basketball").location("Park").build();
        when(repo.findAll()).thenReturn(List.of(search));

        Game game = Game.builder().id(99L).sport("Soccer").location("Central Park").build();

        assertDoesNotThrow(() -> {
            service.handleNewGame(game);
        });

        // Should not trigger notifications since sports don't match
        verify(pushSender, never()).enqueue(any(), any(), any(), any());
        verify(emailService, never()).sendGameEventEmail(any(), any(), any());
    }

    @Test
    void noMatchWhenLocationDoesNotContain() {
        SavedSearchMatchService service = new SavedSearchMatchService(repo, pushSender, Optional.of(emailService));

        User user = User.builder().id(1L).username("alice").password("pw").build();
        SavedSearchEntity search = SavedSearchEntity.builder().id(5L).user(user).sport("Soccer").location("Brooklyn").build();
        when(repo.findAll()).thenReturn(List.of(search));

        Game game = Game.builder().id(99L).sport("Soccer").location("Manhattan Stadium").build();

        assertDoesNotThrow(() -> {
            service.handleNewGame(game);
        });

        // Should not trigger notifications since locations don't match
        verify(pushSender, never()).enqueue(any(), any(), any(), any());
        verify(emailService, never()).sendGameEventEmail(any(), any(), any());
    }
}
