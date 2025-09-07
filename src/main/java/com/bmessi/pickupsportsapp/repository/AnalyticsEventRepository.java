package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.AnalyticsEvent;
import com.bmessi.pickupsportsapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {
    List<AnalyticsEvent> findByUserAndEventTypeOrderByCreatedAtDesc(User user, String eventType);
    List<AnalyticsEvent> findByEventTypeOrderByCreatedAtDesc(String eventType);
}
