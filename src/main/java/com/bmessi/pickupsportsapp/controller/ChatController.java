package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.service.ChatService;
import com.bmessi.pickupsportsapp.service.ChatService.ConversationSummary;
import com.bmessi.pickupsportsapp.service.ChatService.MessageSummary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationSummary>> getConversations(Authentication authentication) {
        try {
            String username = authentication.getName();
            List<ConversationSummary> conversations = chatService.getConversations(username);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<MessageSummary>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        try {
            List<MessageSummary> messages = chatService.getMessages(conversationId, page, size);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<MessageSummary> sendMessage(
            @PathVariable Long conversationId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            String content = request.get("content");
            String messageType = request.getOrDefault("type", "TEXT");
            
            MessageSummary message = chatService.sendMessage(conversationId, username, content, messageType);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/conversations")
    public ResponseEntity<ConversationSummary> createConversation(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            @SuppressWarnings("unchecked")
            List<String> participantUsernames = (List<String>) request.get("participantIds");
            String title = (String) request.get("title");
            String type = (String) request.getOrDefault("type", "GROUP");
            
            ConversationSummary conversation = chatService.createConversation(
                username, participantUsernames, title, type);
            return ResponseEntity.ok(conversation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long conversationId,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            chatService.markAsRead(conversationId, username);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
