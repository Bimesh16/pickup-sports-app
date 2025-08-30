package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.Sport;
import com.bmessi.pickupsportsapp.repository.SportRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class SportDataService implements CommandLineRunner {

    @Autowired
    private SportRepository sportRepository;
    
    @Autowired
    private ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Only populate if no sports exist
        if (sportRepository.count() == 0) {
            populateSports();
        }
    }

    private void populateSports() throws JsonProcessingException {
        List<Sport> sports = Arrays.asList(
            createSoccer(),
            createCricket(),
            createVolleyball(),
            createBadminton(),
            createChess(),
            createBasketball(),
            createTableTennis(),
            createTennis(),
            createSwimming(),
            createAthletics()
        );

        for (Sport sport : sports) {
            sportRepository.save(sport);
        }
    }

    private Sport createSoccer() throws JsonProcessingException {
        Sport soccer = new Sport();
        soccer.setName("soccer");
        soccer.setDisplayName("Soccer/Football");
        soccer.setDescription("The world's most popular sport, played with 11 players per team on a rectangular field. The objective is to score goals by getting the ball into the opponent's net using any part of the body except hands and arms.");
        soccer.setCategory(Sport.SportCategory.BALL_SPORTS);
        soccer.setTeamSizeMin(11);
        soccer.setTeamSizeMax(11);
        soccer.setTotalPlayersMin(22);
        soccer.setTotalPlayersMax(22);
        soccer.setDurationMinutesMin(90);
        soccer.setDurationMinutesMax(120);
        soccer.setSkillLevels(objectMapper.writeValueAsString(Arrays.asList("BEGINNER", "INTERMEDIATE", "ADVANCED", "PRO")));
        soccer.setEquipmentRequired(objectMapper.writeValueAsString(Arrays.asList("Cleats", "Shin Guards", "Soccer Ball")));
        soccer.setEquipmentProvided(objectMapper.writeValueAsString(Arrays.asList("Goals", "Corner Flags", "Referee Equipment")));
        soccer.setVenueTypes(objectMapper.writeValueAsString(Arrays.asList("OUTDOOR_FIELD", "INDOOR_FIELD")));
        soccer.setRules("Standard FIFA rules apply. No hands except for goalkeepers. Offside rule enforced. Fouls result in free kicks or penalties.");
        soccer.setPopularityScore(9.8);
        soccer.setDifficultyLevel(Sport.DifficultyLevel.INTERMEDIATE);
        soccer.setIsTeamSport(true);
        soccer.setIsIndoor(false);
        soccer.setIsOutdoor(true);
        soccer.setIsWeatherDependent(true);
        soccer.setIconUrl("/images/sports/soccer-icon.png");
        soccer.setBannerUrl("/images/sports/soccer-banner.jpg");
        return soccer;
    }

    private Sport createCricket() throws JsonProcessingException {
        Sport cricket = new Sport();
        cricket.setName("cricket");
        cricket.setDisplayName("Cricket");
        cricket.setDescription("A bat-and-ball game played between two teams of 11 players. The game is played on a circular field with a rectangular pitch in the center. Teams take turns batting and bowling.");
        cricket.setCategory(Sport.SportCategory.TRADITIONAL);
        cricket.setTeamSizeMin(11);
        cricket.setTeamSizeMax(11);
        cricket.setTotalPlayersMin(22);
        cricket.setTotalPlayersMax(22);
        cricket.setDurationMinutesMin(180);
        cricket.setDurationMinutesMax(480);
        cricket.setSkillLevels(objectMapper.writeValueAsString(Arrays.asList("BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT")));
        cricket.setEquipmentRequired(objectMapper.writeValueAsString(Arrays.asList("Cricket Bat", "Cricket Ball", "Protective Gear")));
        cricket.setEquipmentProvided(objectMapper.writeValueAsString(Arrays.asList("Wickets", "Boundary Ropes", "Scoreboard")));
        cricket.setVenueTypes(objectMapper.writeValueAsString(Arrays.asList("OUTDOOR_FIELD", "INDOOR_FIELD")));
        cricket.setRules("Teams bat in innings. Bowlers try to dismiss batsmen. Batsmen score runs by hitting the ball and running between wickets. Various formats: Test, ODI, T20.");
        cricket.setPopularityScore(9.5);
        cricket.setDifficultyLevel(Sport.DifficultyLevel.ADVANCED);
        cricket.setIsTeamSport(true);
        cricket.setIsIndoor(false);
        cricket.setIsOutdoor(true);
        cricket.setIsWeatherDependent(true);
        cricket.setIconUrl("/images/sports/cricket-icon.png");
        cricket.setBannerUrl("/images/sports/cricket-banner.jpg");
        return cricket;
    }

    private Sport createVolleyball() throws JsonProcessingException {
        Sport volleyball = new Sport();
        volleyball.setName("volleyball");
        volleyball.setDisplayName("Volleyball");
        volleyball.setDescription("A team sport in which two teams of six players are separated by a net. Each team tries to score points by grounding a ball on the other team's court under organized rules.");
        volleyball.setCategory(Sport.SportCategory.BALL_SPORTS);
        volleyball.setTeamSizeMin(6);
        volleyball.setTeamSizeMax(6);
        volleyball.setTotalPlayersMin(12);
        volleyball.setTotalPlayersMax(12);
        volleyball.setDurationMinutesMin(60);
        volleyball.setDurationMinutesMax(90);
        volleyball.setSkillLevels(objectMapper.writeValueAsString(Arrays.asList("BEGINNER", "INTERMEDIATE", "ADVANCED", "PRO")));
        volleyball.setEquipmentRequired(objectMapper.writeValueAsString(Arrays.asList("Volleyball", "Knee Pads", "Athletic Shoes")));
        volleyball.setEquipmentProvided(objectMapper.writeValueAsString(Arrays.asList("Net", "Antennas", "Scoreboard")));
        volleyball.setVenueTypes(objectMapper.writeValueAsString(Arrays.asList("INDOOR_COURT", "OUTDOOR_COURT", "BEACH")));
        volleyball.setRules("Teams serve, pass, set, and spike the ball over the net. Maximum 3 touches per side. Ball must not touch the ground. Rally scoring system.");
        volleyball.setPopularityScore(8.2);
        volleyball.setDifficultyLevel(Sport.DifficultyLevel.INTERMEDIATE);
        volleyball.setIsTeamSport(true);
        volleyball.setIsIndoor(true);
        volleyball.setIsOutdoor(true);
        volleyball.setIsWeatherDependent(false);
        volleyball.setIconUrl("/images/sports/volleyball-icon.png");
        volleyball.setBannerUrl("/images/sports/volleyball-banner.jpg");
        return volleyball;
    }

    private Sport createBadminton() throws JsonProcessingException {
        Sport badminton = new Sport();
        badminton.setName("badminton");
        badminton.setDisplayName("Badminton");
        badminton.setDescription("A racquet sport played using racquets to hit a shuttlecock across a net. It can be played as singles or doubles. The game is known for its fast-paced action and strategic play.");
        badminton.setCategory(Sport.SportCategory.RACKET_SPORTS);
        badminton.setTeamSizeMin(1);
        badminton.setTeamSizeMax(2);
        badminton.setTotalPlayersMin(2);
        badminton.setTotalPlayersMax(4);
        badminton.setDurationMinutesMin(30);
        badminton.setDurationMinutesMax(90);
        badminton.setSkillLevels(objectMapper.writeValueAsString(Arrays.asList("BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT")));
        badminton.setEquipmentRequired(objectMapper.writeValueAsString(Arrays.asList("Badminton Racket", "Shuttlecocks", "Court Shoes")));
        badminton.setEquipmentProvided(objectMapper.writeValueAsString(Arrays.asList("Net", "Court Lines", "Scoreboard")));
        badminton.setVenueTypes(objectMapper.writeValueAsString(Arrays.asList("INDOOR_COURT", "OUTDOOR_COURT")));
        badminton.setRules("Serve diagonally. Shuttlecock must not touch the ground. Points scored when opponent fails to return. Best of 3 games to 21 points.");
        badminton.setPopularityScore(8.8);
        badminton.setDifficultyLevel(Sport.DifficultyLevel.INTERMEDIATE);
        badminton.setIsTeamSport(false);
        badminton.setIsIndoor(true);
        badminton.setIsOutdoor(true);
        badminton.setIsWeatherDependent(true);
        badminton.setIconUrl("/images/sports/badminton-icon.png");
        badminton.setBannerUrl("/images/sports/badminton-banner.jpg");
        return badminton;
    }

    private Sport createChess() throws JsonProcessingException {
        Sport chess = new Sport();
        chess.setName("chess");
        chess.setDisplayName("Chess");
        chess.setDescription("A strategic board game played between two players on a checkered board with 64 squares arranged in an 8×8 grid. Each player begins with 16 pieces: one king, one queen, two rooks, two bishops, two knights, and eight pawns.");
        chess.setCategory(Sport.SportCategory.MIND_SPORTS);
        chess.setTeamSizeMin(1);
        chess.setTeamSizeMax(1);
        chess.setTotalPlayersMin(2);
        chess.setTotalPlayersMax(2);
        chess.setDurationMinutesMin(15);
        chess.setDurationMinutesMax(300);
        chess.setSkillLevels(objectMapper.writeValueAsString(Arrays.asList("BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT")));
        chess.setEquipmentRequired(objectMapper.writeValueAsString(Arrays.asList("Chess Set", "Chess Clock")));
        chess.setEquipmentProvided(objectMapper.writeValueAsString(Arrays.asList("Chess Board", "Tables", "Chairs")));
        chess.setVenueTypes(objectMapper.writeValueAsString(Arrays.asList("INDOOR_COURT", "MULTI_PURPOSE")));
        chess.setRules("Players take turns moving pieces. Objective is to checkmate the opponent's king. Each piece has specific movement patterns. Various time controls available.");
        chess.setPopularityScore(7.5);
        chess.setDifficultyLevel(Sport.DifficultyLevel.EXPERT);
        chess.setIsTeamSport(false);
        chess.setIsIndoor(true);
        chess.setIsOutdoor(false);
        chess.setIsWeatherDependent(false);
        chess.setIconUrl("/images/sports/chess-icon.png");
        chess.setBannerUrl("/images/sports/chess-banner.jpg");
        return chess;
    }

    private Sport createBasketball() throws JsonProcessingException {
        Sport basketball = new Sport();
        basketball.setName("basketball");
        basketball.setDisplayName("Basketball");
        basketball.setDescription("A team sport in which two teams of five players score points by throwing a ball through a hoop elevated 10 feet above the ground. The game is played on a rectangular court.");
        basketball.setCategory(Sport.SportCategory.BALL_SPORTS);
        basketball.setTeamSizeMin(5);
        basketball.setTeamSizeMax(5);
        basketball.setTotalPlayersMin(10);
        basketball.setTotalPlayersMax(10);
        basketball.setDurationMinutesMin(48);
        basketball.setDurationMinutesMax(60);
        basketball.setSkillLevels(objectMapper.writeValueAsString(Arrays.asList("BEGINNER", "INTERMEDIATE", "ADVANCED", "PRO")));
        basketball.setEquipmentRequired(objectMapper.writeValueAsString(Arrays.asList("Basketball", "Basketball Shoes", "Athletic Wear")));
        basketball.setEquipmentProvided(objectMapper.writeValueAsString(Arrays.asList("Baskets", "Backboards", "Scoreboard")));
        basketball.setVenueTypes(objectMapper.writeValueAsString(Arrays.asList("INDOOR_COURT", "OUTDOOR_COURT")));
        basketball.setRules("Dribble the ball while moving. Score by shooting through the hoop. Fouls result in free throws. Shot clock limits possession time.");
        basketball.setPopularityScore(9.0);
        basketball.setDifficultyLevel(Sport.DifficultyLevel.INTERMEDIATE);
        basketball.setIsTeamSport(true);
        basketball.setIsIndoor(true);
        basketball.setIsOutdoor(true);
        basketball.setIsWeatherDependent(false);
        basketball.setIconUrl("/images/sports/basketball-icon.png");
        basketball.setBannerUrl("/images/sports/basketball-banner.jpg");
        return basketball;
    }

    private Sport createTableTennis() throws JsonProcessingException {
        Sport tableTennis = new Sport();
        tableTennis.setName("table_tennis");
        tableTennis.setDisplayName("Table Tennis");
        tableTennis.setDescription("A sport in which two or four players hit a lightweight ball back and forth across a table using small rackets. The game takes place on a hard table divided by a net.");
        tableTennis.setCategory(Sport.SportCategory.RACKET_SPORTS);
        tableTennis.setTeamSizeMin(1);
        tableTennis.setTeamSizeMax(2);
        tableTennis.setTotalPlayersMin(2);
        tableTennis.setTotalPlayersMax(4);
        tableTennis.setDurationMinutesMin(20);
        tableTennis.setDurationMinutesMax(60);
        tableTennis.setSkillLevels(objectMapper.writeValueAsString(Arrays.asList("BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT")));
        tableTennis.setEquipmentRequired(objectMapper.writeValueAsString(Arrays.asList("Table Tennis Racket", "Table Tennis Balls")));
        tableTennis.setEquipmentProvided(objectMapper.writeValueAsString(Arrays.asList("Table", "Net", "Scoreboard")));
        tableTennis.setVenueTypes(objectMapper.writeValueAsString(Arrays.asList("INDOOR_COURT", "MULTI_PURPOSE")));
        tableTennis.setRules("Serve diagonally. Ball must bounce once on each side. Points scored when opponent fails to return. Best of 5 or 7 games to 11 points.");
        tableTennis.setPopularityScore(8.5);
        tableTennis.setDifficultyLevel(Sport.DifficultyLevel.INTERMEDIATE);
        tableTennis.setIsTeamSport(false);
        tableTennis.setIsIndoor(true);
        tableTennis.setIsOutdoor(false);
        tableTennis.setIsWeatherDependent(false);
        tableTennis.setIconUrl("/images/sports/table-tennis-icon.png");
        tableTennis.setBannerUrl("/images/sports/table-tennis-banner.jpg");
        return tableTennis;
    }

    private Sport createTennis() throws JsonProcessingException {
        Sport tennis = new Sport();
        tennis.setName("tennis");
        tennis.setDisplayName("Tennis");
        tennis.setDescription("A racket sport that can be played individually against a single opponent or between two teams of two players. Players use a tennis racket to hit a hollow rubber ball covered with felt over or around a net.");
        tennis.setCategory(Sport.SportCategory.RACKET_SPORTS);
        tennis.setTeamSizeMin(1);
        tennis.setTeamSizeMax(2);
        tennis.setTotalPlayersMin(2);
        tennis.setTotalPlayersMax(4);
        tennis.setDurationMinutesMin(60);
        tennis.setDurationMinutesMax(180);
        tennis.setSkillLevels(objectMapper.writeValueAsString(Arrays.asList("BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT")));
        tennis.setEquipmentRequired(objectMapper.writeValueAsString(Arrays.asList("Tennis Racket", "Tennis Balls", "Tennis Shoes")));
        tennis.setEquipmentProvided(objectMapper.writeValueAsString(Arrays.asList("Net", "Court Lines", "Scoreboard")));
        tennis.setVenueTypes(objectMapper.writeValueAsString(Arrays.asList("INDOOR_COURT", "OUTDOOR_COURT")));
        tennis.setRules("Serve diagonally. Ball must bounce once on each side. Points scored when opponent fails to return. Games, sets, and matches scoring system.");
        tennis.setPopularityScore(8.7);
        tennis.setDifficultyLevel(Sport.DifficultyLevel.ADVANCED);
        tennis.setIsTeamSport(false);
        tennis.setIsIndoor(true);
        tennis.setIsOutdoor(true);
        tennis.setIsWeatherDependent(true);
        tennis.setIconUrl("/images/sports/tennis-icon.png");
        tennis.setBannerUrl("/images/sports/tennis-banner.jpg");
        return tennis;
    }

    private Sport createSwimming() throws JsonProcessingException {
        Sport swimming = new Sport();
        swimming.setName("swimming");
        swimming.setDisplayName("Swimming");
        swimming.setDescription("A sport that involves moving through water using the arms and legs. It can be recreational or competitive, with various strokes including freestyle, breaststroke, backstroke, and butterfly.");
        swimming.setCategory(Sport.SportCategory.WATER_SPORTS);
        swimming.setTeamSizeMin(1);
        swimming.setTeamSizeMax(1);
        swimming.setTotalPlayersMin(1);
        swimming.setTotalPlayersMax(50);
        swimming.setDurationMinutesMin(30);
        swimming.setDurationMinutesMax(120);
        swimming.setSkillLevels(objectMapper.writeValueAsString(Arrays.asList("BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT")));
        swimming.setEquipmentRequired(objectMapper.writeValueAsString(Arrays.asList("Swimsuit", "Goggles", "Swim Cap")));
        swimming.setEquipmentProvided(objectMapper.writeValueAsString(Arrays.asList("Lanes", "Starting Blocks", "Timing System")));
        swimming.setVenueTypes(objectMapper.writeValueAsString(Arrays.asList("POOL", "INDOOR_POOL", "OUTDOOR_POOL")));
        swimming.setRules("Various stroke techniques. Lane discipline. Turn techniques at walls. Different distances and styles: freestyle, breaststroke, backstroke, butterfly.");
        swimming.setPopularityScore(7.8);
        swimming.setDifficultyLevel(Sport.DifficultyLevel.INTERMEDIATE);
        swimming.setIsTeamSport(false);
        swimming.setIsIndoor(true);
        swimming.setIsOutdoor(true);
        swimming.setIsWeatherDependent(false);
        swimming.setIconUrl("/images/sports/swimming-icon.png");
        swimming.setBannerUrl("/images/sports/swimming-banner.jpg");
        return swimming;
    }

    private Sport createAthletics() throws JsonProcessingException {
        Sport athletics = new Sport();
        athletics.setName("athletics");
        athletics.setDisplayName("Athletics/Track & Field");
        athletics.setDescription("A collection of sporting events that involve competitive running, jumping, throwing, and walking. It is one of the oldest forms of organized sports and includes events like sprints, long jump, and shot put.");
        athletics.setCategory(Sport.SportCategory.TRACK_SPORTS);
        athletics.setTeamSizeMin(1);
        athletics.setTeamSizeMax(4);
        athletics.setTotalPlayersMin(1);
        athletics.setTotalPlayersMax(100);
        athletics.setDurationMinutesMin(10);
        athletics.setDurationMinutesMax(180);
        athletics.setSkillLevels(objectMapper.writeValueAsString(Arrays.asList("BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT")));
        athletics.setEquipmentRequired(objectMapper.writeValueAsString(Arrays.asList("Running Shoes", "Athletic Wear", "Spikes")));
        athletics.setEquipmentProvided(objectMapper.writeValueAsString(Arrays.asList("Track", "Jumping Pits", "Throwing Circles", "Timing System")));
        athletics.setVenueTypes(objectMapper.writeValueAsString(Arrays.asList("TRACK", "INDOOR_TRACK", "OUTDOOR_TRACK")));
        athletics.setRules("Various event-specific rules. False starts result in disqualification. Proper technique required for field events. Relay baton exchanges must be within zones.");
        athletics.setPopularityScore(7.2);
        athletics.setDifficultyLevel(Sport.DifficultyLevel.ADVANCED);
        athletics.setIsTeamSport(false);
        athletics.setIsIndoor(true);
        athletics.setIsOutdoor(true);
        athletics.setIsWeatherDependent(true);
        athletics.setIconUrl("/images/sports/athletics-icon.png");
        athletics.setBannerUrl("/images/sports/athletics-banner.jpg");
        return athletics;
    }
}
