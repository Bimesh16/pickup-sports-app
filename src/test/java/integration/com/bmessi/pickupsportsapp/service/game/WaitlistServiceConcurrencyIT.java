package integration.com.bmessi.pickupsportsapp.service.game;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.service.game.WaitlistService;
import com.bmessi.pickupsportsapp.service.push.PushSenderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
class WaitlistServiceConcurrencyIT {

    @Autowired
    private WaitlistService waitlistService;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameRepository gameRepository;

    @MockitoBean
    private PushSenderService push;

    @BeforeEach
    void setup() {
        jdbc.execute("CREATE TABLE IF NOT EXISTS game_waitlist (" +
                "game_id BIGINT NOT NULL, " +
                "user_id BIGINT NOT NULL, " +
                "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "PRIMARY KEY (game_id, user_id))");
    }

    @Test
    void concurrentPromotions_doNotDuplicateAndEnqueuePush() throws Exception {
        User owner = userRepository.save(User.builder().username("owner@ex.com").password("pw").build());
        User u1 = userRepository.save(User.builder().username("a@ex.com").password("pw").build());
        User u2 = userRepository.save(User.builder().username("b@ex.com").password("pw").build());
        Game game = gameRepository.save(Game.builder().sport("Soccer").location("Park").time(Instant.now()).user(owner).build());

        assertTrue(waitlistService.addToWaitlist(game.getId(), u1.getId()));
        Thread.sleep(5);
        assertTrue(waitlistService.addToWaitlist(game.getId(), u2.getId()));

        ExecutorService exec = Executors.newFixedThreadPool(2);
        CountDownLatch latch = new CountDownLatch(1);

        Callable<List<Long>> task = () -> {
            latch.await();
            return waitlistService.promoteUpTo(game.getId(), 1);
        };

        Future<List<Long>> f1 = exec.submit(task);
        Future<List<Long>> f2 = exec.submit(task);
        latch.countDown();

        List<Long> r1 = f1.get(5, TimeUnit.SECONDS);
        List<Long> r2 = f2.get(5, TimeUnit.SECONDS);
        exec.shutdown();

        List<Long> all = new ArrayList<>();
        all.addAll(r1);
        all.addAll(r2);

        assertEquals(2, all.size());
        assertEquals(2, Set.copyOf(all).size());
        assertEquals(0, waitlistService.waitlistCount(game.getId()));

        verify(push).enqueue(eq(u1.getUsername()), any(), any(), any());
        verify(push).enqueue(eq(u2.getUsername()), any(), any(), any());
    }
}