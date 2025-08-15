package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.dto.RegisterUserRequest;
import com.bmessi.pickupsportsapp.dto.UserDTO;
import com.bmessi.pickupsportsapp.entity.User;
import com.bmessi.pickupsportsapp.mapper.ApiMapper;
import com.bmessi.pickupsportsapp.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.security.Principal;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApiMapper mapper;

    // Registration with validation and secure password hashing
    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@Valid @RequestBody RegisterUserRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
        }
        User user = new User();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPreferredSport(request.preferredSport());
        user.setLocation(request.location());

        User saved = userRepository.save(user);

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create("/users/" + saved.getId()));
        return new ResponseEntity<>(mapper.toUserDTO(saved), headers, HttpStatus.CREATED);
    }

    // Current user info (safe DTO)
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getCurrentUser(Principal principal) {
        User user = userRepository.findByUsername(principal.getName());
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(mapper.toUserDTO(user));
    }
}