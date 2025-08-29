package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.HostActionAudit;
import com.bmessi.pickupsportsapp.repository.HostActionAuditRepository;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.slf4j.MDC;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HostActionAuditService {

    private final HostActionAuditRepository repo;
    private final MeterRegistry meterRegistry;

    @Transactional
    public HostActionAudit record(String actor, String action, String targetType, Long targetId, String details) {
        HostActionAudit a = HostActionAudit.builder()
                .actor(actor == null ? "system" : actor)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .details(details)
                .correlationId(MDC.get("cid"))
                .build();
        HostActionAudit saved = repo.save(a);
        try { meterRegistry.counter("host.audit.recorded", "action", action).increment(); } catch (Exception ignore) {}
        return saved;
    }

    @Transactional(readOnly = true)
    public Page<HostActionAudit> list(Pageable pageable) {
        return repo.findAllByOrderByCreatedAtDesc(pageable);
    }
}
