package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.ChatMessageDTO;
import com.bmessi.pickupsportsapp.entity.ChatMessage;
import com.bmessi.pickupsportsapp.entity.Game;
import com.bmessi.pickupsportsapp.repository.ChatMessageRepository;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatMessageRepository chatRepo;
    private final GameRepository gameRepo;

    @Override
    @Transactional
    public void record(Long gameId, ChatMessageDTO dto) {
        if (dto.getSentAt() == null) {
            dto.setSentAt(Instant.now());
        }
        Game game = gameRepo.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));

        ChatMessage entity = ChatMessage.builder()
                .game(game)
                .sender(dto.getSender())
                .content(dto.getContent())
                .sentAt(dto.getSentAt())
                .build();

        chatRepo.save(entity);
        log.debug("Saved chat message for game {} from {} at {}", gameId, dto.getSender(), dto.getSentAt());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> history(Long gameId, Instant before, int limit) {
        Instant cutoff = (before != null) ? before : Instant.now();
        int pageSize = Math.max(1, Math.min(200, limit <= 0 ? 50 : limit));

        Game game = gameRepo.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));

        return chatRepo
                .findByGameAndSentAtLessThanEqualOrderBySentAtDesc(
                        game, cutoff, PageRequest.of(0, pageSize)
                )
                .stream()
                .map(m -> {
                    ChatMessageDTO dto = new ChatMessageDTO();
                    dto.setSender(m.getSender());
                    dto.setContent(m.getContent());
                    dto.setSentAt(m.getSentAt());
                    return dto;
                })
                .toList();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<ChatMessageDTO> latest(Long gameId, int limit) {
        int size = Math.max(1, Math.min(200, limit <= 0 ? 50 : limit));
        var page = org.springframework.data.domain.PageRequest.of(0, size);
        var desc = chatRepo.findByGame_IdOrderBySentAtDesc(gameId, page);

        // return ASC for natural render (oldest → newest)
        java.util.List<ChatMessage> asc = new java.util.ArrayList<>(desc);
        java.util.Collections.reverse(asc);

        return asc.stream().map(m -> {
            ChatMessageDTO dto = new ChatMessageDTO();
            dto.setSender(m.getSender());
            dto.setContent(m.getContent());
            dto.setSentAt(m.getSentAt());
            return dto;
        }).toList();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<ChatMessageDTO> since(Long gameId, Instant after, int limit) {
        if (after == null) after = Instant.EPOCH;
        int size = Math.max(1, Math.min(500, limit <= 0 ? 100 : limit));
        var page = org.springframework.data.domain.PageRequest.of(0, size);

        return chatRepo.findByGame_IdAndSentAtAfterOrderBySentAtAsc(gameId, after, page)
                .stream()
                .map(m -> {
                    ChatMessageDTO dto = new ChatMessageDTO();
                    dto.setSender(m.getSender());
                    dto.setContent(m.getContent());
                    dto.setSentAt(m.getSentAt());
                    return dto;
                })
                .toList();
    }
}
