package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);
    void deleteByUsername(String username);
}
