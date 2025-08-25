package com.bmessi.pickupsportsapp.dto.api;

import java.time.Instant;

public record AbuseReportResponse(Long id, String status, Instant createdAt, Instant resolvedAt, String resolver) {}
