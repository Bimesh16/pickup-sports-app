package com.bmessi.pickupsportsapp.repository;

import com.bmessi.pickupsportsapp.entity.AbuseReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AbuseReportRepository extends JpaRepository<AbuseReport, Long> {
    Page<AbuseReport> findByStatusOrderByCreatedAtDesc(AbuseReport.Status status, Pageable pageable);
    Page<AbuseReport> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
