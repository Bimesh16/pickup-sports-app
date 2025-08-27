package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.HostActionAudit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.Repository;

import java.util.Optional;

public interface HostActionAuditRepository extends Repository<HostActionAudit, Long> {
    HostActionAudit save(HostActionAudit audit);
    Page<HostActionAudit> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Optional<HostActionAudit> findById(Long id);
}
