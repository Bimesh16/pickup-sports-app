package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.SavedSearchEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavedSearchRepository extends JpaRepository<SavedSearchEntity, Long> {
    List<SavedSearchEntity> findByUser_Username(String username);
}
