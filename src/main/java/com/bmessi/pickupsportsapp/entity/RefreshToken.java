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
    private User user;

    @Column(nullable = false)
    private OffsetDateTime expiresAt;

    private OffsetDateTime revokedAt;

    private String replacedByTokenHash; // optional, for rotation tracking

    public boolean isActive() {
        return revokedAt == null && OffsetDateTime.now().isBefore(expiresAt);
    }
}