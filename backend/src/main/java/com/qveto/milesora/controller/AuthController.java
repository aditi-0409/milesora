
package com.qveto.milesora.controller;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.Role;
import com.qveto.milesora.repository.AppUserRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody Map<String, String> data) {

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
                Map.of("message",
                    "An account with this email already exists.")
            );
        }

        try {
            AppUser user = new AppUser();
            user.setUsername(email);
            user.setPassword(passwordEncoder.encode(password));

            // Never trust a role supplied by public registration.
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

