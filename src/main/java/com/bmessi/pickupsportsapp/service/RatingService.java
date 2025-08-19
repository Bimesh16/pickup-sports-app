package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.RateUserRequest;
import com.bmessi.pickupsportsapp.dto.RatingDTO;
import com.bmessi.pickupsportsapp.dto.UserRatingSummaryDTO;
import com.bmessi.pickupsportsapp.entity.Game;
import com.bmessi.pickupsportsapp.entity.PlayerRating;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.GameRepository;
import com.bmessi.pickupsportsapp.repository.PlayerRatingRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Service for rating players.  Handles rating upsert logic, validation of
 * participation and game completion, and updates users' rating aggregates.
 */
@Service
@RequiredArgsConstructor
public class RatingService {

    private final PlayerRatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final GameRepository gameRepository;

    @Transactional
    public RatingDTO rateUser(String raterUsername, RateUserRequest req) {
        if (req.ratedUserId() == null || req.gameId() == null) {
            throw new IllegalArgumentException("ratedUserId and gameId are required");
        }

        User rater = userRepository.findOptionalByUsername(raterUsername)
                .orElseThrow(() -> new IllegalArgumentException("Rater not found"));

        if (rater.getId().equals(req.ratedUserId())) {
            throw new IllegalArgumentException("You cannot rate yourself");
        }

        User rated = userRepository.findById(req.ratedUserId())
                .orElseThrow(() -> new IllegalArgumentException("Rated user not found"));

        Game game = gameRepository.findById(req.gameId())
                .orElseThrow(() -> new IllegalArgumentException("Game not found"));

        // Validate both participated (rater and rated)
        boolean raterParticipated = participated(game.getId(),
                rater.getId(),
                game.getUser() != null && game.getUser().getId().equals(rater.getId()));
        boolean ratedParticipated = participated(game.getId(),
                rated.getId(),
                game.getUser() != null && game.getUser().getId().equals(rated.getId()));

        if (!raterParticipated || !ratedParticipated) {
            throw new IllegalArgumentException("Both users must have participated in the game");
        }

        // Game must be completed (time < now)
        OffsetDateTime gameTime = OffsetDateTime.from(game.getTime());
        if (gameTime == null || gameTime.isAfter(OffsetDateTime.now())) {
            throw new IllegalArgumentException("You can only rate after the game is completed");
        }

        // Upsert: one rating per rater->rated per game
        var existing = ratingRepository.findByRaterAndRatedAndGame(rater, rated, game);
        PlayerRating rating = existing.orElseGet(() -> PlayerRating.builder()
                .rater(rater)
                .rated(rated)
                .game(game)
                .createdAt(Instant.now())
                .build());

        rating.setScore(req.score());
        rating.setComment(req.comment());
        rating.setUpdatedAt(Instant.now());

        PlayerRating saved = ratingRepository.save(rating);

        // Refresh aggregates on rated user
        updateUserAggregate(rated.getId());

        return new RatingDTO(
                saved.getId(),
                rater.getId(),
                rated.getId(),
                game.getId(),
                saved.getScore(),
                saved.getComment(),
                saved.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public UserRatingSummaryDTO getSummary(Long userId) {
        Double avg = ratingRepository.computeAverageForRated(userId);
        Integer cnt = ratingRepository.computeCountForRated(userId);
        return new UserRatingSummaryDTO(userId, avg == null ? 0.0 : round1(avg), cnt == null ? 0 : cnt);
    }

    @Transactional(readOnly = true)
    public List<RatingDTO> getRecentRatings(Long userId, int limit) {
        int size = limit <= 0 ? 1 : limit;
        Pageable pageable = PageRequest.of(0, size);
        var list = ratingRepository.findRecentByRatedId(userId, pageable);
        return list.stream().map(r -> new RatingDTO(
                r.getId(),
                r.getRater().getId(),
                r.getRated().getId(),
                r.getGame().getId(),
                r.getScore(),
                r.getComment(),
                r.getCreatedAt()
        )).toList();
    }

    private boolean participated(Long gameId, Long userId, boolean isOwner) {
        // Owner counts as participant; otherwise check join table
        return isOwner || gameRepository.existsParticipant(gameId, userId);
    }

    @Transactional
    protected void updateUserAggregate(Long ratedUserId) {
        Double avg = ratingRepository.computeAverageForRated(ratedUserId);
        Integer cnt = ratingRepository.computeCountForRated(ratedUserId);
        var user = userRepository.findById(ratedUserId).orElseThrow();
        user.setRatingAverage(avg);
        user.setRatingCount(cnt);
        userRepository.save(user);
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
