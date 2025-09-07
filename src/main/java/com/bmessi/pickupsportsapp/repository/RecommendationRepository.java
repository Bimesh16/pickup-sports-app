package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.Recommendation;
import com.bmessi.pickupsportsapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findByUserAndIsViewedFalseOrderByCreatedAtDesc(User user);
    List<Recommendation> findByUserAndTypeOrderByCreatedAtDesc(User user, String type);
}
