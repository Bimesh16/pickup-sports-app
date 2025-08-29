package com.bmessi.pickupsportsapp.exception;

import com.bmessi.pickupsportsapp.dto.ErrorResponse;
import com.bmessi.pickupsportsapp.service.monitoring.PerformanceMonitoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Global exception handler for centralized error handling and monitoring.
 * 
 * Features:
 * - Centralized exception handling
 * - Structured error responses
 * - Error tracking and monitoring
 * - Security-aware error handling
 * - Validation error handling
 * - Performance monitoring integration
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
@RestControllerAdvice
@RequiredArgsConstructor
@Slf4j
public class GlobalExceptionHandler {

    private final PerformanceMonitoringService performanceMonitoringService;

    /**
     * Handle validation errors from @Valid annotations.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex, WebRequest request) {
        
        String errorId = generateErrorId();
        log.warn("Validation error occurred - ID: {}, Details: {}", errorId, ex.getMessage());
        
        Map<String, Object> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .errorId(errorId)
            .timestamp(OffsetDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Validation Error")
            .message("Request validation failed")
            .path(getRequestPath(request))
            .details(fieldErrors)
            .build();
        
        // Track validation errors for monitoring
        trackError("VALIDATION_ERROR", errorId, request);
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle constraint violation errors.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex, WebRequest request) {
        
        String errorId = generateErrorId();
        log.warn("Constraint violation error occurred - ID: {}, Details: {}", errorId, ex.getMessage());
        
        Map<String, Object> violations = new HashMap<>();
        ex.getConstraintViolations().forEach(violation -> {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            violations.put(fieldName, errorMessage);
        });
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .errorId(errorId)
            .timestamp(OffsetDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Constraint Violation")
            .message("Request violates business constraints")
            .path(getRequestPath(request))
            .details(violations)
            .build();
        
        trackError("CONSTRAINT_VIOLATION", errorId, request);
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle authentication errors.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationError(
            AuthenticationException ex, WebRequest request) {
        
        String errorId = generateErrorId();
        log.warn("Authentication error occurred - ID: {}, Details: {}", errorId, ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .errorId(errorId)
            .timestamp(OffsetDateTime.now())
            .status(HttpStatus.UNAUTHORIZED.value())
            .error("Authentication Error")
            .message("Authentication failed")
            .path(getRequestPath(request))
            .build();
        
        trackError("AUTHENTICATION_ERROR", errorId, request);
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    /**
     * Handle bad credentials specifically.
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex, WebRequest request) {
        
        String errorId = generateErrorId();
        log.warn("Bad credentials error occurred - ID: {}, Details: {}", errorId, ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .errorId(errorId)
            .timestamp(OffsetDateTime.now())
            .status(HttpStatus.UNAUTHORIZED.value())
            .error("Bad Credentials")
            .message("Invalid username or password")
            .path(getRequestPath(request))
            .build();
        
        trackError("BAD_CREDENTIALS", errorId, request);
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    /**
     * Handle access denied errors.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, WebRequest request) {
        
        String errorId = generateErrorId();
        log.warn("Access denied error occurred - ID: {}, Details: {}", errorId, ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .errorId(errorId)
            .timestamp(OffsetDateTime.now())
            .status(HttpStatus.FORBIDDEN.value())
            .error("Access Denied")
            .message("Insufficient permissions to access this resource")
            .path(getRequestPath(request))
            .build();
        
        trackError("ACCESS_DENIED", errorId, request);
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    /**
     * Handle insufficient authentication errors.
     */
    @ExceptionHandler(InsufficientAuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientAuthentication(
            InsufficientAuthenticationException ex, WebRequest request) {
        
        String errorId = generateErrorId();
        log.warn("Insufficient authentication error occurred - ID: {}, Details: {}", errorId, ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .errorId(errorId)
            .timestamp(OffsetDateTime.now())
            .status(HttpStatus.UNAUTHORIZED.value())
            .error("Insufficient Authentication")
            .message("Additional authentication required")
            .path(getRequestPath(request))
            .build();
        
        trackError("INSUFFICIENT_AUTHENTICATION", errorId, request);
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    /**
     * Handle data integrity violation errors.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, WebRequest request) {
        
        String errorId = generateErrorId();
        log.error("Data integrity violation error occurred - ID: {}, Details: {}", errorId, ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .errorId(errorId)
            .timestamp(OffsetDateTime.now())
            .status(HttpStatus.CONFLICT.value())
            .error("Data Integrity Violation")
            .message("The requested operation violates data integrity constraints")
            .path(getRequestPath(request))
            .build();
        
        trackError("DATA_INTEGRITY_VIOLATION", errorId, request);
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    /**
     * Handle HTTP message not readable errors.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, WebRequest request) {
        
        String errorId = generateErrorId();
        log.warn("HTTP message not readable error occurred - ID: {}, Details: {}", errorId, ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .errorId(errorId)
            .timestamp(OffsetDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Invalid Request Body")
            .message("The request body could not be read or parsed")
            .path(getRequestPath(request))
            .build();
        
        trackError("HTTP_MESSAGE_NOT_READABLE", errorId, request);
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle missing request parameter errors.
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingServletRequestParameter(
            MissingServletRequestParameterException ex, WebRequest request) {
        
        String errorId = generateErrorId();
        log.warn("Missing request parameter error occurred - ID: {}, Details: {}", errorId, ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .errorId(errorId)
            .timestamp(OffsetDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Missing Parameter")
            .message("Required parameter '" + ex.getParameterName() + "' is missing")
            .path(getRequestPath(request))
            .build();
        
        trackError("MISSING_PARAMETER", errorId, request);
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle method argument type mismatch errors.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException ex, WebRequest request) {
        
        String errorId = generateErrorId();
        log.warn("Method argument type mismatch error occurred - ID: {}, Details: {}", errorId, ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .errorId(errorId)
            .timestamp(OffsetDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Type Mismatch")
            .message("Parameter '" + ex.getName() + "' has invalid type")
            .path(getRequestPath(request))
            .build();
        
        trackError("TYPE_MISMATCH", errorId, request);
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle no handler found errors (404).
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoHandlerFound(
            NoHandlerFoundException ex, WebRequest request) {
        
        String errorId = generateErrorId();
        log.warn("No handler found error occurred - ID: {}, Details: {}", errorId, ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .errorId(errorId)
            .timestamp(OffsetDateTime.now())
            .status(HttpStatus.NOT_FOUND.value())
            .error("Not Found")
            .message("The requested resource was not found")
            .path(getRequestPath(request))
            .build();
        
        trackError("NO_HANDLER_FOUND", errorId, request);
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    /**
     * Handle business logic exceptions.
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(
            BusinessException ex, WebRequest request) {
        
        String errorId = generateErrorId();
        log.warn("Business exception occurred - ID: {}, Details: {}", errorId, ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .errorId(errorId)
            .timestamp(OffsetDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Business Rule Violation")
            .message(ex.getMessage())
            .path(getRequestPath(request))
            .build();
        
        trackError("BUSINESS_EXCEPTION", errorId, request);
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle username taken exceptions.
     */
    @ExceptionHandler(UsernameTakenException.class)
    public ResponseEntity<ErrorResponse> handleUsernameTaken(
            UsernameTakenException ex, WebRequest request) {

        String errorId = generateErrorId();
        log.warn("Username taken - ID: {}, Details: {}", errorId, ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
            .errorId(errorId)
            .timestamp(OffsetDateTime.now())
            .status(HttpStatus.CONFLICT.value())
            .error("Username Already Taken")
            .message(ex.getMessage())
            .path(getRequestPath(request))
            .build();

        trackError("USERNAME_TAKEN", errorId, request);

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    /**
     * Handle resource not found exceptions.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
        
        String errorId = generateErrorId();
        log.warn("Resource not found exception occurred - ID: {}, Details: {}", errorId, ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .errorId(errorId)
            .timestamp(OffsetDateTime.now())
            .status(HttpStatus.NOT_FOUND.value())
            .error("Resource Not Found")
            .message(ex.getMessage())
            .path(getRequestPath(request))
            .build();
        
        trackError("RESOURCE_NOT_FOUND", errorId, request);
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    /**
     * Handle all other unexpected exceptions.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, WebRequest request) {
        
        String errorId = generateErrorId();
        log.error("Unexpected error occurred - ID: {}, Details: {}", errorId, ex.getMessage(), ex);
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .errorId(errorId)
            .timestamp(OffsetDateTime.now())
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .error("Internal Server Error")
            .message("An unexpected error occurred")
            .path(getRequestPath(request))
            .build();
        
        trackError("GENERIC_EXCEPTION", errorId, request);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    // Private helper methods

    private String generateErrorId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    private String getRequestPath(WebRequest request) {
        if (request instanceof HttpServletRequest) {
            return ((HttpServletRequest) request).getRequestURI();
        }
        return "unknown";
    }

    private void trackError(String errorType, String errorId, WebRequest request) {
        try {
            // Track error for monitoring and analytics
            // TODO: Implement error tracking in PerformanceMonitoringService
            log.debug("Error tracked - Type: {}, ID: {}, Path: {}", errorType, errorId, getRequestPath(request));
        } catch (Exception e) {
            log.warn("Failed to track error for monitoring", e);
        }
    }
}
