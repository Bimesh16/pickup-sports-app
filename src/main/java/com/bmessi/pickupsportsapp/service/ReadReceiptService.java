package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.ReadStatusDTO;
import com.bmessi.pickupsportsapp.entity.ChatMessage;
import com.bmessi.pickupsportsapp.entity.ChatReadReceipt;
import com.bmessi.pickupsportsapp.repository.ChatMessageRepository;
import com.bmessi.pickupsportsapp.repository.ChatReadReceiptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReadReceiptService {

    private final ChatReadReceiptRepository receiptRepo;
    private final ChatMessageRepository messageRepo;

    @Transactional
    public ReadStatusDTO markRead(Long gameId, Long messageId, String reader, Instant when) {
        if (messageId == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "messageId required");
        if (reader == null || reader.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "reader required");

        ChatMessage msg = messageRepo.findById(messageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "message not found"));
        if (!msg.getGame().getId().equals(gameId))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "message not in this game");

        if (!receiptRepo.existsByMessage_IdAndReader(messageId, reader)) {
            ChatReadReceipt rec = ChatReadReceipt.builder()
                    .message(msg)
                    .reader(reader)
                    // readAt is auto @CreationTimestamp
                    .build();
            receiptRepo.save(rec);
        }
        long count = receiptRepo.countByMessage_Id(messageId);
        List<String> readers = receiptRepo.findReaders(messageId);
        return new ReadStatusDTO(messageId, count, readers);
    }

    @Transactional(readOnly = true)
    public ReadStatusDTO status(Long gameId, Long messageId) {
        ChatMessage msg = messageRepo.findById(messageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "message not found"));
        if (!msg.getGame().getId().equals(gameId))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "message not in this game");
        long count = receiptRepo.countByMessage_Id(messageId);
        List<String> readers = receiptRepo.findReaders(messageId);
        return new ReadStatusDTO(messageId, count, readers);
    }
}
