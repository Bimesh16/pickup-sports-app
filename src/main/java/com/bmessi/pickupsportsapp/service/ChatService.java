package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.ChatMessageDTO;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatService {

    // gameId -> messages
    private final Map<Long, Deque<ChatMessageDTO>> store = new ConcurrentHashMap<>();

    private final int perGameLimit = 500;

    /** Save a message in memory */
    public void record(Long gameId, ChatMessageDTO msg) {
        if (msg.getSentAt() == null) {
            msg.setSentAt(Instant.now());
        }
        Deque<ChatMessageDTO> q = store.computeIfAbsent(gameId, id -> new ArrayDeque<>());
        synchronized (q) {
            q.addLast(msg);
            while (q.size() > perGameLimit) {
                q.removeFirst();
            }
        }
    }

    /** Return up to `limit` messages (newest first), before a cutoff time */
    public List<ChatMessageDTO> history(Long gameId, Instant before, int limit) {
        Instant cutoff = (before != null) ? before : Instant.now();
        int effectiveLimit = (limit <= 0) ? 50 : Math.min(limit, perGameLimit);

        Deque<ChatMessageDTO> q = store.get(gameId);
        if (q == null) return List.of();

        List<ChatMessageDTO> snapshot;
        synchronized (q) {
            snapshot = new ArrayList<>(q);
        }

        return snapshot.stream()
                .filter(m -> !m.getSentAt().isAfter(cutoff))
                .sorted(Comparator.comparing(ChatMessageDTO::getSentAt).reversed())
                .limit(effectiveLimit)
                .toList();
    }
}
