package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.entity.AdminAudit;
import com.bmessi.pickupsportsapp.service.AdminAuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/admin/audit")
@RequiredArgsConstructor
public class AdminAuditController {

    private final AdminAuditService service;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AdminAudit>> list(Pageable pageable) {
        return ResponseEntity.ok().body(service.list(pageable));
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> export(Pageable pageable) {
        Page<AdminAudit> page = service.list(pageable);
        StringBuilder sb = new StringBuilder();
        sb.append("id,createdAt,actor,action,targetType,targetId,correlationId,details\n");
        for (AdminAudit a : page.getContent()) {
            sb.append(a.getId()).append(",")
              .append(a.getCreatedAt()).append(",")
              .append(escape(a.getActor())).append(",")
              .append(escape(a.getAction())).append(",")
              .append(escape(a.getTargetType())).append(",")
              .append(a.getTargetId()).append(",")
              .append(escape(a.getCorrelationId())).append(",")
              .append(escape(a.getDetails()))
              .append("\n");
        }
        byte[] bytes = sb.toString().getBytes(StandardCharsets.UTF_8);
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.valueOf("text/csv; charset=utf-8"));
        h.setContentDisposition(ContentDisposition.attachment().filename("admin_audit.csv").build());
        return ResponseEntity.ok().headers(h).body(bytes);
    }

    private static String escape(String s) {
        if (s == null) return "";
        String t = s.replace("\"", "\"\"");
        return "\"" + t + "\"";
    }
}
