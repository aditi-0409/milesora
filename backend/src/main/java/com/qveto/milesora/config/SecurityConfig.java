package com.qveto.milesora.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .cors(Customizer.withDefaults())

            // This API uses Bearer tokens, not cookie-based authentication.
            .csrf(csrf -> csrf.disable())

            // Do not create HTTP sessions for API authentication.
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                // Allow browser CORS preflight requests.
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public endpoints.
                .requestMatchers(
                    "/", "/error", "/css/**", "/js/**", "/api/test"
                ).permitAll()

                .requestMatchers(
                    "/api/auth/login",
                    "/api/auth/register"
                ).permitAll()

                // Role-specific endpoints.
                .requestMatchers("/admin/**")
                    .hasRole("ADMIN")

                .requestMatchers("/manager/**")
                    .hasAnyRole("ADMIN", "PROJECT_MANAGER")

                .requestMatchers("/employee/**")
                    .hasAnyRole(
                        "ADMIN", "PROJECT_MANAGER", "EMPLOYEE"
                    )

                // All other endpoints require authentication.
                .anyRequest().authenticated()
            )

            // Disable browser form login and HTTP Basic authentication.
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            // Validate JWTs before the standard username/password filter.
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}

