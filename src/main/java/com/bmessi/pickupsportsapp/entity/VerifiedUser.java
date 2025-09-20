package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "verified_users", indexes = {
        @Index(name = "idx_verified_user_username", columnList = "username", unique = true)
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifiedUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String username;

    @Column(nullable = false)
    private Instant verifiedAt;

    @Column(length = 255)
    private String verifiedBy; // admin who verified the user

    @Column(length = 500)
    private String notes;

    @PrePersist
    public void prePersist() {
        if (verifiedAt == null) {
            verifiedAt = Instant.now();
        }
    }
}
