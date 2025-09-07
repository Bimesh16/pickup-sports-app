package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.UserNavigationPrefs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserNavigationPrefsRepository extends JpaRepository<UserNavigationPrefs, Long> {
    
    Optional<UserNavigationPrefs> findByUserUsername(String username);
    
    Optional<UserNavigationPrefs> findByUserId(Long userId);
    
    void deleteByUserUsername(String username);
}
