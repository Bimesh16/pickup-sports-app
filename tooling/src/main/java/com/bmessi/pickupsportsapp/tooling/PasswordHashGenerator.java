package com.bmessi.pickupsportsapp.tooling;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        if (args.length < 1) {
            System.err.println("Usage: PasswordHashGenerator <plaintext-password>");
            System.exit(1);
        }
        String plaintext = args[0];
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hashed = encoder.encode(plaintext);
        System.out.println(hashed);
    }
}
