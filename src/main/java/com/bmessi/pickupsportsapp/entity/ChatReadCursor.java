package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "chat_read_cursor", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "game_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatReadCursor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_crc_user"))
    private User user;

    @Column(name = "game_id", nullable = false)
    private Long gameId;

    @Column(name = "last_read_at", nullable = false)
    private Instant lastReadAt;

    @Column(name = "last_read_message_id")
    private Long lastReadMessageId;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (lastReadAt == null) lastReadAt = Instant.EPOCH;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
