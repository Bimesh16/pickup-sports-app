package com.bmessi.pickupsportsapp.service.chat;

import com.bmessi.pickupsportsapp.entity.ChatReadCursor;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.ChatMessageRepository;
import com.bmessi.pickupsportsapp.repository.ChatReadCursorRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatReadServiceTest {

    @Mock ChatReadCursorRepository cursorRepo;
    @Mock ChatMessageRepository messageRepo;
    @Mock UserRepository users;
    @Mock MeterRegistry meterRegistry;

    @InjectMocks ChatReadService service;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).username("alice").build();
        when(users.findOptionalByUsername("alice")).thenReturn(Optional.of(user));
    }

    @Test
    void getOrDefault_returnsDefaultWhenMissing() {
        when(cursorRepo.findByUser_IdAndGameId(1L, 42L)).thenReturn(Optional.empty());

        ChatReadCursor c = service.getOrDefault("alice", 42L);

        assertNotNull(c);
        assertEquals(1L, c.getUser().getId());
        assertEquals(42L, c.getGameId());
        assertEquals(Instant.EPOCH, c.getLastReadAt());
    }

    @Test
    void update_advancesTimestampAndSetsMessageId() {
        ChatReadCursor existing = ChatReadCursor.builder()
                .id(5L).user(user).gameId(42L).lastReadAt(Instant.parse("2024-01-01T00:00:00Z"))
                .build();
        when(cursorRepo.findByUser_IdAndGameId(1L, 42L)).thenReturn(Optional.of(existing));
        when(cursorRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Instant newer = Instant.parse("2024-02-01T00:00:00Z");
        ChatReadCursor saved = service.update("alice", 42L, newer, 777L);

        assertEquals(newer, saved.getLastReadAt());
        assertEquals(777L, saved.getLastReadMessageId());
        verify(cursorRepo).save(any(ChatReadCursor.class));
    }

    @Test
    void unreadCount_usesLastReadToCount() {
        ChatReadCursor existing = ChatReadCursor.builder()
                .user(user).gameId(42L).lastReadAt(Instant.parse("2024-01-01T00:00:00Z"))
                .build();
        when(cursorRepo.findByUser_IdAndGameId(1L, 42L)).thenReturn(Optional.of(existing));
        when(messageRepo.countByGame_IdAndSentAtAfter(eq(42L), any())).thenReturn(12L);

        long unread = service.unreadCount("alice", 42L);

        assertEquals(12L, unread);
    }
}
