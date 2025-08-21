package com.bmessi.pickupsportsapp.service.chat;

import com.bmessi.pickupsportsapp.dto.ChatMessageDTO;

import java.time.Instant;
import java.util.List;

public interface ChatService {
    /** Idempotent save by (gameId, clientId if provided). Returns the canonical saved message. */
    ChatMessageDTO record(Long gameId, ChatMessageDTO msg);

    /** Return up to `limit` messages (newest first), before `before` cutoff. */
    List<ChatMessageDTO> history(Long gameId, Instant before, int limit);

    /** Latest N messages for a room (oldest -> newest for UI append). */
    List<ChatMessageDTO> latest(Long gameId, int limit);

    /** Messages strictly after timestamp (oldest -> newest) for reconnect deltas. */
    List<ChatMessageDTO> since(Long gameId, Instant after, int limit);
}
