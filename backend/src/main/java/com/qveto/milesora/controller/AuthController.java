package com.qveto.milesora.controller;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.Role;
import com.qveto.milesora.repository.AppUserRepository;
import com.qveto.milesora.service.CustomUserDetailsService;
import com.qveto.milesora.service.JwtService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public AuthController(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            CustomUserDetailsService userDetailsService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> data) {

        String email = value(data, "email").toLowerCase(java.util.Locale.ROOT);
        String password = data.getOrDefault("password", "");

        if (email.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Email and password are required.")
            );
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtService.generateToken(userDetails);

            AppUser user = userRepository.findByUsername(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail() == null ? "" : user.getEmail(),
                    "name", user.getName(),
                    "role", user.getRole().name()
                )
            ));

        } catch (BadCredentialsException | UsernameNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("message", "Invalid email or password.")
            );
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof UserDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("message", "Authentication is required.")
            );
        }

        String username = authentication.getName();

        AppUser user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "email", user.getEmail() == null ? "" : user.getEmail(),
            "name", user.getName(),
            "role", user.getRole().name()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> data) {

        String email = value(data, "email");
        String password = value(data, "password");
        String firstName = value(data, "firstName");
        String lastName = value(data, "lastName");
        String name = value(data, "name");

        if (email.isBlank() || password.isBlank()
                || firstName.isBlank() || lastName.isBlank()
                || name.isBlank()) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Name, first name, last name, email and password are required.")
            );
        }

        if (password.length() < 8) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Password must contain at least 8 characters.")
            );
        }

        email = email.toLowerCase(java.util.Locale.ROOT);

        if (userRepository.existsByUsername(email)
                || userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("message", "An account with this email already exists.")
            );
        }

        try {
            AppUser user = new AppUser();
            user.setUsername(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(Role.EMPLOYEE);

            user.setName(name);
            user.setFirstName(firstName);
            user.setMiddleName(value(data, "middleName"));
            user.setLastName(lastName);
            user.setEmail(email);
            user.setPhone(value(data, "phone"));
            user.setTitle(value(data, "title"));
            user.setDepartment(value(data, "department"));

            String dob = value(data, "dob");
            if (!dob.isBlank()) {
                user.setDob(LocalDate.parse(dob));
            }

            userRepository.save(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                    "message", "Account registered successfully.",
                    "username", user.getUsername(),
                    "role", user.getRole().name()
                )
            );

        } catch (java.time.format.DateTimeParseException ex) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Date of birth must use YYYY-MM-DD format.")
            );
        }
    }

    private String value(Map<String, String> data, String key) {
        String result = data.get(key);
        return result == null ? "" : result.trim();
    }
}