package com.bmessi.pickupsportsapp.config;

import com.bmessi.pickupsportsapp.config.properties.VapidProperties;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.util.Base64;

@Component
@RequiredArgsConstructor
public class VapidKeyGenerator {

    private static final Logger log = LoggerFactory.getLogger(VapidKeyGenerator.class);

    private final VapidProperties props;

    @EventListener(ApplicationReadyEvent.class)
    public void ensureKeys() {
        try {
            if (isBlank(props.getPublicKey()) || isBlank(props.getPrivateKey())) {
                // Generate EC P-256 keypair (placeholder guidance; real VAPID keys use specific curve/format)
                KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC");
                kpg.initialize(256);
                KeyPair kp = kpg.generateKeyPair();
                String pub = Base64.getUrlEncoder().withoutPadding().encodeToString(kp.getPublic().getEncoded());
                String pri = Base64.getUrlEncoder().withoutPadding().encodeToString(kp.getPrivate().getEncoded());
                log.warn("VAPID keys are not configured. Example keys (do NOT use in production):");
                log.warn("push.vapid.public-key={}", pub);
                log.warn("push.vapid.private-key={}", pri);
                log.warn("Please generate real VAPID keys and configure them securely.");
            }
        } catch (Exception e) {
            log.debug("VAPID key check/generation failed: {}", e.getMessage());
        }
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
