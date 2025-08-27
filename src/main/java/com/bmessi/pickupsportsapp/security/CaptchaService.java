package com.bmessi.pickupsportsapp.security;

import org.springframework.stereotype.Service;

/**
 * Very lightweight CAPTCHA verification placeholder.
 * In production this would call out to a real CAPTCHA provider.
 */
@Service
public class CaptchaService {

    /**
     * Verify the provided token. Currently accepts the static token "pass".
     *
     * @param token captcha token from client
     * @return true if token is valid
     */
    public boolean verify(String token) {
        return token != null && token.equals("pass");
    }
}

