package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.UserSportsPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSportsPreferencesRepository extends JpaRepository<UserSportsPreferences, Long> {
    Optional<UserSportsPreferences> findByUserId(String userId);
    Optional<UserSportsPreferences> findByUserUsername(String username);
}
