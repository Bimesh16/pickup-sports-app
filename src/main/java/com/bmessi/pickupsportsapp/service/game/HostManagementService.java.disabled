package com.bmessi.pickupsportsapp.service.game;

import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class HostManagementService {

    private final GameRepository games;
    private final WaitlistService waitlistService;

    /** Force promote the next user on the waitlist. */
    public void promoteFromWaitlist(Long gameId, Long userId, String actor) {
        ensureHost(gameId, actor);
        // Promote up to one user from the waitlist. Specific userId is ignored in this simple implementation.
        waitlistService.promoteUpTo(gameId, 1);
    }

    /** Remove a participant from the game. */
    public void kickParticipant(Long gameId, Long userId, String actor) {
        Game g = ensureHost(gameId, actor);
        if (g.getParticipants() != null) {
            g.getParticipants().removeIf(u -> u.getId() != null && u.getId().equals(userId));
            games.save(g);
        }
    }

    /** Kick and ban a participant from the game. Banning is a no-op beyond kicking in this placeholder. */
    public void banParticipant(Long gameId, Long userId, String actor) {
        kickParticipant(gameId, userId, actor);
        // Additional ban logic would go here.
    }

    /** Add a co-host for the game. */
    public void addCoHost(Long gameId, Long userId, String actor) {
        ensureHost(gameId, actor);
        // Actual persistence of co-hosts not implemented.
    }

    /** Remove a co-host from the game. */
    public void removeCoHost(Long gameId, Long userId, String actor) {
        ensureHost(gameId, actor);
        // Actual persistence of co-hosts not implemented.
    }

    /** Generate an invite token for the game. */
    public String generateInviteToken(Long gameId, String actor) {
        ensureHost(gameId, actor);
        return UUID.randomUUID().toString();
    }

    private Game ensureHost(Long gameId, String actor) {
        Game g = games.findWithParticipantsById(gameId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Game not found"));
        String owner = g.getUser() != null ? g.getUser().getUsername() : null;
        if (actor == null || !actor.equals(owner)) {
            throw new AccessDeniedException("Not authorized to manage this game");
        }
        return g;
    }
}

