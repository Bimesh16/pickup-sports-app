package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "email_change_token", indexes = {
        @Index(name = "ix_email_change_username", columnList = "username")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailChangeToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 200)
    private String token;

    // Current username (email)
    @Column(nullable = false, length = 255)
    private String username;

    // New email to change to
    @Column(nullable = false, length = 255)
    private String newEmail;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column
    private Instant consumedAt;

    @Column(length = 64)
    private String requestedIp;
}
