package com.bmessi.pickupsportsapp.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 401: Invalid credentials (login) or invalid refresh token
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex, HttpServletRequest req) {
        log.debug("Bad credentials: {}", ex.getMessage());
        return build(HttpStatus.UNAUTHORIZED, "invalid_grant", "Invalid credentials", req);
    }

    // 403: Access denied for authorized user without permission
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        log.debug("Access denied: {}", ex.getMessage());
        return build(HttpStatus.FORBIDDEN, "access_denied", "Access is denied", req);
    }

    // 409: Username already taken (can be used in registration flows)
    @ExceptionHandler(UsernameTakenException.class)
    public ResponseEntity<Map<String, Object>> handleUsernameTaken(UsernameTakenException ex, HttpServletRequest req) {
        log.debug("Conflict: {}", ex.getMessage());
        return build(HttpStatus.CONFLICT, "conflict", messageOr(ex, "Username is already taken"), req);
    }

    // 400: Bean validation on @RequestBody DTOs (e.g., login input)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, Object> body = baseBody("validation_error", "Validation failed", HttpStatus.BAD_REQUEST.value(), req);
        List<FieldError> fieldErrors = ex.getBindingResult().getFieldErrors();
        Map<String, String> errors = new HashMap<>();
        for (FieldError fe : fieldErrors) {
            if (fe.getField() != null && fe.getDefaultMessage() != null) {
                errors.put(fe.getField(), fe.getDefaultMessage());
            }
        }
        body.put("errors", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).headers(noStoreHeaders()).body(body);
    }

    // 400: Bean validation on @RequestParam/@PathVariable
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest req) {
        Map<String, Object> body = baseBody("validation_error", "Validation failed", HttpStatus.BAD_REQUEST.value(), req);
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(v -> errors.put(
                v.getPropertyPath() != null ? v.getPropertyPath().toString() : "param",
                v.getMessage()
        ));
        body.put("errors", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).headers(noStoreHeaders()).body(body);
    }

    // 409 or 423: Concurrency/conflict cases
    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<Map<String, Object>> handleOptimisticLock(OptimisticLockingFailureException ex, HttpServletRequest req) {
        log.debug("Optimistic lock failure: {}", ex.getMessage());
        return build(HttpStatus.CONFLICT, "conflict", "Resource was updated concurrently. Please retry.", req);
    }

    // 500: Fallback
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception at {}: {}", req.getRequestURI(), ex.getMessage(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "internal_server_error", "An unexpected error occurred", req);
    }

    // Helpers

    private ResponseEntity<Map<String, Object>> build(HttpStatus status, String error, String message, HttpServletRequest req) {
        return ResponseEntity.status(status)
                .headers(noStoreHeaders())
                .body(baseBody(error, message, status.value(), req));
    }

    private Map<String, Object> baseBody(String error, String message, int status, HttpServletRequest req) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", error);
        body.put("message", message);
        body.put("status", status);
        body.put("timestamp", Instant.now().toEpochMilli());
        body.put("path", req.getRequestURI());
        String cid = MDC.get("cid");
        if (cid != null && !cid.isBlank()) {
            body.put("traceId", cid);
        }
        return body;
    }

    private HttpHeaders noStoreHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CACHE_CONTROL, "no-store");
        headers.add(HttpHeaders.PRAGMA, "no-cache");
        String cid = MDC.get("cid");
        if (cid != null && !cid.isBlank()) {
            headers.add("X-Correlation-Id", cid);
        }
        return headers;
    }

    private String messageOr(Throwable t, String fallback) {
        return (t != null && t.getMessage() != null && !t.getMessage().isBlank()) ? t.getMessage() : fallback;
    }
}