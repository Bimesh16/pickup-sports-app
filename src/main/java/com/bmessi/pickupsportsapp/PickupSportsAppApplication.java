package com.bmessi.pickupsportsapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableJpaAuditing
@EnableMethodSecurity // Enable @PreAuthorize on controller methods
public class PickupSportsAppApplication {
    public static void main(String[] args) {
        SpringApplication.run(PickupSportsAppApplication.class, args);
    }
}