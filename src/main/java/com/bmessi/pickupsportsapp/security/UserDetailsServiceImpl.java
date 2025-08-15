package com.bmessi.pickupsportsapp.security;

import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(UserDetailsServiceImpl.class);

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User u = userRepository.findByUsername(username);
        if (u == null) {
            log.debug("User not found: {}", username);
            throw new UsernameNotFoundException("User not found: " + username);
        }

        // Simple default role mapping; extend if you store roles in DB
        Collection<? extends GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));

        return org.springframework.security.core.userdetails.User.withUsername(u.getUsername())
                .password(u.getPassword())
                .authorities(authorities)
                .accountExpired(false)
                .credentialsExpired(false)
                .accountLocked(false)
                .disabled(false)
                .build();
    }
}