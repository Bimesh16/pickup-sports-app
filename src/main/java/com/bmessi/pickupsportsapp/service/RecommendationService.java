package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.Recommendation;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.RecommendationRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private UserRepository userRepository;

    public List<RecommendationSummary> getRecommendations(String username, int limit) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Mock recommendations - in real implementation, this would use AI/ML algorithms
        return Arrays.asList(
            RecommendationSummary.builder()
                .id(1L)
                .type("game")
                .title("Evening Cricket Match")
                .description("Join this cricket match happening near you")
                .reason("Based on your location and skill level")
                .confidenceScore(0.85)
                .targetId(123L)
                .targetType("game")
                .build(),
            RecommendationSummary.builder()
                .id(2L)
                .type("player")
                .title("Connect with John Doe")
                .description("Similar playing style and schedule")
                .reason("Based on your playing patterns")
                .confidenceScore(0.72)
                .targetId(456L)
                .targetType("user")
                .build(),
            RecommendationSummary.builder()
                .id(3L)
                .type("venue")
                .title("Try Pokhara Sports Complex")
                .description("Great facilities for your favorite sports")
                .reason("Based on your venue preferences")
                .confidenceScore(0.68)
                .targetId(789L)
                .targetType("venue")
                .build()
        );
    }

    public void trackRecommendationClick(Long recommendationId, String username) {
        Recommendation recommendation = recommendationRepository.findById(recommendationId)
            .orElseThrow(() -> new RuntimeException("Recommendation not found"));

        recommendation.setClicked(true);
        recommendationRepository.save(recommendation);
    }

    public void trackRecommendationView(Long recommendationId, String username) {
        Recommendation recommendation = recommendationRepository.findById(recommendationId)
            .orElseThrow(() -> new RuntimeException("Recommendation not found"));

        recommendation.setViewed(true);
        recommendationRepository.save(recommendation);
    }

    public List<RecommendationSummary> getPersonalizedRecommendations(String username, String type, int limit) {
        // Mock personalized recommendations based on user behavior
        return getRecommendations(username, limit).stream()
            .filter(rec -> type == null || rec.getType().equals(type))
            .limit(limit)
            .collect(Collectors.toList());
    }

    // DTO
    @lombok.Data
    @lombok.Builder
    public static class RecommendationSummary {
        private Long id;
        private String type;
        private String title;
        private String description;
        private String reason;
        private Double confidenceScore;
        private Long targetId;
        private String targetType;
    }
}
