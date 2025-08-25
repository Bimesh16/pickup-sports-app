package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.Sport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SportRepository extends JpaRepository<Sport, Long> {
    Optional<Sport> findByName(String name); // name is stored lowercased
}
