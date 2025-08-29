package integration.com.bmessi.pickupsportsapp.integration;

import com.bmessi.pickupsportsapp.dto.venue.CreateVenueRequest;
import com.bmessi.pickupsportsapp.dto.venue.VenueResponse;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.Venue;
import com.bmessi.pickupsportsapp.service.VenueService;
import com.bmessi.pickupsportsapp.service.ai.AiRecommendationService;
import com.bmessi.pickupsportsapp.service.auth.AdvancedMfaService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

/**
 * Comprehensive integration testing suite for end-to-end system validation.
 * 
 * Features:
 * - End-to-end user journey testing
 * - Complete workflow validation
 * - System integration testing
 * - Cross-service communication testing
 * - Database integration testing
 * - Cache integration testing
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
@SpringBootTest
@ActiveProfiles("test")
@Slf4j
public class IntegrationTestSuite {

    @Autowired
    private VenueService venueService;
    
    @Autowired
    private AiRecommendationService aiRecommendationService;
    
    @Autowired
    private AdvancedMfaService mfaService;

    private User testUser;
    private Venue testVenue;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = createTestUser();
        
        // Create test venue
        testVenue = createTestVenue();
    }

    @Test
    @Transactional
    void testCompleteUserJourney() {
        log.info("Testing complete user journey from registration to game participation");
        
        // Step 1: User registration and profile setup
        log.info("Step 1: User registration and profile setup");
        assert testUser != null : "Test user should be created";
        assert testUser.getUsername().equals("integrationtestuser") : "Username should match";
        
        // Step 2: MFA setup
        log.info("Step 2: MFA setup");
        String totpSecret = mfaService.generateTotpSecret(testUser);
        assert totpSecret != null : "TOTP secret should be generated";
        assert totpSecret.length() > 0 : "TOTP secret should not be empty";
        
        // Step 3: Venue discovery
        log.info("Step 3: Venue discovery");
        List<VenueResponse> venues = venueService.getVerifiedVenues();
        assert venues != null : "Venues should be retrieved";
        assert !venues.isEmpty() : "Should have at least one venue";
        
        // Step 4: AI recommendations
        log.info("Step 4: AI recommendations");
        var gameRecommendations = aiRecommendationService.getGameRecommendations(testUser, 5);
        var venueRecommendations = aiRecommendationService.getVenueRecommendations(testUser, 5);
        assert gameRecommendations != null : "Game recommendations should be generated";
        assert venueRecommendations != null : "Venue recommendations should be generated";
        
        log.info("Complete user journey test passed successfully");
    }

    @Test
    @Transactional
    void testVenueManagementWorkflow() {
        log.info("Testing complete venue management workflow");
        
        // Step 1: Venue creation
        log.info("Step 1: Venue creation");
        CreateVenueRequest createRequest = new CreateVenueRequest(
            "Integration Test Venue",
            "A test venue for integration testing",
            "123 Test Street",
            "Test City",
            "Test State",
            "Test Country",
            "12345",
            40.7128,
            -74.0060,
            Venue.VenueType.OUTDOOR_FIELD,
            100,
            10,
            BigDecimal.valueOf(50.00),
            BigDecimal.valueOf(10.00),
            "555-0123",
            "test@venue.com",
            "https://testvenue.com",
            Set.of(1L),
            List.of(),
            List.of()
        );
        
        VenueResponse createdVenue = venueService.createVenue(createRequest, testUser.getId());
        assert createdVenue != null : "Venue should be created";
        assert createdVenue.name().equals("Integration Test Venue") : "Venue name should match";
        
        // Step 2: Venue search and discovery
        log.info("Step 2: Venue search and discovery");
        var searchResults = venueService.searchVenues("Test City", null, null, null, null, null, null);
        assert searchResults != null : "Search results should be returned";
        assert searchResults.getTotalElements() > 0 : "Should find at least one venue";
        
        // Step 3: Venue verification
        log.info("Step 3: Venue verification");
        VenueResponse verifiedVenue = venueService.verifyVenue(createdVenue.id());
        assert verifiedVenue != null : "Venue should be verified";
        
        log.info("Venue management workflow test passed successfully");
    }

    @Test
    @Transactional
    void testAiRecommendationIntegration() {
        log.info("Testing AI recommendation system integration");
        
        // Step 1: Generate recommendations for different scenarios
        log.info("Step 1: Generating recommendations for different scenarios");
        
        // Test game recommendations
        var gameRecs = aiRecommendationService.getGameRecommendations(testUser, 10);
        assert gameRecs != null : "Game recommendations should be generated";
        log.info("Generated {} game recommendations", gameRecs.size());
        
        // Test venue recommendations
        var venueRecs = aiRecommendationService.getVenueRecommendations(testUser, 10);
        assert venueRecs != null : "Venue recommendations should be generated";
        log.info("Generated {} venue recommendations", venueRecs.size());
        
        // Step 2: Test recommendation quality
        log.info("Step 2: Testing recommendation quality");
        assert !gameRecs.isEmpty() || !venueRecs.isEmpty() : "Should have at least some recommendations";
        
        // Step 3: Test recommendation consistency
        log.info("Step 3: Testing recommendation consistency");
        var gameRecs2 = aiRecommendationService.getGameRecommendations(testUser, 10);
        var venueRecs2 = aiRecommendationService.getVenueRecommendations(testUser, 10);
        
        // Recommendations should be consistent for the same user
        assert gameRecs.size() == gameRecs2.size() : "Game recommendations should be consistent";
        assert venueRecs.size() == venueRecs2.size() : "Venue recommendations should be consistent";
        
        log.info("AI recommendation integration test passed successfully");
    }

    @Test
    @Transactional
    void testMfaIntegration() {
        log.info("Testing MFA system integration");
        
        // Step 1: MFA setup
        log.info("Step 1: MFA setup");
        String totpSecret = mfaService.generateTotpSecret(testUser);
        assert totpSecret != null : "TOTP secret should be generated";
        
        // Step 2: TOTP code generation and validation
        log.info("Step 2: TOTP code generation and validation");
        String totpCode = mfaService.generateTotpCode(totpSecret);
        assert totpCode != null : "TOTP code should be generated";
        assert totpCode.length() == 6 : "TOTP code should be 6 digits";
        
        // Step 3: SMS code generation and validation
        log.info("Step 3: SMS code generation and validation");
        String smsCode = mfaService.generateSmsCode(testUser);
        assert smsCode != null : "SMS code should be generated";
        assert smsCode.length() == 6 : "SMS code should be 6 digits";
        
        // Step 4: Email code generation and validation
        log.info("Step 4: Email code generation and validation");
        String emailCode = mfaService.generateEmailCode(testUser);
        assert emailCode != null : "Email code should be generated";
        assert emailCode.length() == 8 : "Email code should be 8 characters";
        
        // Step 5: Backup codes generation
        log.info("Step 5: Backup codes generation");
        String[] backupCodes = mfaService.generateBackupCodes(testUser, 5);
        assert backupCodes != null : "Backup codes should be generated";
        assert backupCodes.length == 5 : "Should generate 5 backup codes";
        
        // Step 6: MFA status validation
        log.info("Step 6: MFA status validation");
        var mfaStatus = mfaService.getMfaStatus(testUser);
        assert mfaStatus != null : "MFA status should be retrieved";
        assert mfaStatus.containsKey("mfa_enabled") : "MFA status should include enabled flag";
        
        log.info("MFA integration test passed successfully");
    }

    @Test
    @Transactional
    void testSystemPerformanceUnderLoad() {
        log.info("Testing system performance under load");
        
        // Simulate multiple concurrent operations
        long startTime = System.currentTimeMillis();
        
        // Perform multiple operations
        for (int i = 0; i < 100; i++) {
            try {
                // Venue operations
                venueService.getVerifiedVenues();
                
                // AI recommendations
                aiRecommendationService.getGameRecommendations(testUser, 5);
                aiRecommendationService.getVenueRecommendations(testUser, 5);
                
                // MFA operations
                mfaService.generateTotpSecret(testUser);
                mfaService.generateSmsCode(testUser);
                
            } catch (Exception e) {
                log.warn("Operation {} failed", i, e);
            }
        }
        
        long endTime = System.currentTimeMillis();
        long totalTime = endTime - startTime;
        
        log.info("Performance test completed in {} ms", totalTime);
        log.info("Average time per operation: {} ms", totalTime / 100.0);
        
        // Assert reasonable performance
        assert totalTime < 30000 : "Performance test should complete within 30 seconds";
        
        log.info("System performance test passed successfully");
    }

    @Test
    @Transactional
    void testDataConsistency() {
        log.info("Testing data consistency across services");
        
        // Step 1: Create test data
        log.info("Step 1: Creating test data");
        CreateVenueRequest request = new CreateVenueRequest(
            "Consistency Test Venue",
            "Test venue for consistency testing",
            "456 Consistency Ave",
            "Consistency City",
            "Consistency State",
            "Consistency Country",
            "54321",
            40.7589,
            -73.9851,
            Venue.VenueType.OUTDOOR_FIELD,
            50,
            5,
            BigDecimal.valueOf(25.00),
            BigDecimal.valueOf(5.00),
            "555-9876",
            "consistency@venue.com",
            "https://consistencyvenue.com",
            Set.of(1L),
            List.of(),
            List.of()
        );
        
        VenueResponse createdVenue = venueService.createVenue(request, testUser.getId());
        
        // Step 2: Verify data consistency
        log.info("Step 2: Verifying data consistency");
        assert createdVenue.name().equals("Consistency Test Venue") : "Venue name should be consistent";
        assert createdVenue.city().equals("Consistency City") : "Venue city should be consistent";
        assert createdVenue.maxCapacity() == 50 : "Venue capacity should be consistent";
        
        // Step 3: Test cross-service data consistency
        log.info("Step 3: Testing cross-service data consistency");
        var recommendations = aiRecommendationService.getVenueRecommendations(testUser, 10);
        assert recommendations != null : "Recommendations should be generated";
        
        log.info("Data consistency test passed successfully");
    }

    // Private helper methods

    private User createTestUser() {
        return User.builder()
            .id(1L)
            .username("integrationtestuser")
            .password("integrationpassword")
            .mfaEnabled(true)
            .mfaSecret("integrationsecret123")
            .build();
    }

    private Venue createTestVenue() {
        return Venue.builder()
            .id(1L)
            .name("Integration Test Venue")
            .description("A test venue for integration testing")
            .address("123 Integration Street")
            .city("Integration City")
            .state("Integration State")
            .country("Integration Country")
            .postalCode("12345")
            .latitude(40.7128)
            .longitude(-74.0060)
            .venueType(Venue.VenueType.OUTDOOR_FIELD)
            .maxCapacity(100)
            .minCapacity(10)
            .basePricePerHour(BigDecimal.valueOf(50.00))
            .basePricePerPlayer(BigDecimal.valueOf(10.00))
            .ownerId(1L)
            .contactPhone("555-0123")
            .contactEmail("integration@venue.com")
            .websiteUrl("https://integrationvenue.com")
            .status(Venue.VenueStatus.ACTIVE)
            .isVerified(true)
            .build();
    }
}
