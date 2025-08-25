package com.bmessi.pickupsportsapp.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

@Configuration
public class WebStaticResourceConfig implements WebMvcConfigurer {

    @Value("${app.media.base-path:./media}")
    private String basePath;

    @Value("${app.media.base-url:/media}")
    private String baseUrl;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = Paths.get(basePath).toAbsolutePath().normalize().toUri().toString();
        String pattern = baseUrl.endsWith("/") ? baseUrl + "**" : baseUrl + "/**";

        registry.addResourceHandler(pattern)
                .addResourceLocations(location)
                .setCacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic())
                .resourceChain(true)
                .addResolver(new PathResourceResolver());
    }
}