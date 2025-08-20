package com.bmessi.pickupsportsapp.service.gameaccess;

import com.bmessi.pickupsportsapp.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class GameAccessServiceImpl implements GameAccessService {

    private final GameRepository gameRepository;

    private static final long TTL_SECONDS = 30;

    private static final class Entry {
        final boolean allowed;
        final long expiresAtEpochSec;
        Entry(boolean allowed, long expiresAtEpochSec) {
            this.allowed = allowed; this.expiresAtEpochSec = expiresAtEpochSec;
        }
    }
    private final Map<String, Entry> cache = new ConcurrentHashMap<>();

    @Override
    public boolean canAccessGame(Long gameId, String username) {
        if (gameId == null || username == null || username.isBlank()) return false;

        final String key = gameId + "|" + username.toLowerCase();
        final long now = Instant.now().getEpochSecond();

        Entry e = cache.get(key);
        if (e != null && e.expiresAtEpochSec > now) {
            return e.allowed;
        }

        // Fetch game with participants and creator eagerly
        var gameOpt = gameRepository.findWithParticipantsById(gameId);
        boolean allowed = gameOpt.map(g -> {
            String creatorUsername = (g.getUser() != null) ? g.getUser().getUsername() : null;
            if (Objects.equals(username, creatorUsername)) return true;

            // Participant membership
            return g.getParticipants() != null && g.getParticipants().stream()
                    .anyMatch(u -> username.equals(u.getUsername()));
        }).orElse(false);

        cache.put(key, new Entry(allowed, now + TTL_SECONDS));
        return allowed;
    }
}
