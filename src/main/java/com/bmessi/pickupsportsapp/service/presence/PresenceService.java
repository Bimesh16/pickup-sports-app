package com.bmessi.pickupsportsapp.service.presence;

import java.util.Set;

public interface PresenceService {
    /** Update last-seen for user; returns true if this was a NEW join (previously offline). */
    boolean heartbeat(Long gameId, String username);

    /** Explicitly mark user offline. */
    void leave(Long gameId, String username);

    /** Current online usernames for a game (computed via TTL window). */
    Set<String> online(Long gameId);

    /** Lightweight count of online users. */
    long onlineCount(Long gameId);
}
