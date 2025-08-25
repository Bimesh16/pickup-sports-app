package com.bmessi.pickupsportsapp.service.chat;

import com.bmessi.pickupsportsapp.dto.chat.ChatMessageDTO;
import com.bmessi.pickupsportsapp.entity.chat.ChatMessage;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.repository.ChatMessageRepository;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.security.RedisRateLimiterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.micrometer.core.annotation.Timed;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatMessageRepository chatRepo;
    private final GameRepository gameRepo;
    private final ChatModerationService moderationService;
    private final ProfanityFilterService profanityFilter;
    private final io.micrometer.core.instrument.MeterRegistry meterRegistry;
    private final java.util.Optional<com.bmessi.pickupsportsapp.security.RedisRateLimiterService> rateLimiter;

    @Value("${chat.rate-limit.limit:20}")
    int chatRateLimit;

    @Value("${chat.rate-limit.window-seconds:60}")
    int chatRateWindowSeconds;

    @Override
    @Transactional
    @Timed(value = "chat.record", description = "Time to persist a chat message")
    public ChatMessageDTO record(Long gameId, ChatMessageDTO dto) {
        if (dto.getSentAt() == null) dto.setSentAt(Instant.now());

        // Fast idempotency check without loading the Game entity first.
        if (dto.getClientId() != null && !dto.getClientId().isBlank()) {
            var existing = chatRepo.findByGame_IdAndClientId(gameId, dto.getClientId());
            if (existing.isPresent()) {
                return toDto(existing.get());
            }
        }

        // Validate sender and enforce moderation
        String username = dto.getSender();
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("sender required");
        }
        if (moderationService.isKicked(gameId, username)) {
            try { meterRegistry.counter("chat.moderation.block", "reason", "kicked").increment(); } catch (Exception ignore) {}
            throw new org.springframework.security.access.AccessDeniedException("kicked");
        }
        if (moderationService.isMuted(gameId, username)) {
            try { meterRegistry.counter("chat.moderation.block", "reason", "muted").increment(); } catch (Exception ignore) {}
            throw new org.springframework.security.access.AccessDeniedException("muted");
        }

        // Rate limiting
        boolean allowed = rateLimiter
                .map(rl -> rl.allow("chat:" + username, chatRateLimit, chatRateWindowSeconds))
                .orElse(true); // fail-open when limiter not configured
        if (!allowed) {
            try { meterRegistry.counter("chat.rate-limit", "result", "blocked").increment(); } catch (Exception ignore) {}
            throw new IllegalArgumentException("rate limit exceeded");
        }

        // Profanity handling
        if (profanityFilter.isEnabled() && dto.getContent() != null) {
            if (profanityFilter.containsProfanity(dto.getContent())) {
                if (profanityFilter.shouldReject()) {
                    try { meterRegistry.counter("chat.profanity", "action", "rejected").increment(); } catch (Exception ignore) {}
                    throw new IllegalArgumentException("message contains profanity");
                } else {
                    dto.setContent(profanityFilter.sanitize(dto.getContent()));
                    try { meterRegistry.counter("chat.profanity", "action", "sanitized").increment(); } catch (Exception ignore) {}
                }
            }
        }

        Game game = gameRepo.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));

        ChatMessage entity = ChatMessage.builder()
                .game(game)
                .clientId(blankToNull(dto.getClientId()))
                .sender(dto.getSender())
                .content(dto.getContent())
                .sentAt(dto.getSentAt())
                .build();

        try {
            entity = chatRepo.save(entity);
        } catch (DataIntegrityViolationException e) {
            // Race on unique (game_id, client_id): load the winner and return it.
            if (entity.getClientId() != null) {
                var winner = chatRepo.findByGame_IdAndClientId(gameId, entity.getClientId())
                        .orElseThrow(() -> e);
                try { meterRegistry.counter("chat.publish", "result", "duplicate").increment(); } catch (Exception ignore) {}
                return toDto(winner);
            }
            throw e;
        }

        try { meterRegistry.counter("chat.publish", "result", "accepted").increment(); } catch (Exception ignore) {}

        log.debug("Saved chat message id={} game={} from {} at {}",
                entity.getId(), gameId, dto.getSender(), dto.getSentAt());
        return toDto(entity);
    }

    @Override
    @Transactional(readOnly = true)
    @Timed(value = "chat.history", description = "Time to fetch chat history (before)")
    public List<ChatMessageDTO> history(Long gameId, Instant before, int limit) {
        Instant cutoff = (before != null) ? before : Instant.now();
        int size = clamp(limit, 1, 200, 50);

        Game game = gameRepo.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));

        return chatRepo
                .findByGameAndSentAtLessThanEqualOrderBySentAtDesc(
                        game, cutoff, PageRequest.of(0, size)
                )
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Timed(value = "chat.latest", description = "Time to fetch latest chat messages")
    public List<ChatMessageDTO> latest(Long gameId, int limit) {
        int size = clamp(limit, 1, 200, 50);
        var page = PageRequest.of(0, size);

        var desc = chatRepo.findByGame_IdOrderBySentAtDesc(gameId, page);
        var asc = new ArrayList<>(desc);
        Collections.reverse(asc); // return oldest -> newest
        return asc.stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Timed(value = "chat.since", description = "Time to fetch messages since timestamp")
    public List<ChatMessageDTO> since(Long gameId, Instant after, int limit) {
        Instant cutoff = (after == null) ? Instant.EPOCH : after;
        int size = clamp(limit, 1, 500, 100);
        var page = PageRequest.of(0, size);

        return chatRepo.findByGame_IdAndSentAtAfterOrderBySentAtAsc(gameId, cutoff, page)
                .stream()
                .map(this::toDto)
                .toList();
    }

    // ---------- helpers ----------

    private int clamp(int requested, int min, int max, int dflt) {
        int v = (requested <= 0) ? dflt : requested;
        return Math.min(max, Math.max(min, v));
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    private ChatMessageDTO toDto(ChatMessage m) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setMessageId(m.getId());
        dto.setClientId(m.getClientId());
        dto.setSender(m.getSender());
        dto.setContent(m.getContent());
        dto.setSentAt(m.getSentAt());
        return dto;
    }
}
