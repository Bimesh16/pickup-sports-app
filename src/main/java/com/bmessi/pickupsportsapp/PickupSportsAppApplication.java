package com.bmessi.pickupsportsapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication(exclude = {
    org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration.class,
    org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration.class
})
@EnableJpaAuditing
@EnableMethodSecurity // Enable @PreAuthorize on controller methods
@EnableAsync
@ConfigurationPropertiesScan
@ComponentScan(
        excludeFilters = {
                @ComponentScan.Filter(
                        type = FilterType.REGEX,
                        pattern = "com\\.bmessi\\.pickupsportsapp\\.config\\.SecurityHeadersFilter"
                )
        }
)
public class PickupSportsAppApplication {
    public static void main(String[] args) {
        SpringApplication.run(PickupSportsAppApplication.class, args);
    }
}