package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.CreateUserRequest;
import com.bmessi.pickupsportsapp.dto.UserDTO;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.Sport;
import com.bmessi.pickupsportsapp.exception.UsernameTakenException;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.repository.SportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApiMapper mapper;
    private final EmailService emailService;
    private final VerificationService verificationService;
    private final com.bmessi.pickupsportsapp.config.properties.AuthFlowProperties authProps;
    private final SportRepository sportRepository;

    @Transactional
    @CacheEvict(cacheNames = "search-filters", allEntries = true)
    public UserDTO register(CreateUserRequest request) {
        if (userRepository.findByUsername(request.username()) != null) {
            throw new UsernameTakenException("Username '" + request.username() + "' is already taken");
        }
        User user = new User();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        
        // Convert preferredSport string to Sport entity
        if (request.preferredSport() != null && !request.preferredSport().trim().isEmpty()) {
            Sport sport = sportRepository.findByNameIgnoreCase(request.preferredSport().toLowerCase());
            user.setPreferredSport(sport);
        }
        
        user.setLocation(request.location());
        user = userRepository.save(user);

        // Send welcome email asynchronously
        emailService.sendWelcomeEmail(user);

        // Generate email verification token and send link
        String token = verificationService.createTokenFor(user.getUsername());
        String base = authProps.getAppUrl();
        if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
        String link = base + "/auth/verify?token=" + token;
        emailService.sendVerificationEmail(user.getUsername(), link);

        return mapper.toUserDTO(user);
    }
}
