package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.PushOutbox;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PushOutboxRepository extends JpaRepository<PushOutbox, Long> {
    List<PushOutbox> findTop100ByStatusOrderByCreatedAtAsc(PushOutbox.Status status);
}
