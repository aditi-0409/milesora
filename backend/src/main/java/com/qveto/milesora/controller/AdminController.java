package com.qveto.milesora.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.qveto.milesora.dto.AdminUserResponse;
import com.qveto.milesora.dto.CreateUserRequest;
import com.qveto.milesora.dto.UpdateUserRequest;
import com.qveto.milesora.service.AdminService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // 1. Get all users
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // 2. Get user by ID
    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserResponse> getUserById(
            @PathVariable Long id) {

        return ResponseEntity.ok(adminService.getUserById(id));
    }

    // 3. Create a user
    @PostMapping("/users")
    public ResponseEntity<AdminUserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request) {

        AdminUserResponse response = adminService.createUser(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 4. Update user details and role
    @PutMapping("/users/{id}")
    public ResponseEntity<AdminUserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request,
            Authentication authentication) {

        AdminUserResponse response = adminService.updateUser(
                id, request, authentication.getName());

        return ResponseEntity.ok(response);
    }

    // 5. Activate or deactivate an account
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<AdminUserResponse> updateAccountStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled,
            Authentication authentication) {

        AdminUserResponse response = adminService.updateAccountStatus(
                id, enabled, authentication.getName());

        return ResponseEntity.ok(response);
    }

    // 6. Delete a user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            Authentication authentication) {

        adminService.deleteUser(id, authentication.getName());

        return ResponseEntity.noContent().build();
    }
}
