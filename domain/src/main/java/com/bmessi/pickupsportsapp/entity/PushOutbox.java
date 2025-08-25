package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "push_outbox", indexes = {
        @Index(name = "idx_push_outbox_status", columnList = "status"),
        @Index(name = "idx_push_outbox_created_at", columnList = "createdAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PushOutbox {

    public enum Status { PENDING, SENT, FAILED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // receiver
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_push_outbox_user"))
    private User user;

    // payload
    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 2000)
    private String body;

    @Column(length = 1000)
    private String link;

    // status + diagnostics
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Status status;

    @Column(length = 1000)
    private String error;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant sentAt;

    // retry/backoff and DLQ
    @Column(nullable = false)
    @Builder.Default
    private int retryCount = 0;

    private Instant nextAttemptAt;

    private Instant deadAt;

    @Column(length = 255)
    private String deadReason;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (status == null) status = Status.PENDING;
    }
}
