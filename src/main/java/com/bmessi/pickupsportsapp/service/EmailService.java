package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.User;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@localhost}")
    private String from;

    @Value("${app.mail.from-name:Pickup Sports}")
    private String fromName;

    /**
     * Sends a welcome email to the given user.  Runs asynchronously
     * so it doesn't block the request thread.
     */
    @Async
    @Retry(name = "mail", fallbackMethod = "fallbackWelcomeEmail")
    public void sendWelcomeEmail(User user) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(String.format("%s <%s>", fromName, from));
        message.setTo(user.getUsername()); // assuming username == email
        message.setSubject("Welcome to Pickup Sports!");
        message.setText(String.format(
                "Hi %s,\n\n"
                        + "Thanks for registering on Pickup Sports. "
                        + "We’re excited to have you on board.\n\n"
                        + "Happy playing!\n\n"
                        + "The Pickup Sports Team",
                user.getUsername()
        ));
        mailSender.send(message);
        log.info("Sent welcome email to {}", user.getUsername());
    }

    @org.springframework.beans.factory.annotation.Value("${app.mail.support:}")
    private String supportEmail;

    @Async
    @Retry(name = "mail", fallbackMethod = "fallbackVerificationEmail")
    public void sendVerificationEmail(String to, String link) {
        sendVerificationEmail(to, link, java.util.Locale.getDefault());
    }

    @Async
    @Retry(name = "mail", fallbackMethod = "fallbackVerificationEmail")
    public void sendVerificationEmail(String to, String link, java.util.Locale locale) {
        try {
            var mime = mailSender.createMimeMessage();
            var helper = new org.springframework.mail.javamail.MimeMessageHelper(mime, "UTF-8");
            helper.setFrom(String.format("%s <%s>", fromName, from));
            helper.setTo(to);
            helper.setSubject("Verify your email");
            String template = pickTemplate("templates/email/verification", locale);
            String html = loadTemplate(template)
                    .replace("{{appName}}", fromName)
                    .replace("{{link}}", link)
                    .replace("{{supportEmail}}", supportEmail == null ? "" : supportEmail)
                    .replace("{{expiryHours}}", "24");
            helper.setText(html, true);
            mailSender.send(mime);
        } catch (Exception e) {
            // Fallback to plain text
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(String.format("%s <%s>", fromName, from));
            message.setTo(to);
            message.setSubject("Verify your email");
            message.setText("Please verify your email: " + link);
            mailSender.send(message);
        }
        log.info("Sent verification email to {}", to);
    }

    @Async
    @Retry(name = "mail", fallbackMethod = "fallbackResetEmail")
    public void sendPasswordResetEmail(String to, String link) {
        sendPasswordResetEmail(to, link, java.util.Locale.getDefault());
    }

    @Async
    @Retry(name = "mail", fallbackMethod = "fallbackResetEmail")
    public void sendPasswordResetEmail(String to, String link, java.util.Locale locale) {
        try {
            var mime = mailSender.createMimeMessage();
            var helper = new org.springframework.mail.javamail.MimeMessageHelper(mime, "UTF-8");
            helper.setFrom(String.format("%s <%s>", fromName, from));
            helper.setTo(to);
            helper.setSubject("Reset your password");
            String template = pickTemplate("templates/email/reset", locale);
            String html = loadTemplate(template)
                    .replace("{{appName}}", fromName)
                    .replace("{{link}}", link)
                    .replace("{{supportEmail}}", supportEmail == null ? "" : supportEmail)
                    .replace("{{expiryHours}}", "2");
            helper.setText(html, true);
            mailSender.send(mime);
        } catch (Exception e) {
            // Fallback to plain text
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(String.format("%s <%s>", fromName, from));
            message.setTo(to);
            message.setSubject("Reset your password");
            message.setText("Reset your password using this link: " + link);
            mailSender.send(message);
        }
        log.info("Sent password reset email to {}", to);
    }

    private String loadTemplate(String path) throws java.io.IOException {
        try (var is = this.getClass().getClassLoader().getResourceAsStream(path)) {
            if (is == null) return "";
            return new String(is.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
        }
    }

        @Async
        @Retry(name = "mail", fallbackMethod = "fallbackChangeEmail")
        public void sendChangeEmailVerification(String to, String link) {
            sendChangeEmailVerification(to, link, java.util.Locale.getDefault());
        }

        @Async
        @Retry(name = "mail", fallbackMethod = "fallbackChangeEmail")
        public void sendChangeEmailVerification(String to, String link, java.util.Locale locale) {
            try {
                var mime = mailSender.createMimeMessage();
                var helper = new org.springframework.mail.javamail.MimeMessageHelper(mime, "UTF-8");
                helper.setFrom(String.format("%s <%s>", fromName, from));
                helper.setTo(to);
                helper.setSubject("Confirm your new email");
                String template = pickTemplate("templates/email/change-email", locale);
                String html = loadTemplate(template)
                        .replace("{{appName}}", fromName)
                        .replace("{{link}}", link)
                        .replace("{{supportEmail}}", supportEmail == null ? "" : supportEmail)
                        .replace("{{expiryHours}}", "24");
                helper.setText(html, true);
                mailSender.send(mime);
            } catch (Exception e) {
                // Fallback to plain text
                org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
                message.setFrom(String.format("%s <%s>", fromName, from));
                message.setTo(to);
                message.setSubject("Confirm your new email");
                message.setText("Confirm your new email using this link: " + link);
                mailSender.send(message);
            }
            log.info("Sent change-email verification to {}", to);
        }

        private String pickTemplate(String basePath, java.util.Locale locale) throws java.io.IOException {
            if (locale != null) {
                String lang = locale.getLanguage();
                if (lang != null && !lang.isBlank()) {
                    String candidate = basePath + "_" + lang + ".html";
                    try (var is = this.getClass().getClassLoader().getResourceAsStream(candidate)) {
                        if (is != null) return candidate;
                    }
                }
            }
            return basePath + ".html";
        }

        @SuppressWarnings("unused")
        private void fallbackChangeEmail(String to, String link, Throwable ex) {
            log.error("Failed to send change-email verification to {} after retries: {}", to, ex.getMessage(), ex);
        }

    // Fallback invoked after retry attempts are exhausted
    @SuppressWarnings("unused")
    private void fallbackWelcomeEmail(User user, Throwable ex) {
        log.error("Failed to send welcome email to {} after retries: {}", user.getUsername(), ex.getMessage(), ex);
        // Optionally push to a dead-letter log/store for later reprocessing
    }

    @SuppressWarnings("unused")
    private void fallbackVerificationEmail(String to, String link, Throwable ex) {
        log.error("Failed to send verification email to {} after retries: {}", to, ex.getMessage(), ex);
    }

    @SuppressWarnings("unused")
    private void fallbackResetEmail(String to, String link, Throwable ex) {
        log.error("Failed to send password reset email to {} after retries: {}", to, ex.getMessage(), ex);
    }

    @Async
    @Retry(name = "mail", fallbackMethod = "fallbackGameEventEmail")
    public void sendGameEventEmail(String to, String eventType, java.util.Map<String, String> model) {
        sendGameEventEmail(to, eventType, model, java.util.Locale.getDefault());
    }

    @Async
    @Retry(name = "mail", fallbackMethod = "fallbackGameEventEmailWithLocale")
    public void sendGameEventEmail(String to, String eventType, java.util.Map<String, String> model, java.util.Locale locale) {
        try {
            var mime = mailSender.createMimeMessage();
            var helper = new org.springframework.mail.javamail.MimeMessageHelper(mime, "UTF-8");
            helper.setFrom(String.format("%s <%s>", fromName, from));
            helper.setTo(to);
            String subject = com.bmessi.pickupsportsapp.i18n.EventI18n.subject(eventType, locale);
            helper.setSubject(subject);

            String template = pickTemplate("templates/email/game-event", locale == null ? java.util.Locale.getDefault() : locale);
            String html = loadTemplate(template)
                    .replace("{{appName}}", fromName)
                    .replace("{{eventType}}", String.valueOf(eventType))
                    .replace("{{sport}}", model.getOrDefault("sport", ""))
                    .replace("{{location}}", model.getOrDefault("location", ""))
                    .replace("{{actor}}", model.getOrDefault("actor", ""))
                    .replace("{{supportEmail}}", supportEmail == null ? "" : supportEmail);
            helper.setText(html, true);
            mailSender.send(mime);
        } catch (Exception e) {
            // Fallback to plain text
            org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
            message.setFrom(String.format("%s <%s>", fromName, from));
            message.setTo(to);
            message.setSubject("Game notification");
            String sport = model.getOrDefault("sport", "");
            String location = model.getOrDefault("location", "");
            String actor = model.getOrDefault("actor", "");
            message.setText("Event: " + eventType + " | Sport: " + sport + " | Location: " + location + " | By: " + actor);
            mailSender.send(message);
        }
        log.info("Sent game event email '{}' to {}", eventType, to);
    }

    @SuppressWarnings("unused")
    private void fallbackGameEventEmailWithLocale(String to, String eventType, java.util.Map<String, String> model, java.util.Locale locale, Throwable ex) {
        log.error("Failed to send game event email to {} after retries (locale {}): {}", to, locale, ex.getMessage(), ex);
    }

    @SuppressWarnings("unused")
    private void fallbackGameEventEmail(String to, String eventType, java.util.Map<String, String> model, Throwable ex) {
        log.error("Failed to send game event email '{}' to {} after retries: {}", eventType, to, ex.getMessage(), ex);
    }

    @Async
    @Retry(name = "mail", fallbackMethod = "fallbackDigestEmail")
    public void sendDigestEmail(String to, java.util.List<java.util.Map<String, String>> items, java.util.Locale locale) {
        try {
            var mime = mailSender.createMimeMessage();
            var helper = new org.springframework.mail.javamail.MimeMessageHelper(mime, "UTF-8");
            helper.setFrom(String.format("%s <%s>", fromName, from));
            helper.setTo(to);
            helper.setSubject("Your upcoming games");
            String template = pickTemplate("templates/email/digest", locale == null ? java.util.Locale.getDefault() : locale);
            StringBuilder rows = new StringBuilder();
            for (var it : items) {
                rows.append("<li>")
                        .append(escapeHtml(it.getOrDefault("sport", ""))).append(" @ ")
                        .append(escapeHtml(it.getOrDefault("location", ""))).append(" — ")
                        .append(escapeHtml(it.getOrDefault("time", "")))
                        .append("</li>");
            }
            String html = loadTemplate(template)
                    .replace("{{appName}}", fromName)
                    .replace("{{items}}", rows.toString())
                    .replace("{{supportEmail}}", supportEmail == null ? "" : supportEmail);
            helper.setText(html, true);
            mailSender.send(mime);
        } catch (Exception e) {
            // Fallback to plain text
            org.springframework.mail.SimpleMailMessage msg = new org.springframework.mail.SimpleMailMessage();
            msg.setFrom(String.format("%s <%s>", fromName, from));
            msg.setTo(to);
            msg.setSubject("Your upcoming games");
            StringBuilder sb = new StringBuilder();
            for (var it : items) {
                sb.append("- ").append(it.getOrDefault("sport", "")).append(" @ ")
                        .append(it.getOrDefault("location", "")).append(" — ")
                        .append(it.getOrDefault("time", "")).append("\n");
            }
            msg.setText(sb.toString());
            mailSender.send(msg);
        }
        log.info("Sent digest email to {}", to);
    }

    @SuppressWarnings("unused")
    private void fallbackDigestEmail(String to, java.util.List<java.util.Map<String, String>> items, java.util.Locale locale, Throwable ex) {
        log.error("Failed to send digest email to {} after retries: {}", to, ex.getMessage(), ex);
    }

    private static String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
