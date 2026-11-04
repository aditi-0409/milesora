package com.qveto.milesora.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qveto.milesora.entity.AppUser;

import com.qveto.milesora.entity.Role;

public interface AppUserRepository
        extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByUsername(String username);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, Long id);
    boolean existsByUsernameAndIdNot(String username, Long id);
    long countByRole(com.qveto.milesora.entity.Role role);
    long countByRoleAndEnabled(Role role, boolean enabled);
}