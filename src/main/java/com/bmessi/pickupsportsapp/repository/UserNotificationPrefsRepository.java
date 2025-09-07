package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.UserNotificationPrefs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserNotificationPrefsRepository extends JpaRepository<UserNotificationPrefs, Long> {
    Optional<UserNotificationPrefs> findByUserId(String userId);
    Optional<UserNotificationPrefs> findByUserUsername(String username);
}