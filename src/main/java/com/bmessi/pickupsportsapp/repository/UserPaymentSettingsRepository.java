package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.UserPaymentSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPaymentSettingsRepository extends JpaRepository<UserPaymentSettings, Long> {
    Optional<UserPaymentSettings> findByUserId(String userId);
    Optional<UserPaymentSettings> findByUserUsername(String username);
}
