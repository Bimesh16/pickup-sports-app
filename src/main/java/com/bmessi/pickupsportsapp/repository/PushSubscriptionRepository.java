package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    List<PushSubscription> findByUser_Username(String username);
    Optional<PushSubscription> findByEndpoint(String endpoint);
    int deleteByUser_UsernameAndEndpoint(String username, String endpoint);
}
