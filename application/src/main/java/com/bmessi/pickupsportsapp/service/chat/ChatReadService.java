package com.bmessi.pickupsportsapp.service.chat;

import com.bmessi.pickupsportsapp.entity.ChatReadCursor;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.ChatMessageRepository;
import com.bmessi.pickupsportsapp.repository.ChatReadCursorRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ChatReadService {

    private final ChatReadCursorRepository cursorRepo;
    private final ChatMessageRepository messageRepo;
    private final UserRepository users;
    private final io.micrometer.core.instrument.MeterRegistry meterRegistry;

    @Timed("chat.read.get")
    @Transactional(readOnly = true)
    public ChatReadCursor getOrDefault(String username, Long gameId) {
        User u = users.findOptionalByUsername(username).orElseThrow(() -> new IllegalArgumentException("user not found"));
        return cursorRepo.findByUser_IdAndGameId(u.getId(), gameId)
                .orElse(ChatReadCursor.builder().user(u).gameId(gameId).lastReadAt(Instant.EPOCH).build());
    }

    @Timed("chat.read.put")
    @Transactional
    public ChatReadCursor update(String username, Long gameId, Instant lastReadAt, Long lastReadMessageId) {
        User u = users.findOptionalByUsername(username).orElseThrow(() -> new IllegalArgumentException("user not found"));
        ChatReadCursor c = cursorRepo.findByUser_IdAndGameId(u.getId(), gameId)
                .orElse(ChatReadCursor.builder().user(u).gameId(gameId).build());
        if (lastReadAt != null && (c.getLastReadAt() == null || lastReadAt.isAfter(c.getLastReadAt()))) {
            c.setLastReadAt(lastReadAt);
        }
        if (lastReadMessageId != null) {
            c.setLastReadMessageId(lastReadMessageId);
        }
        ChatReadCursor saved = cursorRepo.save(c);
        try { meterRegistry.counter("chat.read.updated").increment(); } catch (Exception ignore) {}
        return saved;
    }

    @Timed("chat.unread.count")
    @Transactional(readOnly = true)
    public long unreadCount(String username, Long gameId) {
        ChatReadCursor c = getOrDefault(username, gameId);
        long count = messageRepo.countByGame_IdAndSentAtAfter(gameId, c.getLastReadAt() == null ? Instant.EPOCH : c.getLastReadAt());
        try { meterRegistry.summary("chat.unread.counts").record(count); } catch (Exception ignore) {}
        return count;
    }
}
