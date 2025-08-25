package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.RevokedToken;
import org.springframework.data.repository.CrudRepository;

public interface RevokedTokenRepository extends CrudRepository<RevokedToken, String> {
}

