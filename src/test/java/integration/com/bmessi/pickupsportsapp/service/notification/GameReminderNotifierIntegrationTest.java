package integration.com.bmessi.pickupsportsapp.service.notification;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.notification.Notification;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.NotificationRepository;
import com.bmessi.pickupsportsapp.repository.PushOutboxRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.service.EmailService;
import com.bmessi.pickupsportsapp.service.notification.GameReminderNotifier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
class GameReminderNotifierIntegrationTest {

    @Autowired
    private GameReminderNotifier notifier;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private UserRepository userRepository;
    @Autowired private GameRepository gameRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private PushOutboxRepository pushOutboxRepository;
    @MockitoBean private EmailService emailService;

    @BeforeEach
    void setup() {
        pushOutboxRepository.deleteAll();
        notificationRepository.deleteAll();
    }

    @Test
    void sendsReminders() {
        User owner = userRepository.save(User.builder().username("owner@ex.com").password("pw").build());
        User p1 = userRepository.save(User.builder().username("p1@ex.com").password("pw").build());
        OffsetDateTime time = OffsetDateTime.now(ZoneOffset.UTC).plus(24, ChronoUnit.HOURS).plusSeconds(60);
        Game game = gameRepository.save(Game.builder().sport("Basketball").location("Gym").time(time).user(owner).build());
        jdbc.update("INSERT INTO game_participants (game_id, user_id) VALUES (?, ?)", game.getId(), p1.getId());

        notifier.remind24h();

        List<Notification> notes = notificationRepository.findAll();
        assertEquals(2, notes.size());
        assertTrue(notes.stream().allMatch(n -> n.getMessage().contains("Game reminder")));
        assertEquals(2, pushOutboxRepository.count());
        ArgumentCaptor<Map<String,String>> modelCap = ArgumentCaptor.forClass(Map.class);
        verify(emailService, times(2)).sendGameEventEmailNow(anyString(), eq("reminder"), modelCap.capture(), any());
        assertEquals("Basketball", modelCap.getValue().get("sport"));
    }
}
