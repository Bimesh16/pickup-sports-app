package integration.com.bmessi.pickupsportsapp.service.notification;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.notification.Notification;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.NotificationRepository;
import com.bmessi.pickupsportsapp.repository.PushOutboxRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.service.EmailService;
import com.bmessi.pickupsportsapp.service.game.WaitlistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
class PromotionNotifierIntegrationTest {

    @Autowired
    private WaitlistService waitlistService;
    @Autowired
    private JdbcTemplate jdbc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GameRepository gameRepository;
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private PushOutboxRepository pushOutboxRepository;
    @MockitoBean
    private EmailService emailService;

    @BeforeEach
    void setup() {
        jdbc.execute("CREATE TABLE IF NOT EXISTS game_waitlist (" +
                "game_id BIGINT NOT NULL, " +
                "user_id BIGINT NOT NULL, " +
                "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "PRIMARY KEY (game_id, user_id))");
        pushOutboxRepository.deleteAll();
        notificationRepository.deleteAll();
    }

    @Test
    void promotionDispatchesNotifications() {
        User owner = userRepository.save(User.builder().username("owner@ex.com").password("pw").build());
        User u1 = userRepository.save(User.builder().username("a@ex.com").password("pw").build());
        Game game = gameRepository.save(Game.builder().sport("Soccer").location("Park").time(Instant.now()).user(owner).build());

        assertTrue(waitlistService.addToWaitlist(game.getId(), u1.getId()));

        List<Long> promoted = waitlistService.promoteUpTo(game.getId(), 1);
        assertEquals(List.of(u1.getId()), promoted);

        List<Notification> notes = notificationRepository.findAll();
        assertEquals(1, notes.size());
        assertEquals("You’ve been promoted from the waitlist", notes.get(0).getMessage());

        assertEquals(1, pushOutboxRepository.count());
        assertEquals("You’ve been promoted from the waitlist", pushOutboxRepository.findAll().get(0).getTitle());

        ArgumentCaptor<Map<String,String>> modelCap = ArgumentCaptor.forClass(Map.class);
        verify(emailService).sendGameEventEmailNow(eq(u1.getUsername()), eq("promoted"), modelCap.capture(), any());
        assertEquals("Soccer", modelCap.getValue().get("sport"));
        assertEquals("Park", modelCap.getValue().get("location"));
    }
}
