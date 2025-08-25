package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "social_account", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"provider", "subject"})
}, indexes = {
        @Index(name = "idx_social_account_provider", columnList = "provider"),
        @Index(name = "idx_social_account_email", columnList = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 32)
    private String provider; // "google", "apple"

    @Column(nullable = false, length = 255)
    private String subject; // provider's user id (sub)

    @Column(length = 320)
    private String email;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_social_account_user"))
    private User user;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
