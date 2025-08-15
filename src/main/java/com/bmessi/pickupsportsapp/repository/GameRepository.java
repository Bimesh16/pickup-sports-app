package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.Game;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface GameRepository extends JpaRepository<Game, Long> {
    Page<Game> findBySport(String sport, Pageable pageable);
    Page<Game> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT g FROM Game g WHERE (:sport IS NULL OR g.sport = :sport) AND " +
            "(:location IS NULL OR LOWER(g.location) LIKE LOWER(CONCAT('%', :location, '%')))")
    Page<Game> findBySportAndLocation(String sport, String location, Pageable pageable);
}