package com.bmessi.pickupsportsapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class TimeConfig {

    @Bean
    public Clock clock() {
        // Use a single UTC clock to enable deterministic time in services and easier testing
        return Clock.systemUTC();
    }
}
