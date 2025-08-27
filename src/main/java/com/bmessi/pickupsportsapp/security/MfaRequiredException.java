package com.bmessi.pickupsportsapp.security;

import org.springframework.security.core.AuthenticationException;

/**
 * Thrown when MFA is required by policy but not satisfied.
 */
public class MfaRequiredException extends AuthenticationException {
    public MfaRequiredException(String msg) {
        super(msg);
    }
}
