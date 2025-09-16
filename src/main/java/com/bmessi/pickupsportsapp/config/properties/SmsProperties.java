package com.bmessi.pickupsportsapp.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "sms")
@Getter
@Setter
public class SmsProperties {
    /** Whether SMS is enabled at all. */
    private boolean enabled = false;
    /** Provider: LOG (default), TWILIO, or SNS. */
    private String provider = "LOG";

    // Twilio
    private String twilioAccountSid;
    private String twilioAuthToken;
    private String twilioFromNumber;

    // AWS SNS
    private String awsRegion;
    private String awsAccessKeyId;
    private String awsSecretAccessKey;

    // Branding
    private String senderName = "PickupSports";
}

