package com.qveto.milesora.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.qveto.milesora.dto.DashboardResponse;
import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.repository.AppUserRepository;
import com.qveto.milesora.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AppUserRepository userRepository;

    public DashboardController(
            DashboardService dashboardService,
            AppUserRepository userRepository) {

        this.dashboardService = dashboardService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(
            Authentication authentication) {

        AppUser user = userRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"));

        DashboardResponse response =
                dashboardService.getDashboard(user.getId());

        return ResponseEntity.ok(response);
    }
}