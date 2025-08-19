package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.ReadStatusDTO;
import com.bmessi.pickupsportsapp.service.ReadReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/games/{gameId}/chat")
public class ReadStatusController {

    private final ReadReceiptService readReceiptService;

    @GetMapping("/read-status")
    public ReadStatusDTO status(@PathVariable Long gameId, @RequestParam Long messageId) {
        return readReceiptService.status(gameId, messageId);
    }
}
