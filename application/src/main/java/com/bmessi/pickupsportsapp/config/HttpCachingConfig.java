package com.bmessi.pickupsportsapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.ShallowEtagHeaderFilter;

import java.util.List;

@Configuration
public class HttpCachingConfig {

    @Value("${app.media.base-url:/media}")
    private String baseUrl;

    @Bean
    public FilterRegistrationBean<ShallowEtagHeaderFilter> shallowEtagFilter() {
        var filter = new ShallowEtagHeaderFilter();
        var registration = new FilterRegistrationBean<>(filter);
        // Apply only to media to avoid overhead on all endpoints
        String pattern = baseUrl.endsWith("/") ? baseUrl + "*" : baseUrl + "/*";
        registration.setUrlPatterns(List.of(pattern));
        registration.setName("shallowEtagHeaderFilter");
        registration.setOrder(Integer.MIN_VALUE + 100); // run early
        return registration;
    }
}