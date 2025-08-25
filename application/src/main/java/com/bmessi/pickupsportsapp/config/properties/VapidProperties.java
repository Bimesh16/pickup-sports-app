package com.bmessi.pickupsportsapp.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * VAPID credentials for Web Push delivery.
 * Configure in application.yml (or env) under prefix 'push.vapid'.
 * Example:
 *   push:
 *     vapid:
 *       public-key: 'B...'
 *       private-key: 'W...'
 *       subject: 'mailto:admin@example.com'
 */
@Component
@ConfigurationProperties(prefix = "push.vapid")
public class VapidProperties {

    /**
     * Public VAPID key (base64url).
     */
    private String publicKey;

    /**
     * Private VAPID key (base64url).
     */
    private String privateKey;

    /**
     * Subject (mailto: or https:)
     */
    private String subject = "mailto:admin@example.com";

    public String getPublicKey() {
        return publicKey;
    }
    public void setPublicKey(String publicKey) {
        this.publicKey = publicKey;
    }
    public String getPrivateKey() {
        return privateKey;
    }
    public void setPrivateKey(String privateKey) {
        this.privateKey = privateKey;
    }
    public String getSubject() {
        return subject;
    }
    public void setSubject(String subject) {
        this.subject = subject;
    }
}
