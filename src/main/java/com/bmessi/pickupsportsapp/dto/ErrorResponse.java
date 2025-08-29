package com.bmessi.pickupsportsapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * Structured error response DTO for consistent error handling.
 * 
 * Features:
 * - Unique error ID for tracking
 * - Timestamp of error occurrence
 * - HTTP status code
 * - Error type and message
 * - Request path information
 * - Detailed error information
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    
    /**
     * Unique error identifier for tracking and debugging.
     */
    private String errorId;
    
    /**
     * Timestamp when the error occurred.
     */
    private OffsetDateTime timestamp;
    
    /**
     * HTTP status code of the error.
     */
    private int status;
    
    /**
     * Error type/category.
     */
    private String error;
    
    /**
     * Human-readable error message.
     */
    private String message;
    
    /**
     * Request path where the error occurred.
     */
    private String path;
    
    /**
     * Additional error details (field errors, validation errors, etc.).
     */
    private Map<String, Object> details;
}
