package com.bmessi.pickupsportsapp.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameRecommendationDTO {
    private Long gameId;
    private String title;
    private String description;
    private String sport;
    private String skillLevel;
    private String location;
    private OffsetDateTime dateTime;
    private Integer currentPlayers;
    private Integer maxPlayers;
    private BigDecimal cost;
    private Double confidenceScore;
    private String reason;
    private String recommendationType;
    private Map<String, Object> metadata;
}