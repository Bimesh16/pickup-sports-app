package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.EmailChangeToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailChangeTokenRepository extends JpaRepository<EmailChangeToken, Long> {
    Optional<EmailChangeToken> findByToken(String token);
    void deleteByUsername(String username);
}
