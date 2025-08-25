package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.VerifiedUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerifiedUserRepository extends JpaRepository<VerifiedUser, Long> {
    Optional<VerifiedUser> findByUsername(String username);
    boolean existsByUsername(String username);
}
