package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "verified_user")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifiedUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Using username to avoid coupling to existing User entity mapping
    @Column(nullable = false, unique = true, length = 255)
    private String username;

    @Column(nullable = false)
    private Instant verifiedAt;
}
