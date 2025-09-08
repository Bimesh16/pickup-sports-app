package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.CreateUserRequest;
import com.bmessi.pickupsportsapp.dto.UserDTO;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.entity.Sport;
import com.bmessi.pickupsportsapp.exception.UsernameTakenException;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.repository.SportRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApiMapper mapper;
    private final Optional<EmailService> emailService;
    private final Optional<VerificationService> verificationService;
    private final com.bmessi.pickupsportsapp.config.properties.AuthFlowProperties authProps;
    private final SportRepository sportRepository;

    public UserService(UserRepository userRepository, 
                      PasswordEncoder passwordEncoder,
                      ApiMapper mapper,
                      @Autowired(required = false) EmailService emailService,
                      @Autowired(required = false) VerificationService verificationService,
                      com.bmessi.pickupsportsapp.config.properties.AuthFlowProperties authProps,
                      SportRepository sportRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mapper = mapper;
        this.emailService = Optional.ofNullable(emailService);
        this.verificationService = Optional.ofNullable(verificationService);
        this.authProps = authProps;
        this.sportRepository = sportRepository;
    }

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

        // Send welcome email asynchronously (if email service is available)
        if (emailService.isPresent()) {
            emailService.get().sendWelcomeEmail(user);
        }

        // Generate email verification token and send link (if verification service is available)
        if (verificationService.isPresent() && emailService.isPresent()) {
            String token = verificationService.get().createTokenFor(user.getUsername());
            String base = authProps.getAppUrl();
            if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
            String link = base + "/auth/verify?token=" + token;
            emailService.get().sendVerificationEmail(user.getUsername(), link);
        }

        return mapper.toUserDTO(user);
    }
}
