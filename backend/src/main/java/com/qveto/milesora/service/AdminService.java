
package com.qveto.milesora.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.qveto.milesora.dto.AdminUserResponse;
import com.qveto.milesora.dto.CreateUserRequest;
import com.qveto.milesora.dto.UpdateUserRequest;
import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.Role;
import com.qveto.milesora.repository.AppUserRepository;

@Service
@Transactional
public class AdminService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // 1. Get all users
    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // 2. Get user by ID
    @Transactional(readOnly = true)
    public AdminUserResponse getUserById(Long id) {
        AppUser user = findUserById(id);
        return convertToResponse(user);
    }

    // 3. Create a new user
    public AdminUserResponse createUser(CreateUserRequest request) {

        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username already exists");
        }

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already exists");
        }

        Role role = request.getRole() != null
                ? request.getRole()
                : Role.EMPLOYEE;

        AppUser user = new AppUser(
                username,
                passwordEncoder.encode(request.getPassword()),
                role);

        user.setName(request.getName().trim());
        user.setFirstName(request.getFirstName());
        user.setMiddleName(request.getMiddleName());
        user.setLastName(request.getLastName());
        user.setEmail(email);
        user.setPhone(request.getPhone());
        user.setDob(request.getDob());
        user.setTitle(request.getTitle());
        user.setDepartment(request.getDepartment());
        user.setEnabled(true);

        AppUser savedUser = userRepository.save(user);

        return convertToResponse(savedUser);
    }

    // 4. Update user details and role
    public AdminUserResponse updateUser(
            Long id,
            UpdateUserRequest request,
            String adminUsername) {

        AppUser user = findUserById(id);

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailAndIdNot(email, id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already belongs to another user");
        }

        Role newRole = request.getRole() != null
                ? request.getRole()
                : user.getRole();

        if (user.getUsername().equals(adminUsername)
                && newRole != Role.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot remove your own Admin role");
        }

        if (user.getRole() == Role.ADMIN
                && newRole != Role.ADMIN
                && user.isEnabled()
                && userRepository.countByRoleAndEnabled(Role.ADMIN, true) <= 1) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot demote the last active Admin account");
        }

        user.setName(request.getName().trim());
        user.setFirstName(request.getFirstName());
        user.setMiddleName(request.getMiddleName());
        user.setLastName(request.getLastName());
        user.setEmail(email);
        user.setPhone(request.getPhone());
        user.setDob(request.getDob());
        user.setTitle(request.getTitle());
        user.setDepartment(request.getDepartment());
        user.setRole(newRole);

        return convertToResponse(userRepository.save(user));
    }

    // 5. Activate or deactivate an account
    public AdminUserResponse updateAccountStatus(
            Long id,
            boolean enabled,
            String adminUsername) {

        AppUser user = findUserById(id);

        if (user.getUsername().equals(adminUsername) && !enabled) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot deactivate your own account");
        }
        if (user.getRole() == Role.ADMIN
                && !enabled
                && userRepository.countByRoleAndEnabled(Role.ADMIN, true) <= 1) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot deactivate the last active Admin account");
        }

        user.setEnabled(enabled);

        return convertToResponse(userRepository.save(user));
    }

    // 6. Delete a user
    public void deleteUser(Long id, String adminUsername) {

        AppUser user = findUserById(id);

        if (user.getUsername().equals(adminUsername)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot delete your own account");
        }

        if (user.getRole() == Role.ADMIN
        		&& user.isEnabled()
                && userRepository.countByRoleAndEnabled(Role.ADMIN, true) <= 1) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete the last Admin account");
        }

        userRepository.delete(user);
    }

    // 7. Find user or return 404
    private AppUser findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"));
    }

    // 8. Convert entity into safe response DTO
    private AdminUserResponse convertToResponse(AppUser user) {

        return new AdminUserResponse(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getFirstName(),
                user.getMiddleName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getDob(),
                user.getTitle(),
                user.getDepartment(),
                user.getRole(),
                user.isEnabled());
    }
}