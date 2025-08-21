package com.bmessi.pickupsportsapp.service.chat;

public interface ChatMessagePublisher {
    void publish(String destination, Object payload);
}
