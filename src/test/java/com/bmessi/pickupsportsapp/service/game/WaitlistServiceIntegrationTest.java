package com.bmessi.pickupsportsapp.service.game;

import com.bmessi.pickupsportsapp.entity.Game;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class WaitlistServiceIntegrationTest {

    @Autowired
    private WaitlistService waitlistService;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameRepository gameRepository;

    @BeforeEach
    void setup() {
        jdbc.execute("CREATE TABLE IF NOT EXISTS game_waitlist (" +
                "game_id BIGINT NOT NULL, " +
                "user_id BIGINT NOT NULL, " +
                "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "PRIMARY KEY (game_id, user_id))");
    }

    @Test
    void addPromoteAndRemoveFromWaitlist() {
        User owner = userRepository.save(User.builder().username("owner@ex.com").password("pw").build());
        User u1 = userRepository.save(User.builder().username("a@ex.com").password("pw").build());
        User u2 = userRepository.save(User.builder().username("b@ex.com").password("pw").build());
        Game game = gameRepository.save(Game.builder().sport("Soccer").location("Park").time(Instant.now()).user(owner).build());

        assertEquals(0, waitlistService.participantCount(game.getId()));
        assertTrue(waitlistService.addToWaitlist(game.getId(), u1.getId()));
        assertTrue(waitlistService.addToWaitlist(game.getId(), u2.getId()));
        assertEquals(2, waitlistService.waitlistCount(game.getId()));

        List<Long> promoted = waitlistService.promoteUpTo(game.getId(), 1);
        assertEquals(1, promoted.size());
        assertEquals(1, waitlistService.waitlistCount(game.getId()));

        assertTrue(waitlistService.removeFromWaitlist(game.getId(), u2.getId()));
        assertEquals(0, waitlistService.waitlistCount(game.getId()));
    }
}
