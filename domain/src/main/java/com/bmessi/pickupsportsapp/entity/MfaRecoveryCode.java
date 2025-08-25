package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "mfa_recovery_code", indexes = {
        @Index(name = "idx_mfa_recovery_user", columnList = "user_id"),
        @Index(name = "idx_mfa_recovery_consumed", columnList = "consumedAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MfaRecoveryCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_mfa_recovery_user"))
    private User user;

    // SHA-256 hex of the recovery code
    @Column(nullable = false, length = 64, unique = true)
    private String codeHash;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant consumedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public boolean isConsumed() {
        return consumedAt != null;
    }
}
