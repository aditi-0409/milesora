package com.qveto.milesora.controller;

import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.qveto.milesora.dto.LoginRequest;
import com.qveto.milesora.dto.RegisterRequest;
import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.Role;
import com.qveto.milesora.repository.AppUserRepository;
import com.qveto.milesora.service.JwtService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        String password = request.getPassword();

        try {
            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    email, password));

            UserDetails userDetails =
                    (UserDetails) authentication.getPrincipal();

            String token = jwtService.generateToken(userDetails);

            AppUser user = userRepository.findByUsername(email)
                    .orElseThrow(() ->
                            new UsernameNotFoundException("User not found"));

            return ResponseEntity.ok(
                    Map.of(
                            "token", token,
                            "user", Map.of(
                                    "id", user.getId(),
                                    "username", user.getUsername(),
                                    "email", user.getEmail() == null
                                            ? "" : user.getEmail(),
                                    "name", user.getName() == null
                                            ? "" : user.getName(),
                                    "role", user.getRole().name()
                            )
                    )
            );

        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("message", "Invalid email or password.")
            );
        }
    }

    // CURRENT AUTHENTICATED USER
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof UserDetails)) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("message", "Authentication is required.")
            );
        }

        String username = authentication.getName();

        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        return ResponseEntity.ok(
                Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail() == null
                                ? "" : user.getEmail(),
                        "name", user.getName() == null
                                ? "" : user.getName(),
                        "role", user.getRole().name()
                )
        );
    }

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByUsername(email)
                || userRepository.existsByEmail(email)) {

            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    Map.of(
                            "message",
                            "An account with this email already exists."
                    )
            );
        }

        AppUser user = new AppUser();

        user.setUsername(email);
        user.setEmail(email);

        // Always encode passwords before database storage.
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Public registration must never assign privileged roles.
        user.setRole(Role.EMPLOYEE);

        user.setName(request.getName().trim());
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());

        user.setMiddleName(normalizeOptional(request.getMiddleName()));
        user.setPhone(normalizeOptional(request.getPhone()));
        user.setTitle(normalizeOptional(request.getTitle()));
        user.setDepartment(normalizeOptional(request.getDepartment()));

        user.setDob(request.getDob());

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "message", "Account registered successfully.",
                        "username", user.getUsername(),
                        "role", user.getRole().name()
                )
        );
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}