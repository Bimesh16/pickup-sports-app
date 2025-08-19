package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_chat_game", columnList = "game_id"),
        @Index(name = "idx_chat_sent_at", columnList = "sent_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // keep it simple: we just store sender username text (no FK), so system messages are easy
    @Column(nullable = false, length = 100)
    private String sender;

    @Column(nullable = false, length = 2000)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @CreationTimestamp
    @Column(name = "sent_at", nullable = false, updatable = false)
    private Instant sentAt;
}
