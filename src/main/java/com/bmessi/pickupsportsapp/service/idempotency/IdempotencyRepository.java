package com.bmessi.pickupsportsapp.service.idempotency;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;

public interface IdempotencyRepository extends JpaRepository<IdempotencyRecord, String> {
    void deleteByCreatedAtBefore(Instant cutoff);
}
