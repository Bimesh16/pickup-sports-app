package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
}