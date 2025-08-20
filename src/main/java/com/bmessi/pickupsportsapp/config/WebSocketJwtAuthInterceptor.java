package com.bmessi.pickupsportsapp.config;

import com.bmessi.pickupsportsapp.config.properties.JwtProperties;
import com.bmessi.pickupsportsapp.security.JwtTokenService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class WebSocketJwtAuthInterceptor implements ChannelInterceptor {

    private final JwtTokenService jwtTokenService;
    private final JwtProperties jwtProps;

    public WebSocketJwtAuthInterceptor(JwtTokenService jwtTokenService, JwtProperties jwtProps) {
        this.jwtTokenService = jwtTokenService;
        this.jwtProps = jwtProps;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor acc = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (acc == null || acc.getCommand() == null) return message;

        if (StompCommand.CONNECT.equals(acc.getCommand())) {
            authenticate(acc);
        } else if (StompCommand.SEND.equals(acc.getCommand()) || StompCommand.SUBSCRIBE.equals(acc.getCommand())) {
            if (acc.getUser() == null) throw new MessagingException("Unauthenticated WebSocket message");
        }
        return message;
    }

    private void authenticate(StompHeaderAccessor acc) {
        String headerName = defaultIfBlank(jwtProps.header(), "Authorization");
        String prefix     = defaultIfBlank(jwtProps.prefix(), "Bearer ");

        String raw = firstHeader(acc, headerName);
        if (raw == null && "Authorization".equalsIgnoreCase(headerName)) {
            // Graceful fallback for common alternates
            raw = firstHeader(acc, "authorization");
            if (raw == null) raw = firstHeader(acc, "X-Auth-Token");
        }
        if (raw == null || raw.trim().isEmpty()) {
            throw new MessagingException("Missing " + headerName + " header");
        }

        String token = stripPrefix(raw, prefix);
        Jws<Claims> jws = jwtTokenService.parse(token); // validates issuer/audience/exp per your service
        Claims claims = jws.getPayload();

        String username = claims.getSubject();
        if (username == null || username.trim().isEmpty()) {
            throw new MessagingException("JWT subject missing");
        }

        // roles may be array or comma-separated string; default USER
        Object rolesClaim = claims.get("roles");
        List<String> roles = new ArrayList<>();
        if (rolesClaim instanceof Collection) {
            for (Object o : (Collection<?>) rolesClaim) roles.add(String.valueOf(o));
        } else if (rolesClaim instanceof String) {
            for (String r : ((String) rolesClaim).split(",")) {
                String t = r.trim();
                if (!t.isEmpty()) roles.add(t);
            }
        }
        if (roles.isEmpty()) roles = Collections.singletonList("USER");

        var authorities = roles.stream()
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.toUpperCase()))
                .collect(Collectors.toSet());

        var auth = new UsernamePasswordAuthenticationToken(username, "N/A", authorities);
        acc.setUser(auth);
    }

    private static String firstHeader(StompHeaderAccessor acc, String name) {
        List<String> list = acc.getNativeHeader(name);
        return (list != null && !list.isEmpty()) ? list.get(0) : null;
    }

    private static String stripPrefix(String raw, String prefix) {
        String s = raw.trim();
        if (prefix != null && !prefix.isBlank()) {
            // case-insensitive startsWith
            if (s.length() >= prefix.length() && s.regionMatches(true, 0, prefix, 0, prefix.length())) {
                return s.substring(prefix.length()).trim();
            }
        }
        return s;
    }

    private static String defaultIfBlank(String val, String def) {
        return (val == null || val.isBlank()) ? def : val;
    }
}
