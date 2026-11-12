package com.qveto.milesora.report;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.core.Authentication;

import com.qveto.milesora.repository.AppUserRepository;

@RestController
@RequestMapping("/api/projects/{projectId}/reports")
public class ProjectReportController {

    private final ProjectReportService reportService;
    private final AppUserRepository userRepository;

    public ProjectReportController(
            ProjectReportService reportService,
            AppUserRepository userRepository) {

        this.reportService = reportService;
        this.userRepository = userRepository;
    }

    @GetMapping("/overview")
    public ProjectOverviewReport getProjectOverview(
            @PathVariable Long projectId,
            Authentication authentication) {

        Long requesterId = userRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"))
                .getId();

        return reportService.getProjectOverview(
                projectId, requesterId);
    }
}