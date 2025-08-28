package com.bmessi.pickupsportsapp.service.ai;

import com.bmessi.pickupsportsapp.dto.ai.PlayerRecommendationDTO;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.entity.ai.PlayerRecommendation;
import com.bmessi.pickupsportsapp.repository.ai.PlayerRecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for AI-powered player recommendations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PlayerRecommendationService {

    private final PlayerRecommendationRepository playerRecommendationRepository;
    private final PlayerMatchingAlgorithm playerMatchingAlgorithm;

    /**
     * Get player recommendations for a specific game.
     */
    public List<PlayerRecommendationDTO> getPlayerRecommendations(Game game, User requestingUser, int limit) {
        log.debug("Getting player recommendations for game: {} requested by user: {}", game.getId(), requestingUser.getId());
        
        // Check if we have existing recommendations
        List<PlayerRecommendation> existingRecommendations = playerRecommendationRepository
                .findByGameAndRequestingPlayerAndStatus(game, requestingUser, PlayerRecommendation.RecommendationStatus.PENDING);
        
        if (!existingRecommendations.isEmpty() && existingRecommendations.size() >= limit) {
            return existingRecommendations.stream()
                    .limit(limit)
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }
        
        // Generate new recommendations using AI algorithm
        List<PlayerRecommendation> newRecommendations = playerMatchingAlgorithm
                .findMatchingPlayers(game, requestingUser, limit);
        
        // Save new recommendations
        List<PlayerRecommendation> savedRecommendations = playerRecommendationRepository.saveAll(newRecommendations);
        
        return savedRecommendations.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update recommendation with user feedback.
     */
    public void updateWithFeedback(Long recommendationId, String feedback) {
        log.debug("Updating player recommendation {} with feedback: {}", recommendationId, feedback);
        
        PlayerRecommendation recommendation = playerRecommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new IllegalArgumentException("Player recommendation not found"));
        
        // Update status based on feedback
        if ("accept".equalsIgnoreCase(feedback)) {
            recommendation.setStatus(PlayerRecommendation.RecommendationStatus.ACCEPTED);
        } else if ("reject".equalsIgnoreCase(feedback)) {
            recommendation.setStatus(PlayerRecommendation.RecommendationStatus.REJECTED);
        }
        
        playerRecommendationRepository.save(recommendation);
        
        // Send feedback to AI model for learning
        playerMatchingAlgorithm.updateModelWithFeedback(recommendation, feedback);
    }

    /**
     * Get total recommendations generated.
     */
    public long getTotalRecommendationsGenerated() {
        return playerRecommendationRepository.count();
    }

    /**
     * Map entity to DTO.
     */
    private PlayerRecommendationDTO mapToDTO(PlayerRecommendation recommendation) {
        return new PlayerRecommendationDTO(
                recommendation.getId(),
                recommendation.getGame().getId(),
                mapUserToDTO(recommendation.getRecommendedPlayer()),
                mapUserToDTO(recommendation.getRequestingPlayer()),
                recommendation.getRecommendationScore(),
                recommendation.getReason(),
                recommendation.getStatus(),
                recommendation.getAiModelVersion(),
                recommendation.getCreatedAt()
        );
    }

    /**
     * Map user entity to DTO (simplified for now).
     */
    private com.bmessi.pickupsportsapp.dto.UserDTO mapUserToDTO(User user) {
        return new com.bmessi.pickupsportsapp.dto.UserDTO(
                user.getId(),
                user.getUsername(),
                user.getPreferredSport() != null ? user.getPreferredSport().getDisplayName() : null,
                user.getLocation()
        );
    }
}
