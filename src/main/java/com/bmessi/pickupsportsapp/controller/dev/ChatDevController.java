package com.bmessi.pickupsportsapp.controller.dev;

import com.bmessi.pickupsportsapp.dto.ChatMessageDTO;
import com.bmessi.pickupsportsapp.service.chat.ChatMessagePublisher;
import com.bmessi.pickupsportsapp.service.chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@Profile("dev")
@RequiredArgsConstructor
public class ChatDevController {

    private final ChatService chatService;
    private final ChatMessagePublisher publisher;

    // POST /dev/games/{gameId}/chat
    @PostMapping("/dev/games/{gameId}/chat")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void devSend(@PathVariable Long gameId, @RequestBody ChatMessageDTO msg,
                        @RequestParam(defaultValue = "true") boolean broadcast) {
        if (msg.getSentAt() == null) msg.setSentAt(Instant.now());
        chatService.record(gameId, msg);
        if (broadcast) {
            publisher.publish("/topic/games/" + gameId + "/chat", msg);
        }
    }
}
