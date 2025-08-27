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

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SavedSearchMatchServiceTest {

    @Mock SavedSearchRepository repo;
    @Mock PushSenderService pushSender;
    @Mock EmailService emailService;
    @InjectMocks SavedSearchMatchService service;

    @Test
    void matchTriggersNotifications() {
        User user = User.builder().id(1L).username("alice").password("pw").build();
        SavedSearchEntity search = SavedSearchEntity.builder().id(5L).user(user).sport("Soccer").location("Park").build();
        when(repo.findAll()).thenReturn(List.of(search));

        Game game = Game.builder().id(99L).sport("Soccer").location("Central Park").build();

        service.handleNewGame(game);

        verify(pushSender).enqueue(eq("alice"), anyString(), anyString(), anyString());
        verify(emailService).sendGameEventEmail(eq("alice"), eq("saved-search-match"), anyMap());
    }
}
