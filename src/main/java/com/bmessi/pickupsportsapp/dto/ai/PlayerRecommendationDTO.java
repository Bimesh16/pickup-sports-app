package com.bmessi.pickupsportsapp.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerRecommendationDTO {
    private Long playerId;
    private String username;
    private String firstName;
    private String lastName;
    private String sport;
    private String skillLevel;
    private Double rating;
    private Double compatibilityScore;
    private String reason;
    private String recommendationType;
    private OffsetDateTime lastActive;
    private Map<String, Object> metadata;
}