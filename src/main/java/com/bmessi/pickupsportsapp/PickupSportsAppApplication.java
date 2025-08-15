package com.bmessi.pickupsportsapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class PickupSportsAppApplication {
    public static void main(String[] args) {
        SpringApplication.run(PickupSportsAppApplication.class, args);
    }
}