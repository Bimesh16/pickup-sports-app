package com.bmessi.pickupsportsapp.dto;

import java.time.Instant;

public class ChatMessageDTO {
    private String sender;
    private String content;
    private Instant sentAt;

    public ChatMessageDTO() {}
    public ChatMessageDTO(String sender, String content, Instant sentAt) {
        this.sender = sender;
        this.content = content;
        this.sentAt = sentAt;
    }

    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Instant getSentAt() { return sentAt; }
    public void setSentAt(Instant sentAt) { this.sentAt = sentAt; }
}