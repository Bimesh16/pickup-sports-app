package com.bmessi.pickupsportsapp.exception;

/**
 * Exception thrown when a requested resource is not found.
 * 
 * This exception is used for:
 * - Entity not found scenarios
 * - Resource lookup failures
 * - Missing data scenarios
 * - 404 equivalent business logic
 * 
 * @author Pickup Sports App Team
 * @version 2.0.0
 * @since 1.0.0
 */
public class ResourceNotFoundException extends RuntimeException {
    
    /**
     * Constructs a new resource not found exception with the specified detail message.
     * 
     * @param message the detail message
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    /**
     * Constructs a new resource not found exception with the specified detail message and cause.
     * 
     * @param message the detail message
     * @param cause the cause
     */
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
    /**
     * Constructs a new resource not found exception with the specified cause.
     * 
     * @param cause the cause
     */
    public ResourceNotFoundException(Throwable cause) {
        super(cause);
    }
    
    /**
     * Creates a resource not found exception for a specific entity type and identifier.
     * 
     * @param entityType the type of entity that was not found
     * @param identifier the identifier that was used to search
     * @return a new ResourceNotFoundException with a formatted message
     */
    public static ResourceNotFoundException forEntity(String entityType, Object identifier) {
        String message = String.format("%s not found with identifier: %s", entityType, identifier);
        return new ResourceNotFoundException(message);
    }
    
    /**
     * Creates a resource not found exception for a specific entity type and identifier.
     * 
     * @param entityType the type of entity that was not found
     * @param identifier the identifier that was used to search
     * @param fieldName the name of the field used for the search
     * @return a new ResourceNotFoundException with a formatted message
     */
    public static ResourceNotFoundException forEntity(String entityType, Object identifier, String fieldName) {
        String message = String.format("%s not found with %s: %s", entityType, fieldName, identifier);
        return new ResourceNotFoundException(message);
    }
}
