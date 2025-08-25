package com.bmessi.pickupsportsapp.entity.auth;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "refresh_token", indexes = {
        @Index(name = "idx_refresh_token_hash", columnList = "tokenHash"),
        @Index(name = "idx_refresh_token_user", columnList = "user_id")
})
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 128)
    private String tokenHash;

    @Column(nullable = false, length = 128)
    private String nonceHash;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_refresh_token_user"))
    private User user;

    @Column(nullable = false)
    private Instant expiresAt;

    private Instant revokedAt;

    private String replacedByTokenHash;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now(); // persisted creation time

    @Column(length = 64)
    private String deviceId;

    @Column(length = 255)
    private String userAgent;

    @Column(length = 64)
    private String issuedIp;

    private Instant lastUsedAt;

    public boolean isActive() {
        return revokedAt == null && expiresAt != null && expiresAt.isAfter(Instant.now());
    }
}
