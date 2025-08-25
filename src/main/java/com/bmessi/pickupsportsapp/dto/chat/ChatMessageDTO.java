package com.bmessi.pickupsportsapp.dto.chat;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(name = "ChatMessage", description = "Represents a chat message in a game room")
public class ChatMessageDTO {
    @Schema(description = "Server-side message id", example = "101")
    private Long messageId;   // server DB id
    @Schema(description = "Client-generated idempotency key", example = "e9b2f5a8-3f8c-4d20-9c63-97c2a3b3f4e1")
    private String clientId;  // client-generated UUID for idempotency
    @Schema(description = "Sender username", example = "alice")
    private String sender;
    @Schema(description = "Message content", example = "Welcome!")
    private String content;
    @Schema(description = "UTC timestamp of when the message was sent", example = "2025-08-25T10:01:00Z")
    private Instant sentAt;

    public Long getMessageId() { return messageId; }
    public void setMessageId(Long messageId) { this.messageId = messageId; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Instant getSentAt() { return sentAt; }
    public void setSentAt(Instant sentAt) { this.sentAt = sentAt; }
}
