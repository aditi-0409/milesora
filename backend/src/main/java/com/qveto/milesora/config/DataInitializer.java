package com.qveto.milesora.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.Role;
import com.qveto.milesora.repository.AppUserRepository;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeUsers(
            AppUserRepository repository,
            PasswordEncoder passwordEncoder) {

        return args -> {
            createUser(repository, passwordEncoder,
                "admin", "Admin@123", Role.ADMIN);

            createUser(repository, passwordEncoder,
                "manager", "Manager@123", Role.PROJECT_MANAGER);

            createUser(repository, passwordEncoder,
                "employee", "Employee@123", Role.EMPLOYEE);
        };
    }

    private void createUser(
            AppUserRepository repository,
            PasswordEncoder passwordEncoder,
            String username,
            String rawPassword,
            Role role) {

        if (!repository.existsByUsername(username)) {
            AppUser user = new AppUser(
                username,
                passwordEncoder.encode(rawPassword),
                role
            );

            repository.save(user);
        }
    }
}

