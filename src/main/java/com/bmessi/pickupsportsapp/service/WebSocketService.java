package com.bmessi.pickupsportsapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class WebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendNotification(String username, Map<String, Object> notification) {
        messagingTemplate.convertAndSendToUser(
            username, 
            "/queue/notifications", 
            notification
        );
    }

    public void sendChatMessage(Long conversationId, Map<String, Object> message) {
        messagingTemplate.convertAndSend(
            "/topic/conversation/" + conversationId, 
            message
        );
    }

    public void sendGameUpdate(Long gameId, Map<String, Object> update) {
        messagingTemplate.convertAndSend(
            "/topic/game/" + gameId, 
            update
        );
    }

    public void sendSystemMessage(String username, Map<String, Object> message) {
        messagingTemplate.convertAndSendToUser(
            username, 
            "/queue/system", 
            message
        );
    }
}
