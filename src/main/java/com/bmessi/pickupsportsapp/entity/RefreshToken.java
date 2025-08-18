package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "refresh_token",
        indexes = {
                @Index(name = "idx_rt_user_id", columnList = "user_id"),
                @Index(name = "idx_rt_token_hash", columnList = "tokenHash", unique = true)
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Store only a hash of the refresh token value
    @Column(nullable = false, length = 255)
    private String tokenHash;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private com.bmessi.pickupsportsapp.entity.User user;

    @Column(nullable = false)
    private OffsetDateTime expiresAt;

    private OffsetDateTime revokedAt;

    // For rotation tracking; if set, this token has already been rotated
    @Column(length = 255)
    private String replacedByTokenHash;

    // Optimistic locking to prevent concurrent rotations of the same token
    @Version
    private Long version;

    // ---------------- Convenience and status helpers ----------------

    public boolean isRevoked() {
        return revokedAt != null;
    }

    public boolean isExpired() {
        return OffsetDateTime.now().isAfter(expiresAt);
    }

    // Active = not revoked and not expired (single-use semantics)
    public boolean isActive() {
        return !isRevoked() && !isExpired();
    }

    // Mark token as revoked now (logout or compromise)
    public void revokeNow() {
        if (this.revokedAt == null) {
            this.revokedAt = OffsetDateTime.now();
        }
    }

    // Rotate this token: revoke it and record the replacement's hash
    public void rotateTo(String newTokenHash) {
        revokeNow();
        this.replacedByTokenHash = newTokenHash;
    }

    // True if the token was already used for rotation (reuse attempt indicator)
    public boolean wasRotated() {
        return this.replacedByTokenHash != null;
    }
}