package unit.com.bmessi.pickupsportsapp.service.chat;

import com.bmessi.pickupsportsapp.dto.chat.ChatMessageDTO;
import com.bmessi.pickupsportsapp.entity.chat.ChatMessage;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.repository.ChatMessageRepository;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.security.RedisRateLimiterService;
import com.bmessi.pickupsportsapp.service.chat.ChatModerationService;
import com.bmessi.pickupsportsapp.service.chat.ChatServiceImpl;
import com.bmessi.pickupsportsapp.service.chat.ProfanityFilterService;
import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceImplTest {

    @Mock ChatMessageRepository chatRepo;
    @Mock GameRepository gameRepo;
    @Mock
    ChatModerationService moderationService;
    @Mock
    ProfanityFilterService profanityFilter;
    @Mock MeterRegistry meterRegistry;
    @Mock RedisRateLimiterService rateLimiter;

    @InjectMocks
    ChatServiceImpl service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "chatRateLimit", 2);
        ReflectionTestUtils.setField(service, "chatRateWindowSeconds", 60);

        when(chatRepo.findByGame_IdAndClientId(anyLong(), anyString())).thenReturn(Optional.empty());
        when(gameRepo.findById(anyLong())).thenReturn(Optional.of(Game.builder().id(1L).build()));
        when(chatRepo.save(any())).thenAnswer(inv -> {
            ChatMessage m = inv.getArgument(0);
            m.setId(10L);
            return m;
        });
        when(moderationService.isKicked(anyLong(), anyString())).thenReturn(false);
        when(moderationService.isMuted(anyLong(), anyString())).thenReturn(false);
        when(profanityFilter.isEnabled()).thenReturn(false);
    }

    @Test
    void record_allowsWhenUnderLimit() {
        when(rateLimiter.allow(anyString(), anyInt(), anyInt())).thenReturn(true);

        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setSender("bob");
        dto.setContent("hi");
        dto.setSentAt(Instant.now());

        ChatMessageDTO saved = service.record(1L, dto);

        assertEquals(10L, saved.getMessageId());
        verify(chatRepo).save(any(ChatMessage.class));
    }

    @Test
    void record_rejectsWhenRateLimitExceeded() {
        when(rateLimiter.allow(anyString(), anyInt(), anyInt())).thenReturn(false);

        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setSender("bob");
        dto.setContent("spam");
        dto.setSentAt(Instant.now());

        assertThrows(IllegalArgumentException.class, () -> service.record(1L, dto));
        verify(chatRepo, never()).save(any());
    }
}
