package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "recommendations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Recommendation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "recommendation_type", nullable = false, length = 50)
    private String type;
    
    @Column(name = "title", nullable = false, length = 255)
    private String title;
    
    @Column(name = "description", length = 1000)
    private String description;
    
    @Column(name = "reason", length = 500)
    private String reason;
    
    @Column(name = "target_id")
    private Long targetId;
    
    @Column(name = "target_type", length = 50)
    private String targetType;
    
    @Column(name = "confidence_score")
    private Double confidenceScore;
    
    @Column(name = "is_viewed", nullable = false)
    @Builder.Default
    private boolean isViewed = false;
    
    @Column(name = "is_clicked", nullable = false)
    @Builder.Default
    private boolean isClicked = false;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
