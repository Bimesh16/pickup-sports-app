package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class GameRepositoryTest {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void search_filtersBySportAndLocation() {
        User owner = userRepository.save(User.builder().username("owner@example.com").password("pw").build());
        gameRepository.save(Game.builder().sport("Basketball").location("NYC").time(Instant.now()).user(owner).build());
        gameRepository.save(Game.builder().sport("Soccer").location("LA").time(Instant.now()).user(owner).build());

        Page<Game> result = gameRepository.search("Basketball", "NYC", null, null, null, null, null, null, Pageable.unpaged());
        assertEquals(1, result.getTotalElements());
        assertEquals("Basketball", result.getContent().get(0).getSport());
    }
}
