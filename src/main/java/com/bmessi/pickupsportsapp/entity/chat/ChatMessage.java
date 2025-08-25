package com.bmessi.pickupsportsapp.entity.chat;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import com.bmessi.pickupsportsapp.entity.game.Game;

import java.time.Instant;

@Entity
@Table(
        name = "chat_messages",
        indexes = {
                @Index(name = "idx_chat_game", columnList = "game_id"),
                @Index(name = "idx_chat_sent_at", columnList = "sent_at"),
                @Index(name = "idx_chat_client", columnList = "client_id")
        },
        uniqueConstraints = {
                // enables idempotency by (game_id, client_id)
                @UniqueConstraint(name = "uk_chat_game_client", columnNames = {"game_id", "client_id"})
        }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** optional client-generated UUID for idempotency */
    @Column(name = "client_id", length = 64)
    private String clientId;

    // keep it simple: store sender text (no FK), so system messages are easy
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
