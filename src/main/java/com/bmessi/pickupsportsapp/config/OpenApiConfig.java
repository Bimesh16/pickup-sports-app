package com.bmessi.pickupsportsapp.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Pickup Sports API",
                version = "v1",
                description = "Backend API for the Pickup Sports application",
                contact = @Contact(name = "Support", email = "support@example.com")
        ),
        servers = {
                @Server(url = "http://localhost:8080", description = "Local Dev")
        }
)
public class OpenApiConfig {

    @Bean
    public OpenAPI api(@Value("${app.version:1.0.0}") String version) {
        final String schemeName = "bearerAuth";
        return new OpenAPI()
                .info(new io.swagger.v3.oas.models.info.Info()
                        .title("Pickup Sports API")
                        .description("Backend for games, chat, presence, ratings, notifications.")
                        .version(version)
                        .license(new License().name("Apache-2.0")))
                .addSecurityItem(new SecurityRequirement().addList(schemeName))
                .components(new Components().addSecuritySchemes(schemeName,
                        new SecurityScheme()
                                .name(schemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
