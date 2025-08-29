package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.Sport;
import com.bmessi.pickupsportsapp.repository.SportRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class SportDataServiceTest {

    @Autowired
    private SportDataService sportDataService;

    @Autowired
    private SportRepository sportRepository;

    @Test
    public void testSportsArePopulated() throws Exception {
        // Clear existing data
        sportRepository.deleteAll();
        
        // Run the service
        sportDataService.run();
        
        // Verify all 10 sports are created
        List<Sport> sports = sportRepository.findAll();
        assertEquals(10, sports.size(), "Should have exactly 10 sports");
        
        // Verify specific sports exist
        assertTrue(sports.stream().anyMatch(s -> s.getName().equals("soccer")), "Soccer should exist");
        assertTrue(sports.stream().anyMatch(s -> s.getName().equals("cricket")), "Cricket should exist");
        assertTrue(sports.stream().anyMatch(s -> s.getName().equals("volleyball")), "Volleyball should exist");
        assertTrue(sports.stream().anyMatch(s -> s.getName().equals("badminton")), "Badminton should exist");
        assertTrue(sports.stream().anyMatch(s -> s.getName().equals("chess")), "Chess should exist");
        assertTrue(sports.stream().anyMatch(s -> s.getName().equals("basketball")), "Basketball should exist");
        assertTrue(sports.stream().anyMatch(s -> s.getName().equals("table_tennis")), "Table Tennis should exist");
        assertTrue(sports.stream().anyMatch(s -> s.getName().equals("tennis")), "Tennis should exist");
        assertTrue(sports.stream().anyMatch(s -> s.getName().equals("swimming")), "Swimming should exist");
        assertTrue(sports.stream().anyMatch(s -> s.getName().equals("athletics")), "Athletics should exist");
    }

    @Test
    public void testSoccerDetails() throws Exception {
        // Clear and populate
        sportRepository.deleteAll();
        sportDataService.run();
        
        Sport soccer = sportRepository.findByNameIgnoreCase("soccer");
        assertNotNull(soccer, "Soccer should exist");
        assertEquals("Soccer/Football", soccer.getDisplayName());
        assertEquals(Sport.SportCategory.BALL_SPORTS, soccer.getCategory());
        assertEquals(11, soccer.getTeamSizeMin());
        assertEquals(11, soccer.getTeamSizeMax());
        assertEquals(22, soccer.getTotalPlayersMin());
        assertEquals(22, soccer.getTotalPlayersMax());
        assertEquals(90, soccer.getDurationMinutesMin());
        assertEquals(120, soccer.getDurationMinutesMax());
        assertEquals(9.8, soccer.getPopularityScore());
        assertEquals(Sport.DifficultyLevel.INTERMEDIATE, soccer.getDifficultyLevel());
        assertTrue(soccer.getIsTeamSport());
        assertFalse(soccer.getIsIndoor());
        assertTrue(soccer.getIsOutdoor());
        assertTrue(soccer.getIsWeatherDependent());
        assertTrue(soccer.getIsActive());
    }

    @Test
    public void testCricketDetails() throws Exception {
        // Clear and populate
        sportRepository.deleteAll();
        sportDataService.run();
        
        Sport cricket = sportRepository.findByNameIgnoreCase("cricket");
        assertNotNull(cricket, "Cricket should exist");
        assertEquals("Cricket", cricket.getDisplayName());
        assertEquals(Sport.SportCategory.TRADITIONAL, cricket.getCategory());
        assertEquals(11, cricket.getTeamSizeMin());
        assertEquals(11, cricket.getTeamSizeMax());
        assertEquals(22, cricket.getTotalPlayersMin());
        assertEquals(22, cricket.getTotalPlayersMax());
        assertEquals(180, cricket.getDurationMinutesMin());
        assertEquals(480, cricket.getDurationMinutesMax());
        assertEquals(9.5, cricket.getPopularityScore());
        assertEquals(Sport.DifficultyLevel.ADVANCED, cricket.getDifficultyLevel());
        assertTrue(cricket.getIsTeamSport());
        assertFalse(cricket.getIsIndoor());
        assertTrue(cricket.getIsOutdoor());
        assertTrue(cricket.getIsWeatherDependent());
        assertTrue(cricket.getIsActive());
    }

    @Test
    public void testChessDetails() throws Exception {
        // Clear and populate
        sportRepository.deleteAll();
        sportDataService.run();
        
        Sport chess = sportRepository.findByNameIgnoreCase("chess");
        assertNotNull(chess, "Chess should exist");
        assertEquals("Chess", chess.getDisplayName());
        assertEquals(Sport.SportCategory.MIND_SPORTS, chess.getCategory());
        assertEquals(1, chess.getTeamSizeMin());
        assertEquals(1, chess.getTeamSizeMax());
        assertEquals(2, chess.getTotalPlayersMin());
        assertEquals(2, chess.getTotalPlayersMax());
        assertEquals(15, chess.getDurationMinutesMin());
        assertEquals(300, chess.getDurationMinutesMax());
        assertEquals(7.5, chess.getPopularityScore());
        assertEquals(Sport.DifficultyLevel.EXPERT, chess.getDifficultyLevel());
        assertFalse(chess.getIsTeamSport());
        assertTrue(chess.getIsIndoor());
        assertFalse(chess.getIsOutdoor());
        assertFalse(chess.getIsWeatherDependent());
        assertTrue(chess.getIsActive());
    }

    @Test
    public void testBadmintonDetails() throws Exception {
        // Clear and populate
        sportRepository.deleteAll();
        sportDataService.run();
        
        Sport badminton = sportRepository.findByNameIgnoreCase("badminton");
        assertNotNull(badminton, "Badminton should exist");

        assertEquals("Badminton", badminton.getDisplayName());
        assertEquals(Sport.SportCategory.RACKET_SPORTS, badminton.getCategory());
        assertEquals(1, badminton.getTeamSizeMin());
        assertEquals(2, badminton.getTeamSizeMax());
        assertEquals(2, badminton.getTotalPlayersMin());
        assertEquals(4, badminton.getTotalPlayersMax());
        assertEquals(30, badminton.getDurationMinutesMin());
        assertEquals(90, badminton.getDurationMinutesMax());
        assertEquals(8.8, badminton.getPopularityScore());
        assertEquals(Sport.DifficultyLevel.INTERMEDIATE, badminton.getDifficultyLevel());
        assertFalse(badminton.getIsTeamSport());
        assertTrue(badminton.getIsIndoor());
        assertTrue(badminton.getIsOutdoor());
        assertTrue(badminton.getIsWeatherDependent());
        assertTrue(badminton.getIsActive());
    }

    @Test
    public void testBasketballDetails() throws Exception {
        // Clear and populate
        sportRepository.deleteAll();
        sportDataService.run();
        
        Sport basketball = sportRepository.findByNameIgnoreCase("basketball");
        assertNotNull(basketball, "Basketball should exist");

        assertEquals("Basketball", basketball.getDisplayName());
        assertEquals(Sport.SportCategory.BALL_SPORTS, basketball.getCategory());
        assertEquals(5, basketball.getTeamSizeMin());
        assertEquals(5, basketball.getTeamSizeMax());
        assertEquals(10, basketball.getTotalPlayersMin());
        assertEquals(10, basketball.getTotalPlayersMax());
        assertEquals(48, basketball.getDurationMinutesMin());
        assertEquals(60, basketball.getDurationMinutesMax());
        assertEquals(9.0, basketball.getPopularityScore());
        assertEquals(Sport.DifficultyLevel.INTERMEDIATE, basketball.getDifficultyLevel());
        assertTrue(basketball.getIsTeamSport());
        assertTrue(basketball.getIsIndoor());
        assertTrue(basketball.getIsOutdoor());
        assertFalse(basketball.getIsWeatherDependent());
        assertTrue(basketball.getIsActive());
    }

    @Test
    public void testSportCategories() throws Exception {
        // Clear and populate
        sportRepository.deleteAll();
        sportDataService.run();
        
        List<Sport> ballSports = sportRepository.findByCategoryAndIsActiveTrue(Sport.SportCategory.BALL_SPORTS);
        assertTrue(ballSports.size() >= 3, "Should have at least 3 ball sports");
        
        List<Sport> racketSports = sportRepository.findByCategoryAndIsActiveTrue(Sport.SportCategory.RACKET_SPORTS);
        assertTrue(racketSports.size() >= 3, "Should have at least 3 racket sports");
        
        List<Sport> mindSports = sportRepository.findByCategoryAndIsActiveTrue(Sport.SportCategory.MIND_SPORTS);
        assertTrue(mindSports.size() >= 1, "Should have at least 1 mind sport");
        
        List<Sport> waterSports = sportRepository.findByCategoryAndIsActiveTrue(Sport.SportCategory.WATER_SPORTS);
        assertTrue(waterSports.size() >= 1, "Should have at least 1 water sport");
        
        List<Sport> trackSports = sportRepository.findByCategoryAndIsActiveTrue(Sport.SportCategory.TRACK_SPORTS);
        assertTrue(trackSports.size() >= 1, "Should have at least 1 track sport");
        
        List<Sport> traditionalSports = sportRepository.findByCategoryAndIsActiveTrue(Sport.SportCategory.TRADITIONAL);
        assertTrue(traditionalSports.size() >= 1, "Should have at least 1 traditional sport");
    }

    @Test
    public void testTeamVsIndividualSports() throws Exception {
        // Clear and populate
        sportRepository.deleteAll();
        sportDataService.run();
        
        List<Sport> teamSports = sportRepository.findByIsTeamSportTrueAndIsActiveTrue();
        assertTrue(teamSports.size() >= 4, "Should have at least 4 team sports");
        
        List<Sport> individualSports = sportRepository.findByIsTeamSportFalseAndIsActiveTrue();
        assertTrue(individualSports.size() >= 6, "Should have at least 6 individual sports");
        
        // Verify specific team sports
        assertTrue(teamSports.stream().anyMatch(s -> s.getName().equals("soccer")));
        assertTrue(teamSports.stream().anyMatch(s -> s.getName().equals("cricket")));
        assertTrue(teamSports.stream().anyMatch(s -> s.getName().equals("volleyball")));
        assertTrue(teamSports.stream().anyMatch(s -> s.getName().equals("basketball")));
        
        // Verify specific individual sports
        assertTrue(individualSports.stream().anyMatch(s -> s.getName().equals("badminton")));
        assertTrue(individualSports.stream().anyMatch(s -> s.getName().equals("chess")));
        assertTrue(individualSports.stream().anyMatch(s -> s.getName().equals("table_tennis")));
        assertTrue(individualSports.stream().anyMatch(s -> s.getName().equals("tennis")));
        assertTrue(individualSports.stream().anyMatch(s -> s.getName().equals("swimming")));
        assertTrue(individualSports.stream().anyMatch(s -> s.getName().equals("athletics")));
    }

    @Test
    public void testIndoorVsOutdoorSports() throws Exception {
        // Clear and populate
        sportRepository.deleteAll();
        sportDataService.run();
        
        List<Sport> indoorSports = sportRepository.findByIsIndoorTrueAndIsActiveTrue();
        assertTrue(indoorSports.size() >= 8, "Should have at least 8 indoor sports");
        
        List<Sport> outdoorSports = sportRepository.findByIsOutdoorTrueAndIsActiveTrue();
        assertTrue(outdoorSports.size() >= 7, "Should have at least 7 outdoor sports");
        
        // Verify specific indoor sports
        assertTrue(indoorSports.stream().anyMatch(s -> s.getName().equals("volleyball")));
        assertTrue(indoorSports.stream().anyMatch(s -> s.getName().equals("badminton")));
        assertTrue(indoorSports.stream().anyMatch(s -> s.getName().equals("chess")));
        assertTrue(indoorSports.stream().anyMatch(s -> s.getName().equals("basketball")));
        assertTrue(indoorSports.stream().anyMatch(s -> s.getName().equals("table_tennis")));
        assertTrue(indoorSports.stream().anyMatch(s -> s.getName().equals("tennis")));
        assertTrue(indoorSports.stream().anyMatch(s -> s.getName().equals("swimming")));
        assertTrue(indoorSports.stream().anyMatch(s -> s.getName().equals("athletics")));
        
        // Verify specific outdoor sports
        assertTrue(outdoorSports.stream().anyMatch(s -> s.getName().equals("soccer")));
        assertTrue(outdoorSports.stream().anyMatch(s -> s.getName().equals("cricket")));
        assertTrue(outdoorSports.stream().anyMatch(s -> s.getName().equals("volleyball")));
        assertTrue(outdoorSports.stream().anyMatch(s -> s.getName().equals("badminton")));
        assertTrue(outdoorSports.stream().anyMatch(s -> s.getName().equals("basketball")));
        assertTrue(outdoorSports.stream().anyMatch(s -> s.getName().equals("tennis")));
        assertTrue(outdoorSports.stream().anyMatch(s -> s.getName().equals("swimming")));
        assertTrue(outdoorSports.stream().anyMatch(s -> s.getName().equals("athletics")));
    }

    @Test
    public void testPopularityScores() throws Exception {
        // Clear and populate
        sportRepository.deleteAll();
        sportDataService.run();
        
        List<Sport> allSports = sportRepository.findAll();
        
        // Verify all sports have valid popularity scores
        for (Sport sport : allSports) {
            assertNotNull(sport.getPopularityScore(), "Popularity score should not be null");
            assertTrue(sport.getPopularityScore() >= 0.0, "Popularity score should be >= 0.0");
            assertTrue(sport.getPopularityScore() <= 10.0, "Popularity score should be <= 10.0");
        }
        
        // Verify top sports have high popularity
        Sport soccer = sportRepository.findByNameIgnoreCase("soccer");
        assertTrue(soccer != null && soccer.getPopularityScore() >= 9.5, "Soccer should have very high popularity");

        Sport cricket = sportRepository.findByNameIgnoreCase("cricket");
        assertTrue(cricket != null && cricket.getPopularityScore() >= 9.0, "Cricket should have high popularity");

        Sport basketball = sportRepository.findByNameIgnoreCase("basketball");
        assertTrue(basketball != null && basketball.getPopularityScore() >= 8.5, "Basketball should have high popularity");
    }

    @Test
    public void testDifficultyLevels() throws Exception {
        // Clear and populate
        sportRepository.deleteAll();
        sportDataService.run();
        
        List<Sport> beginnerSports = sportRepository.findByDifficultyLevelAndIsActiveTrue(Sport.DifficultyLevel.BEGINNER);
        List<Sport> intermediateSports = sportRepository.findByDifficultyLevelAndIsActiveTrue(Sport.DifficultyLevel.INTERMEDIATE);
        List<Sport> advancedSports = sportRepository.findByDifficultyLevelAndIsActiveTrue(Sport.DifficultyLevel.ADVANCED);
        List<Sport> expertSports = sportRepository.findByDifficultyLevelAndIsActiveTrue(Sport.DifficultyLevel.EXPERT);
        
        // Verify we have sports in different difficulty levels
        assertTrue(intermediateSports.size() >= 5, "Should have at least 5 intermediate sports");
        assertTrue(advancedSports.size() >= 3, "Should have at least 3 advanced sports");
        assertTrue(expertSports.size() >= 1, "Should have at least 1 expert sport");
        
        // Verify specific difficulty assignments
        Sport chess = sportRepository.findByNameIgnoreCase("chess");
        assertTrue(chess != null && chess.getDifficultyLevel() == Sport.DifficultyLevel.EXPERT, "Chess should be expert level");

        Sport soccer = sportRepository.findByNameIgnoreCase("soccer");
        assertTrue(soccer != null && soccer.getDifficultyLevel() == Sport.DifficultyLevel.INTERMEDIATE, "Soccer should be intermediate level");

        Sport cricket = sportRepository.findByNameIgnoreCase("cricket");
        assertTrue(cricket != null && cricket.getDifficultyLevel() == Sport.DifficultyLevel.ADVANCED, "Cricket should be advanced level");
    }
}
