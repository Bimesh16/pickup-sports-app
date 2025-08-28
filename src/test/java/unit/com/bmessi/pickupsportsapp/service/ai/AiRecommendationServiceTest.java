package unit.com.bmessi.pickupsportsapp.service.ai;

import com.bmessi.pickupsportsapp.dto.ai.GameRecommendationDTO;
import com.bmessi.pickupsportsapp.dto.ai.PlayerRecommendationDTO;
import com.bmessi.pickupsportsapp.dto.ai.VenueRecommendationDTO;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.game.Game;
import com.bmessi.pickupsportsapp.service.ai.AiRecommendationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiRecommendationServiceTest {

    @Mock
    private com.bmessi.pickupsportsapp.service.ai.PlayerRecommendationService playerRecommendationService;

    @Mock
    private com.bmessi.pickupsportsapp.service.ai.GameRecommendationService gameRecommendationService;

    @Mock
    private com.bmessi.pickupsportsapp.service.ai.VenueRecommendationService venueRecommendationService;

    @Mock
    private com.bmessi.pickupsportsapp.service.ai.DemandForecastingService demandForecastingService;

    private AiRecommendationService aiRecommendationService;

    @BeforeEach
    void setUp() {
        aiRecommendationService = new AiRecommendationService(
                playerRecommendationService,
                gameRecommendationService,
                venueRecommendationService,
                demandForecastingService
        );
    }

    @Test
    void getGameRecommendations_Success() {
        // Given
        User user = User.builder().id(1L).username("testuser").build();
        List<GameRecommendationDTO> expectedRecommendations = List.of(
                new GameRecommendationDTO(1L, null, null, "Great match for you", null, "v1.0", null)
        );

        when(gameRecommendationService.getPersonalizedRecommendations(user, 10))
                .thenReturn(expectedRecommendations);

        // When
        List<GameRecommendationDTO> result = aiRecommendationService.getGameRecommendations(user, 10);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(gameRecommendationService).getPersonalizedRecommendations(user, 10);
    }

    @Test
    void getPlayerRecommendations_Success() {
        // Given
        Game game = Game.builder().id(1L).build();
        User requestingUser = User.builder().id(1L).username("testuser").build();
        List<PlayerRecommendationDTO> expectedRecommendations = List.of(
                new PlayerRecommendationDTO(1L, 1L, null, null, null, "Great player match", null, "v1.0", null)
        );

        when(playerRecommendationService.getPlayerRecommendations(game, requestingUser, 5))
                .thenReturn(expectedRecommendations);

        // When
        List<PlayerRecommendationDTO> result = aiRecommendationService.getPlayerRecommendations(game, requestingUser, 5);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(playerRecommendationService).getPlayerRecommendations(game, requestingUser, 5);
    }

    @Test
    void getVenueRecommendations_Success() {
        // Given
        User user = User.builder().id(1L).username("testuser").build();
        List<VenueRecommendationDTO> expectedRecommendations = List.of(
                new VenueRecommendationDTO(1L, null, null, "Perfect venue for you", null, "v1.0", null)
        );

        when(venueRecommendationService.getPersonalizedRecommendations(user, 10))
                .thenReturn(expectedRecommendations);

        // When
        List<VenueRecommendationDTO> result = aiRecommendationService.getVenueRecommendations(user, 10);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(venueRecommendationService).getPersonalizedRecommendations(user, 10);
    }

    @Test
    void getDemandForecast_Success() {
        // Given
        String sport = "soccer";
        String city = "New York";
        int daysAhead = 7;
        double expectedForecast = 0.85;

        when(demandForecastingService.forecastDemand(sport, city, daysAhead))
                .thenReturn(expectedForecast);

        // When
        double result = aiRecommendationService.getDemandForecast(sport, city, daysAhead);

        // Then
        assertEquals(expectedForecast, result);
        verify(demandForecastingService).forecastDemand(sport, city, daysAhead);
    }

    @Test
    void generateBatchRecommendations_Success() {
        // Given
        doNothing().when(gameRecommendationService).generateBatchRecommendations();
        doNothing().when(venueRecommendationService).generateBatchRecommendations();

        // When & Then
        assertDoesNotThrow(() -> aiRecommendationService.generateBatchRecommendations());

        verify(gameRecommendationService).generateBatchRecommendations();
        verify(venueRecommendationService).generateBatchRecommendations();
    }

    @Test
    void updateModelsWithFeedback_GameRecommendation() {
        // Given
        Long recommendationId = 1L;
        String feedback = "click";
        String recommendationType = "game";

        doNothing().when(gameRecommendationService).updateWithFeedback(recommendationId, feedback);

        // When & Then
        assertDoesNotThrow(() -> 
            aiRecommendationService.updateModelsWithFeedback(recommendationId, feedback, recommendationType)
        );

        verify(gameRecommendationService).updateWithFeedback(recommendationId, feedback);
    }

    @Test
    void updateModelsWithFeedback_PlayerRecommendation() {
        // Given
        Long recommendationId = 1L;
        String feedback = "accept";
        String recommendationType = "player";

        doNothing().when(playerRecommendationService).updateWithFeedback(recommendationId, feedback);

        // When & Then
        assertDoesNotThrow(() -> 
            aiRecommendationService.updateModelsWithFeedback(recommendationId, feedback, recommendationType)
        );

        verify(playerRecommendationService).updateWithFeedback(recommendationId, feedback);
    }

    @Test
    void updateModelsWithFeedback_VenueRecommendation() {
        // Given
        Long recommendationId = 1L;
        String feedback = "book";
        String recommendationType = "venue";

        doNothing().when(venueRecommendationService).updateWithFeedback(recommendationId, feedback);

        // When & Then
        assertDoesNotThrow(() -> 
            aiRecommendationService.updateModelsWithFeedback(recommendationId, feedback, recommendationType)
        );

        verify(venueRecommendationService).updateWithFeedback(recommendationId, feedback);
    }

    @Test
    void updateModelsWithFeedback_UnknownType() {
        // Given
        Long recommendationId = 1L;
        String feedback = "test";
        String recommendationType = "unknown";

        // When & Then
        assertDoesNotThrow(() -> 
            aiRecommendationService.updateModelsWithFeedback(recommendationId, feedback, recommendationType)
        );

        // Should not call any service
        verifyNoInteractions(gameRecommendationService, playerRecommendationService, venueRecommendationService);
    }

    @Test
    void getRecommendationInsights_Success() {
        // Given
        when(gameRecommendationService.getTotalRecommendationsGenerated()).thenReturn(100L);
        when(venueRecommendationService.getTotalRecommendationsGenerated()).thenReturn(50L);
        when(playerRecommendationService.getTotalRecommendationsGenerated()).thenReturn(25L);
        when(gameRecommendationService.getAverageClickThroughRate()).thenReturn(0.75);
        when(gameRecommendationService.getModelAccuracy()).thenReturn(0.85);
        when(gameRecommendationService.getLastModelUpdate()).thenReturn("2024-01-15T10:00:00Z");

        // When
        AiRecommendationService.RecommendationInsights insights = aiRecommendationService.getRecommendationInsights();

        // Then
        assertNotNull(insights);
        assertEquals(175L, insights.totalRecommendationsGenerated());
        assertEquals(0.75, insights.averageClickThroughRate());
        assertEquals(0.85, insights.modelAccuracy());
        assertEquals("2024-01-15T10:00:00Z", insights.lastModelUpdate());

        verify(gameRecommendationService).getTotalRecommendationsGenerated();
        verify(venueRecommendationService).getTotalRecommendationsGenerated();
        verify(playerRecommendationService).getTotalRecommendationsGenerated();
        verify(gameRecommendationService).getAverageClickThroughRate();
        verify(gameRecommendationService).getModelAccuracy();
        verify(gameRecommendationService).getLastModelUpdate();
    }
}
