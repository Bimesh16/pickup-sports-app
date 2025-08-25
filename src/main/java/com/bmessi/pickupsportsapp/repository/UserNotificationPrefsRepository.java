package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.UserNotificationPrefs;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserNotificationPrefsRepository extends JpaRepository<UserNotificationPrefs, Long> {
    Optional<UserNotificationPrefs> findByUser_Id(Long userId);
}
