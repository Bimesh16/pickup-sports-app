package com.bmessi.pickupsportsapp.config;

import com.bmessi.pickupsportsapp.web.RequestCorrelationFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RequestCorrelationFilterConfig {

    @Bean
    public FilterRegistrationBean<RequestCorrelationFilter> requestCorrelationFilter() {
        FilterRegistrationBean<RequestCorrelationFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new RequestCorrelationFilter());
        registration.addUrlPatterns("/*");
        registration.setName("requestCorrelationFilter");
        registration.setOrder(Integer.MIN_VALUE);
        return registration;
    }
}
