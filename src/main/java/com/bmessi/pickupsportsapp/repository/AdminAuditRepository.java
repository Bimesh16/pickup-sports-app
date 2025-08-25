package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.AdminAudit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminAuditRepository extends JpaRepository<AdminAudit, Long> {
    Page<AdminAudit> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
