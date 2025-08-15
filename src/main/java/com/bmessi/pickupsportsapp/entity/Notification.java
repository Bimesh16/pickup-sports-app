package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String message;

    private LocalDateTime timestamp;

    private boolean read = false;

    @PrePersist
    public void prePersist() {
        timestamp = LocalDateTime.now();
    }
}
