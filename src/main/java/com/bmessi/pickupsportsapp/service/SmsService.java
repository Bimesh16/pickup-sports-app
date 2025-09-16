package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.config.properties.SmsProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * SMS delivery behind provider properties.
 * Providers:
 *  - LOG (default): logs messages
 *  - TWILIO: uses Twilio REST API via Java 11 HttpClient (no SDK needed)
 *  - SNS: attempts AWS SNS v2 SDK if present on classpath; else logs.
 */
@Service
@Slf4j
@RequiredArgsConstructor
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "sms.service.enabled", havingValue = "true", matchIfMissing = false)
public class SmsService {

    private final SmsProperties props;

    public void sendPasswordResetSms(String toPhone, String link) {
        String body = props.getSenderName() + ": Reset your password: " + link;
        sendGenericSms(toPhone, body);
    }

    public void sendUsernameReminderSms(String toPhone, String username) {
        String body = props.getSenderName() + ": Your username is " + username;
        sendGenericSms(toPhone, body);
    }

    public void sendGenericSms(String toPhone, String text) {
        String provider = (props.getProvider() == null ? "LOG" : props.getProvider()).trim().toUpperCase();
        switch (provider) {
            case "TWILIO" -> sendViaTwilio(toPhone, text);
            case "SNS" -> sendViaSns(toPhone, text);
            default -> log.info("[SMS:LOG] to={} | {}", toPhone, text);
        }
    }

    private void sendViaTwilio(String toPhone, String text) {
        try {
            String sid = props.getTwilioAccountSid();
            String token = props.getTwilioAuthToken();
            String from = props.getTwilioFromNumber();
            if (sid == null || token == null || from == null) {
                log.warn("Twilio missing credentials; falling back to LOG");
                log.info("[SMS:LOG] to={} | {}", toPhone, text);
                return;
            }

            String form = form(Map.of(
                    "To", toPhone,
                    "From", from,
                    "Body", text
            ));
            String basic = Base64.getEncoder().encodeToString((sid + ":" + token).getBytes(StandardCharsets.UTF_8));
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.twilio.com/2010-04-01/Accounts/" + sid + "/Messages.json"))
                    .header("Authorization", "Basic " + basic)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(form))
                    .build();
            HttpResponse<String> res = HttpClient.newHttpClient().send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() >= 200 && res.statusCode() < 300) {
                log.info("[SMS:TWILIO] sent to {}", toPhone);
            } else {
                log.error("[SMS:TWILIO] failed status={} body={}", res.statusCode(), res.body());
            }
        } catch (Exception e) {
            log.error("[SMS:TWILIO] error {}", e.getMessage());
        }
    }

    private void sendViaSns(String toPhone, String text) {
        try {
            // Attempt to use AWS SDK v2 via reflection to avoid hard dependency when not present
            Class<?> regionCls = Class.forName("software.amazon.awssdk.regions.Region");
            Class<?> snsCls = Class.forName("software.amazon.awssdk.services.sns.SnsClient");
            Class<?> credsCls = Class.forName("software.amazon.awssdk.auth.credentials.AwsBasicCredentials");
            Class<?> providerCls = Class.forName("software.amazon.awssdk.auth.credentials.StaticCredentialsProvider");
            Class<?> pubReqCls = Class.forName("software.amazon.awssdk.services.sns.model.PublishRequest");

            Object region = regionCls.getMethod("of", String.class).invoke(null, props.getAwsRegion());
            Object creds = credsCls.getMethod("create", String.class, String.class)
                    .invoke(null, props.getAwsAccessKeyId(), props.getAwsSecretAccessKey());
            Object provider = providerCls.getMethod("create", Class.forName("software.amazon.awssdk.auth.credentials.AwsCredentials")).invoke(null, creds);
            Object client = snsCls.getMethod("builder").invoke(null);
            client = client.getClass().getMethod("region", regionCls).invoke(client, region);
            client = client.getClass().getMethod("credentialsProvider", Class.forName("software.amazon.awssdk.auth.credentials.AwsCredentialsProvider")).invoke(client, provider);
            Object sns = client.getClass().getMethod("build").invoke(client);

            Object req = pubReqCls.getMethod("builder").invoke(null);
            req = req.getClass().getMethod("phoneNumber", String.class).invoke(req, toPhone);
            req = req.getClass().getMethod("message", String.class).invoke(req, text);
            req = req.getClass().getMethod("build").invoke(req);

            sns.getClass().getMethod("publish", pubReqCls).invoke(sns, req);
            log.info("[SMS:SNS] sent to {}", toPhone);
        } catch (ClassNotFoundException cnf) {
            log.warn("AWS SDK not on classpath; falling back to LOG");
            log.info("[SMS:LOG] to={} | {}", toPhone, text);
        } catch (Exception e) {
            log.error("[SMS:SNS] error {}", e.getMessage());
        }
    }

    private static String form(Map<String, String> params) {
        return params.entrySet().stream()
                .map(e -> urlEncode(e.getKey()) + "=" + urlEncode(e.getValue()))
                .collect(Collectors.joining("&"));
    }

    private static String urlEncode(String s) {
        return java.net.URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}

