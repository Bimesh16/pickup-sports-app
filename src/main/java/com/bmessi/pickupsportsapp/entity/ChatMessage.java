package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "chat_message", indexes = {
        @Index(name = "idx_chat_game_time", columnList = "game_id, sent_at DESC")
})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to game
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    // Keep sender as simple string to avoid coupling to your user entity
    @Column(name = "sender_username", nullable = false, length = 100)
    private String senderUsername;

    @Column(name = "content", nullable = false, length = 2000)
    private String content;

    @Column(name = "sent_at", nullable = false, updatable = false)
    private Instant sentAt;

    @PrePersist
    public void prePersist() {
        if (sentAt == null) sentAt = Instant.now();
    }

    // getters/setters
    public Long getId() { return id; }
    public Game getGame() { return game; }
    public void setGame(Game game) { this.game = game; }
    public String getSenderUsername() { return senderUsername; }
    public void setSenderUsername(String senderUsername) { this.senderUsername = senderUsername; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Instant getSentAt() { return sentAt; }
    public void setSentAt(Instant sentAt) { this.sentAt = sentAt; }
}
