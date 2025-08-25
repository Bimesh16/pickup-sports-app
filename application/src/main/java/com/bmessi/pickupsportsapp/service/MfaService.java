package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class MfaService {

    private final UserRepository users;

    private static final SecureRandom RNG = new SecureRandom();
    private static final String BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    @Transactional
    public String enroll(String username) {
        User u = users.findOptionalByUsername(username).orElseThrow(() -> new IllegalArgumentException("user not found"));
        if (u.getMfaSecret() == null || u.getMfaSecret().isBlank()) {
            u.setMfaSecret(randomBase32(20));
            users.save(u);
        }
        return u.getMfaSecret();
    }

    @Transactional
    public void enable(String username) {
        User u = users.findOptionalByUsername(username).orElseThrow(() -> new IllegalArgumentException("user not found"));
        u.setMfaEnabled(true);
        users.save(u);
    }

    @Transactional
    public void disable(String username) {
        User u = users.findOptionalByUsername(username).orElseThrow(() -> new IllegalArgumentException("user not found"));
        u.setMfaEnabled(false);
        users.save(u);
    }

    @Transactional(readOnly = true)
    public boolean verify(String username, String code) {
        User u = users.findOptionalByUsername(username).orElseThrow(() -> new IllegalArgumentException("user not found"));
        if (u.getMfaSecret() == null) return false;
        return verifyCode(u.getMfaSecret(), code);
    }

    @Transactional(readOnly = true)
    public boolean isEnabled(String username) {
        User u = users.findOptionalByUsername(username).orElseThrow(() -> new IllegalArgumentException("user not found"));
        return u.isMfaEnabled();
    }

    public String provisioningUri(String issuer, String username) {
        User u = users.findOptionalByUsername(username).orElseThrow(() -> new IllegalArgumentException("user not found"));
        String label = urlEncode(issuer) + ":" + urlEncode(username);
        String params = "secret=" + u.getMfaSecret()
                + "&issuer=" + urlEncode(issuer)
                + "&algorithm=SHA1&digits=6&period=30";
        return "otpauth://totp/" + label + "?" + params;
    }

    // TOTP based on RFC 6238 (HMAC-SHA1, 30-second step, 6 digits)
    private static boolean verifyCode(String base32Secret, String code) {
        if (code == null || code.length() != 6) return false;
        long timeStep = Instant.now().getEpochSecond() / 30;
        for (long offset = -1; offset <= 1; offset++) {
            String expected = totp(base32Secret, timeStep + offset);
            if (expected.equals(code)) return true;
        }
        return false;
    }

    private static String totp(String base32Secret, long counter) {
        byte[] key = base32Decode(base32Secret);
        byte[] data = ByteBuffer.allocate(8).putLong(counter).array();
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hmac = mac.doFinal(data);
            int offset = hmac[hmac.length - 1] & 0x0F;
            int binary = ((hmac[offset] & 0x7f) << 24)
                    | ((hmac[offset + 1] & 0xff) << 16)
                    | ((hmac[offset + 2] & 0xff) << 8)
                    | (hmac[offset + 3] & 0xff);
            int otp = binary % 1_000_000;
            return String.format("%06d", otp);
        } catch (Exception e) {
            return "";
        }
    }

    private static String randomBase32(int bytes) {
        byte[] buf = new byte[bytes];
        RNG.nextBytes(buf);
        return base32Encode(buf);
    }

    private static String base32Encode(byte[] data) {
        StringBuilder out = new StringBuilder((data.length * 8 + 4) / 5);
        int buffer = 0, bitsLeft = 0;
        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xFF);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                int idx = (buffer >> (bitsLeft - 5)) & 0x1F;
                out.append(BASE32_ALPHABET.charAt(idx));
                bitsLeft -= 5;
            }
        }
        if (bitsLeft > 0) {
            int idx = (buffer << (5 - bitsLeft)) & 0x1F;
            out.append(BASE32_ALPHABET.charAt(idx));
        }
        return out.toString();
    }

    private static byte[] base32Decode(String s) {
        String input = s == null ? "" : s.replace("=", "").toUpperCase();
        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        int buffer = 0, bitsLeft = 0;
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            int val = BASE32_ALPHABET.indexOf(c);
            if (val < 0) continue;
            buffer = (buffer << 5) | val;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                baos.write((buffer >> (bitsLeft - 8)) & 0xFF);
                bitsLeft -= 8;
            }
        }
        return baos.toByteArray();
    }

    private static String urlEncode(String s) {
        try {
            return java.net.URLEncoder.encode(s, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            return s;
        }
    }
}
