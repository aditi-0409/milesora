package com.qveto.milesora.config;

import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;

import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.Role;
import com.qveto.milesora.repository.AppUserRepository;

@Configuration
public class DataInitializer {

    private static final Logger logger =
            LoggerFactory.getLogger(DataInitializer.class);

    @Value("${app.bootstrap.admin.username:}")
    private String adminUsername;

    @Value("${app.bootstrap.admin.email:}")
    private String adminEmail;

    @Value("${app.bootstrap.admin.password:}")
    private String adminPassword;

    @Bean
    CommandLineRunner initializeAdmin(
            AppUserRepository repository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            // Skip automatic account creation if credentials are not configured.
            if (!StringUtils.hasText(adminUsername)
                    || !StringUtils.hasText(adminEmail)
                    || !StringUtils.hasText(adminPassword)) {

                logger.info(
                        "Initial administrator credentials are not configured. "
                        + "Skipping administrator initialization.");

                return;
            }

            String username = adminUsername.trim();
            String email = adminEmail.trim().toLowerCase(Locale.ROOT);

            if (repository.existsByUsername(username)) {
                logger.info(
                        "Initial administrator username already exists. "
                        + "Skipping initialization.");

                return;
            }

            if (repository.existsByEmail(email)) {
                logger.warn(
                        "Initial administrator email already exists. "
                        + "Skipping initialization.");

                return;
            }

            AppUser admin = new AppUser();

            admin.setUsername(username);
            admin.setEmail(email);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setName("System Administrator");
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            admin.setRole(Role.ADMIN);
            admin.setEnabled(true);

            repository.save(admin);

            logger.info("Initial administrator account created successfully.");
        };
    }
}