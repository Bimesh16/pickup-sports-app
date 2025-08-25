package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.AbuseReport;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.AbuseReportRepository;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AbuseReportService {

    private final AbuseReportRepository repo;
    private final UserRepository users;
    private final io.micrometer.core.instrument.MeterRegistry meterRegistry;

    @Timed("abuse.create")
    @Transactional
    public AbuseReport create(String reporterUsername, AbuseReport.SubjectType subjectType, Long subjectId, String reason) {
        if (reporterUsername == null || reporterUsername.isBlank()) {
            throw new IllegalArgumentException("reporter required");
        }
        if (subjectType == null || subjectId == null) {
            throw new IllegalArgumentException("subject required");
        }
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("reason required");
        }
        User reporter = users.findOptionalByUsername(reporterUsername)
                .orElseThrow(() -> new IllegalArgumentException("user not found"));
        AbuseReport r = AbuseReport.builder()
                .reporter(reporter)
                .subjectType(subjectType)
                .subjectId(subjectId)
                .reason(reason.trim())
                .status(AbuseReport.Status.OPEN)
                .build();
        AbuseReport saved = repo.save(r);
        try { meterRegistry.counter("abuse.report.created", "type", subjectType.name()).increment(); } catch (Exception ignore) {}
        return saved;
    }

    @Timed("abuse.list")
    @Transactional(readOnly = true)
    public Page<AbuseReport> list(AbuseReport.Status status, Pageable pageable) {
        if (status != null) return repo.findByStatusOrderByCreatedAtDesc(status, pageable);
        return repo.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Timed("abuse.updateStatus")
    @Transactional
    public AbuseReport updateStatus(Long id, AbuseReport.Status status, String resolver) {
        AbuseReport r = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("not found"));
        r.setStatus(status);
        if (status == AbuseReport.Status.RESOLVED || status == AbuseReport.Status.REJECTED) {
            r.setResolvedAt(Instant.now());
            r.setResolver(resolver);
        }
        AbuseReport saved = repo.save(r);
        try { meterRegistry.counter("abuse.report.updated", "status", status.name()).increment(); } catch (Exception ignore) {}
        return saved;
    }
}
