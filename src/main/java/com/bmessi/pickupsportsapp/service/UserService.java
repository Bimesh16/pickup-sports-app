package com.bmessi.pickupsportsapp.service;

import com.bmessi.pickupsportsapp.dto.CreateUserRequest;
import com.bmessi.pickupsportsapp.dto.UserDTO;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.exception.UsernameTakenException;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApiMapper mapper;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, ApiMapper mapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mapper = mapper;
    }

    public UserDTO register(CreateUserRequest request) {
        if (userRepository.findByUsername(request.username()) != null) {
            throw new UsernameTakenException("Username '" + request.username() + "' is already taken");
        }
        User user = new User();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPreferredSport(request.preferredSport());
        user.setLocation(request.location());
        user = userRepository.save(user);
        return mapper.toUserDTO(user);
    }
}