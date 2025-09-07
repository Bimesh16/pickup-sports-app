package com.bmessi.pickupsportsapp.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueRecommendationDTO {
    private Long venueId;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String description;
    private Double rating;
    private BigDecimal cost;
    private List<String> amenities;
    private List<String> photos;
    private Double confidenceScore;
    private String reason;
    private String recommendationType;
    private Map<String, Object> metadata;
}