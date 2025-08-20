package com.bmessi.pickupsportsapp.service.chat;

import com.bmessi.pickupsportsapp.dto.ChatMessageDTO;

import java.time.Instant;
import java.util.List;

public interface ChatService {
    /** Save a message (will set sentAt if null). */
    void record(Long gameId, ChatMessageDTO msg);

    /** Return up to `limit` messages (newest first), before `before` cutoff. */
    List<ChatMessageDTO> history(Long gameId, Instant before, int limit);

    List<ChatMessageDTO> latest(Long gameId, int limit);

    List<ChatMessageDTO> since(Long gameId, Instant after, int limit);

}
