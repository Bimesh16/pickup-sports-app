package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.FeatureFlag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeatureFlagRepository extends JpaRepository<FeatureFlag, String> {
}
