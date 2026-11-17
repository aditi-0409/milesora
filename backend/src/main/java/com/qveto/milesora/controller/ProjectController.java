package com.qveto.milesora.controller;

import java.util.List;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.server.ResponseStatusException;

import com.qveto.milesora.dto.CreateProjectRequest;
import com.qveto.milesora.dto.ProjectResponse;
import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.Project;
import com.qveto.milesora.repository.AppUserRepository;
import com.qveto.milesora.service.ProjectService;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final AppUserRepository userRepository;

    public ProjectController(
            ProjectService projectService,
            AppUserRepository userRepository) {

        this.projectService = projectService;
        this.userRepository = userRepository;
    }

    // Create project
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
    		@Valid @RequestBody CreateProjectRequest request,
            Authentication authentication) {

        Long userId = getCurrentUserId(authentication);

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setStatus(request.getStatus());

        Project savedProject =
                projectService.createProject(project, userId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(savedProject));
    }

    // Get all projects
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects(
            Authentication authentication) {

        Long userId = getCurrentUserId(authentication);

        List<ProjectResponse> projects =
                projectService.getAllProjects(userId)
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(projects);
    }

    // Get project by ID
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(
            @PathVariable Long id,
            Authentication authentication) {

        Long userId = getCurrentUserId(authentication);

        Project project =
                projectService.getProjectById(id, userId);

        return ResponseEntity.ok(toResponse(project));
    }

    // Update project
    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody CreateProjectRequest request,
            Authentication authentication) {

        Long userId = getCurrentUserId(authentication);

        Project updatedProject = new Project();
        updatedProject.setName(request.getName());
        updatedProject.setDescription(request.getDescription());
        updatedProject.setStartDate(request.getStartDate());
        updatedProject.setEndDate(request.getEndDate());
        updatedProject.setStatus(request.getStatus());

        Project savedProject =
                projectService.updateProject(
                        id, updatedProject, userId);

        return ResponseEntity.ok(toResponse(savedProject));
    }

    // Delete project
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            Authentication authentication) {

        Long userId = getCurrentUserId(authentication);

        projectService.deleteProject(id, userId);

        return ResponseEntity.noContent().build();
    }

    // Identify authenticated user
    private Long getCurrentUserId(Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required");
        }

        AppUser user = userRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "User not found"));

        return user.getId();
    }

    // Convert entity to response DTO
    private ProjectResponse toResponse(Project project) {

        ProjectResponse response = new ProjectResponse();

        response.setId(project.getId());
        response.setName(project.getName());
        response.setDescription(project.getDescription());
        response.setStartDate(project.getStartDate());
        response.setEndDate(project.getEndDate());
        response.setStatus(project.getStatus());

        response.setCreatedById(project.getCreatedBy().getId());
        response.setCreatedByName(project.getCreatedBy().getName());

        response.setCreatedAt(project.getCreatedAt());
        response.setUpdatedAt(project.getUpdatedAt());

        return response;
    }
}