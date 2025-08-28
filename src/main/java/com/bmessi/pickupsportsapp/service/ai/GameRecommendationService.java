package com.bmessi.pickupsportsapp.service.ai;

import com.bmessi.pickupsportsapp.dto.ai.GameRecommendationDTO;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.ai.GameRecommendation;
import com.bmessi.pickupsportsapp.repository.ai.GameRecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for AI-powered game recommendations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class GameRecommendationService {

    private final GameRecommendationRepository gameRecommendationRepository;

    /**
     * Get personalized game recommendations for a user.
     */
    public List<GameRecommendationDTO> getPersonalizedRecommendations(User user, int limit) {
        log.debug("Getting personalized game recommendations for user: {}", user.getId());

        List<GameRecommendation> recommendations = gameRecommendationRepository
                .findByUserAndStatusOrderByRecommendationScoreDesc(
                        user,
                        GameRecommendation.RecommendationStatus.ACTIVE,
                        PageRequest.of(0, limit)
                );
        
        return recommendations.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Generate batch recommendations for all active users.
     */
    public void generateBatchRecommendations() {
        log.info("Starting batch game recommendation generation");
        
        // TODO: Implement actual batch recommendation generation
        // This would typically involve:
        // - Analyzing user behavior patterns
        // - Processing game availability data
        // - Running ML models for predictions
        
        log.info("Batch game recommendation generation completed");
    }

    /**
     * Update recommendation with user feedback.
     */
    public void updateWithFeedback(Long recommendationId, String feedback) {
        log.debug("Updating game recommendation {} with feedback: {}", recommendationId, feedback);
        
        GameRecommendation recommendation = gameRecommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new IllegalArgumentException("Game recommendation not found"));
        
        // Update status based on feedback
        if ("click".equalsIgnoreCase(feedback)) {
            recommendation.setStatus(GameRecommendation.RecommendationStatus.CLICKED);
            recommendation.setClickedAt(java.time.OffsetDateTime.now());
        } else if ("join".equalsIgnoreCase(feedback)) {
            recommendation.setStatus(GameRecommendation.RecommendationStatus.JOINED);
            recommendation.setJoinedGame(true);
        }
        
        gameRecommendationRepository.save(recommendation);
    }

    /**
     * Get total recommendations generated.
     */
    public long getTotalRecommendationsGenerated() {
        return gameRecommendationRepository.count();
    }

    /**
     * Get average click-through rate.
     */
    public double getAverageClickThroughRate() {
        long total = gameRecommendationRepository.count();
        long clicked = gameRecommendationRepository.countByStatus(GameRecommendation.RecommendationStatus.CLICKED);
        return total > 0 ? (double) clicked / total : 0.0;
    }

    /**
     * Get model accuracy.
     */
    public double getModelAccuracy() {
        // TODO: Implement actual model accuracy calculation
        return 0.85; // Placeholder value
    }

    /**
     * Get last model update.
     */
    public String getLastModelUpdate() {
        // TODO: Implement actual last model update tracking
        return "2024-01-15T10:00:00Z"; // Placeholder value
    }

    /**
     * Map entity to DTO.
     */
    private GameRecommendationDTO mapToDTO(GameRecommendation recommendation) {
        return new GameRecommendationDTO(
                recommendation.getId(),
                mapGameToSummaryDTO(recommendation.getRecommendedGame()),
                recommendation.getRecommendationScore(),
                recommendation.getReason(),
                recommendation.getStatus(),
                recommendation.getAiModelVersion(),
                recommendation.getCreatedAt()
        );
    }

    /**
     * Map game entity to summary DTO (simplified for now).
     */
    private com.bmessi.pickupsportsapp.dto.game.GameSummaryDTO mapGameToSummaryDTO(com.bmessi.pickupsportsapp.entity.game.Game game) {
        return new com.bmessi.pickupsportsapp.dto.game.GameSummaryDTO(
                game.getId(),
                game.getSport(),
                game.getLocation(),
                game.getTime(), // Already OffsetDateTime
                game.getSkillLevel(),
                game.getLatitude(),
                game.getLongitude(),
                null // distanceKm - not applicable for recommendations
        );
    }
}
