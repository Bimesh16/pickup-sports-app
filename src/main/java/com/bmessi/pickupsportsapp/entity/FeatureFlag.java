package com.bmessi.pickupsportsapp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "feature_flag")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeatureFlag {
    @Id
    @Column(name = "name", length = 100)
    private String name;

    @Column(nullable = false)
    private boolean enabled;

    @Column(nullable = false)
    private int rolloutPercentage; // 0-100
}
