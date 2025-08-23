package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "password_reset_token", indexes = {
        @Index(name = "ix_prt_username", columnList = "username")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 200)
    private String token;

    @Column(nullable = false, length = 255)
    private String username;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column
    private Instant consumedAt;

    @Column(length = 64)
    private String requestedIp;
}
