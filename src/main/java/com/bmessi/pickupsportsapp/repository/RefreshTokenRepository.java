package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.auth.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    List<RefreshToken> findByUser_UsernameAndRevokedAtIsNull(String username);
}
