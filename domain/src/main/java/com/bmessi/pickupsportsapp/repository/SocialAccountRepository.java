package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.SocialAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SocialAccountRepository extends JpaRepository<SocialAccount, Long> {
    Optional<SocialAccount> findByProviderAndSubject(String provider, String subject);
    Optional<SocialAccount> findByEmail(String email);
}
