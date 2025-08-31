package com.bmessi.pickupsportsapp.advice;

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
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.server.ResponseStatusException;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import org.springframework.stereotype.Component;

import com.bmessi.pickupsportsapp.exception.UsernameTakenException;
import com.bmessi.pickupsportsapp.security.MfaRequiredException;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
@Component("apiGlobalExceptionHandler")
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 401: Invalid credentials (login) or invalid refresh token
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex, HttpServletRequest req) {
        log.debug("Bad credentials: {}", ex.getMessage());
        return build(HttpStatus.UNAUTHORIZED, "invalid_grant", "Invalid credentials", req);
    }

    // 401: Missing authentication (no SecurityContext)
    @ExceptionHandler(AuthenticationCredentialsNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleAuthCredsNotFound(AuthenticationCredentialsNotFoundException ex, HttpServletRequest req) {
        log.debug("Unauthenticated: {}", ex.getMessage());
        return build(HttpStatus.UNAUTHORIZED, "unauthenticated", "Authentication is required", req);
    }

    // 401: MFA required but not satisfied
    @ExceptionHandler(MfaRequiredException.class)
    public ResponseEntity<Map<String, Object>> handleMfaRequired(MfaRequiredException ex, HttpServletRequest req) {
        log.debug("MFA required: {}", ex.getMessage());
        return build(HttpStatus.UNAUTHORIZED, "mfa_required", "MFA required", req);
    }

    // 401: Generic authentication failures
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthentication(AuthenticationException ex, HttpServletRequest req) {
        log.debug("Authentication failure: {}", ex.getMessage());
        return build(HttpStatus.UNAUTHORIZED, "unauthenticated", "Authentication is required", req);
    }

    // 403: Access denied
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        log.debug("Access denied: {}", ex.getMessage());
        return build(HttpStatus.FORBIDDEN, "access_denied", "Access is denied", req);
    }

    // 409: Username already taken
    @ExceptionHandler(UsernameTakenException.class)
    public ResponseEntity<Map<String, Object>> handleUsernameTaken(UsernameTakenException ex, HttpServletRequest req) {
        log.debug("Conflict: {}", ex.getMessage());
        return build(HttpStatus.CONFLICT, "conflict", messageOr(ex, "Username is already taken"), req);
    }

    // 400: JSON/body parse errors
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleNotReadable(HttpMessageNotReadableException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "bad_request", "Malformed JSON request", req);
    }

    // 400: Bean validation on @RequestBody DTOs
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
        for (var v : ex.getConstraintViolations()) {
            String field = (v.getPropertyPath() != null) ? v.getPropertyPath().toString() : "param";
            errors.put(field, v.getMessage());
        }
        body.put("errors", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).headers(noStoreHeaders()).body(body);
    }

    // 400: Generic bad request mapping
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .headers(noStoreHeaders())
                .body(baseBody("invalid_request", ex.getMessage() == null ? "Invalid request" : ex.getMessage(), HttpStatus.BAD_REQUEST.value(), req));
    }

    // 400: Missing/Type mismatch/Method/MediaType
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> handleMissingParam(MissingServletRequestParameterException ex, HttpServletRequest req) {
        String msg = "Missing parameter: " + ex.getParameterName();
        return build(HttpStatus.BAD_REQUEST, "bad_request", msg, req);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        String msg = "Invalid value for parameter: " + ex.getName();
        return build(HttpStatus.BAD_REQUEST, "bad_request", msg, req);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {
        return build(HttpStatus.METHOD_NOT_ALLOWED, "method_not_allowed", "HTTP method not supported", req);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleUnsupportedMedia(HttpMediaTypeNotSupportedException ex, HttpServletRequest req) {
        return build(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "unsupported_media_type", "Unsupported media type", req);
    }

    // 409/423: Concurrency/conflict
    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<Map<String, Object>> handleOptimisticLock(OptimisticLockingFailureException ex, HttpServletRequest req) {
        log.debug("Optimistic lock failure: {}", ex.getMessage());
        return build(HttpStatus.CONFLICT, "conflict", "Resource was updated concurrently. Please retry.", req);
    }

    // 429: Rate limit exceeded (Resilience4j)
    @ExceptionHandler(RequestNotPermitted.class)
    public ResponseEntity<Map<String, Object>> handleRateLimit(RequestNotPermitted ex,
                                                               HttpServletRequest req) {
        HttpHeaders h = noStoreHeaders();
        h.add("Retry-After", "60");
        Map<String, Object> body = baseBody("too_many_requests", "Too many requests, please try again later",
                HttpStatus.TOO_MANY_REQUESTS.value(), req);
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).headers(h).body(body);
    }

    // 4xx/5xx explicit
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex, HttpServletRequest req) {
        int status = ex.getStatusCode().value();
        HttpStatus resolved = HttpStatus.resolve(status);
        String fallback = (resolved != null ? resolved.getReasonPhrase() : "Error");
        String message = ex.getReason() != null ? ex.getReason() : fallback;
        Map<String, Object> body = baseBody("error", message, status, req);
        return ResponseEntity.status(ex.getStatusCode()).headers(noStoreHeaders()).body(body);
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
            body.put("correlationId", cid);
        }
        return body;
    }

    private HttpHeaders noStoreHeaders() {
        HttpHeaders headers = com.bmessi.pickupsportsapp.web.ApiResponseUtils.noStore();
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