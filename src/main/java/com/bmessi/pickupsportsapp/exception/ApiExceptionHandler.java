package com.bmessi.pickupsportsapp.exception;

import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import org.slf4j.MDC;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(RequestNotPermitted.class)
    public ResponseEntity<Map<String, Object>> tooManyRequests(RequestNotPermitted ex) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CACHE_CONTROL, "no-store");
        headers.add(HttpHeaders.PRAGMA, "no-cache");
        headers.add("Retry-After", "60");
        String cid = MDC.get("cid");
        if (cid != null && !cid.isBlank()) {
            headers.add("X-Correlation-Id", cid);
        }

        Map<String, Object> body = Map.of(
                "error", "too_many_requests",
                "message", "Too many requests, please try again later",
                "status", 429,
                "timestamp", Instant.now().toEpochMilli()
        );

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .headers(headers)
                .body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, Object> errs = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe ->
                errs.put(fe.getField(), fe.getDefaultMessage())
        );
        Map<String, Object> body = baseBody("validation_error", "Validation failed", 400, req.getRequestURI());
        body.put("errors", errs);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).headers(noStoreHeaders()).body(body);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraint(ConstraintViolationException ex, HttpServletRequest req) {
        Map<String, Object> body = baseBody("validation_error", ex.getMessage(), 400, req.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).headers(noStoreHeaders()).body(body);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> handleMissingParam(MissingServletRequestParameterException ex, HttpServletRequest req) {
        String msg = "Missing parameter: " + ex.getParameterName();
        Map<String, Object> body = baseBody("bad_request", msg, 400, req.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).headers(noStoreHeaders()).body(body);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        String msg = "Invalid value for parameter: " + ex.getName();
        Map<String, Object> body = baseBody("bad_request", msg, 400, req.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).headers(noStoreHeaders()).body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadable(HttpMessageNotReadableException ex, HttpServletRequest req) {
        Map<String, Object> body = baseBody("bad_request", "Malformed JSON request", 400, req.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).headers(noStoreHeaders()).body(body);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {
        Map<String, Object> body = baseBody("method_not_allowed", "HTTP method not supported", 405, req.getRequestURI());
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).headers(noStoreHeaders()).body(body);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleUnsupportedMedia(HttpMediaTypeNotSupportedException ex, HttpServletRequest req) {
        Map<String, Object> body = baseBody("unsupported_media_type", "Unsupported media type", 415, req.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).headers(noStoreHeaders()).body(body);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(org.springframework.security.access.AccessDeniedException ex, HttpServletRequest req) {
        Map<String, Object> body = baseBody("forbidden", "Access denied", 403, req.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).headers(noStoreHeaders()).body(body);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex, HttpServletRequest req) {
        int status = ex.getStatusCode().value();
        String message = ex.getReason() != null ? ex.getReason() : "Error";
        Map<String, Object> body = baseBody("error", message, status, req.getRequestURI());
        return ResponseEntity.status(ex.getStatusCode()).headers(noStoreHeaders()).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex, HttpServletRequest req) {
        Map<String, Object> body = baseBody("internal_server_error", "Unexpected error", 500, req.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).headers(noStoreHeaders()).body(body);
    }

    // ===========================
    // Helpers
    // ===========================
    private static HttpHeaders noStoreHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CACHE_CONTROL, "no-store");
        headers.add(HttpHeaders.PRAGMA, "no-cache");
        String cid = MDC.get("cid");
        if (cid != null && !cid.isBlank()) {
            headers.add("X-Correlation-Id", cid);
        }
        return headers;
    }

    private static Map<String, Object> baseBody(String error, String message, int status, String path) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", error);
        body.put("message", message);
        body.put("status", status);
        body.put("timestamp", Instant.now().toEpochMilli());
        if (path != null) {
            body.put("path", path);
        }
        return body;
    }
}
