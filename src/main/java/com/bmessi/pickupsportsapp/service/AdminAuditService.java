package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.AdminAudit;
import com.bmessi.pickupsportsapp.repository.AdminAuditRepository;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.slf4j.MDC;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminAuditService {

    private final AdminAuditRepository repo;
    private final MeterRegistry meterRegistry;

    @Transactional
    public AdminAudit record(String actor, String action, String targetType, Long targetId, String details) {
        AdminAudit a = AdminAudit.builder()
                .actor(actor == null ? "system" : actor)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .details(details)
                .correlationId(MDC.get("cid"))
                .build();
        AdminAudit saved = repo.save(a);
        try { meterRegistry.counter("admin.audit.recorded", "action", action).increment(); } catch (Exception ignore) {}
        return saved;
    }

    @Transactional(readOnly = true)
    public Page<AdminAudit> list(Pageable pageable) {
        return repo.findAllByOrderByCreatedAtDesc(pageable);
    }
}
