package com.bmessi.pickupsportsapp.dto;

import java.time.Instant;

public class ChatAckDTO {
    private Long gameId;
    private String clientId;   // echoes client-provided id
    private Long messageId;    // server id
    private Instant sentAt;    // canonical time persisted

    public ChatAckDTO() {}
    public ChatAckDTO(Long gameId, String clientId, Long messageId, Instant sentAt) {
        this.gameId = gameId; this.clientId = clientId; this.messageId = messageId; this.sentAt = sentAt;
    }
    public Long getGameId() { return gameId; }
    public void setGameId(Long gameId) { this.gameId = gameId; }
    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }
    public Long getMessageId() { return messageId; }
    public void setMessageId(Long messageId) { this.messageId = messageId; }
    public Instant getSentAt() { return sentAt; }
    public void setSentAt(Instant sentAt) { this.sentAt = sentAt; }
}
