package com.bmessi.pickupsportsapp.exception;

import java.util.List;

/**
 * Exception thrown when game validation fails.
 * 
 * This exception contains detailed information about validation failures,
 * allowing the API to return comprehensive error messages to clients.
 */
public class GameValidationException extends RuntimeException {
    
    private final List<String> validationErrors;

    public GameValidationException(String message, List<String> validationErrors) {
        super(message);
        this.validationErrors = validationErrors;
    }

    public GameValidationException(String message, String validationError) {
        super(message);
        this.validationErrors = List.of(validationError);
    }

    public List<String> getValidationErrors() {
        return validationErrors;
    }

    @Override
    public String getMessage() {
        if (validationErrors.isEmpty()) {
            return super.getMessage();
        }
        return super.getMessage() + ": " + String.join(", ", validationErrors);
    }
}