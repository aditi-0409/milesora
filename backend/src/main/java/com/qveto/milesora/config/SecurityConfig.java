
package com.qveto.milesora.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .cors(cors -> {})
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/auth/register")
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/", "/error", "/css/**", "/js/**", "/api/test"
                ).permitAll()

                .requestMatchers("/api/auth/register").permitAll()

                .requestMatchers("/admin/**")
                    .hasRole("ADMIN")

                .requestMatchers("/manager/**")
                    .hasAnyRole("ADMIN", "PROJECT_MANAGER")

                .requestMatchers("/employee/**")
                    .hasAnyRole(
                        "ADMIN", "PROJECT_MANAGER", "EMPLOYEE"
                    )

                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .defaultSuccessUrl("/", false)
                .permitAll()
            )
            .logout(logout -> logout
                .logoutSuccessUrl("/login?logout")
                .permitAll()
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

