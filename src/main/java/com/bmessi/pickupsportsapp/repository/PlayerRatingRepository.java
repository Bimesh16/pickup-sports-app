package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.Game;
import com.bmessi.pickupsportsapp.entity.PlayerRating;
import com.bmessi.pickupsportsapp.entity.User;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.awt.print.Pageable;
import java.util.List;
import java.util.Optional;

public interface PlayerRatingRepository extends JpaRepository<PlayerRating, Long> {

    Optional<PlayerRating> findByRaterAndRatedAndGame(User rater, User rated, Game game);

    @Query("select r from PlayerRating r where r.rated.id = :ratedId order by r.createdAt desc")
    List<PlayerRating> findRecentByRatedId(@Param("ratedId") Long ratedId, Pageable pageable);

    @Query("select avg(r.score) from PlayerRating r where r.rated.id = :ratedId")
    Double computeAverageForRated(@Param("ratedId") Long ratedId);

    @Query("select count(r) from PlayerRating r where r.rated.id = :ratedId")
    Integer computeCountForRated(@Param("ratedId") Long ratedId);
}