package com.bmessi.pickupsportsapp.exception;

/**
 * Exception thrown when business logic rules are violated.
 * 
 * This exception is used for:
 * - Business rule violations
 * - Invalid business operations
 * - Domain-specific constraint violations
 * - Workflow rule violations
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
public class BusinessException extends RuntimeException {
    
    /**
     * Constructs a new business exception with the specified detail message.
     * 
     * @param message the detail message
     */
    public BusinessException(String message) {
        super(message);
    }
    
    /**
     * Constructs a new business exception with the specified detail message and cause.
     * 
     * @param message the detail message
     * @param cause the cause
     */
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
    
    /**
     * Constructs a new business exception with the specified cause.
     * 
     * @param cause the cause
     */
    public BusinessException(Throwable cause) {
        super(cause);
    }
}
