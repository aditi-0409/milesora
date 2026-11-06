package com.qveto.milesora.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.qveto.milesora.dto.AddDependencyRequest;
import com.qveto.milesora.dto.TaskDependencyResponse;
import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.TaskDependency;
import com.qveto.milesora.repository.AppUserRepository;
import com.qveto.milesora.service.TaskDependencyService;

@RestController
@RequestMapping("/api/tasks/{taskId}/dependencies")
public class TaskDependencyController {

    private final TaskDependencyService dependencyService;
    private final AppUserRepository userRepository;

    public TaskDependencyController(
            TaskDependencyService dependencyService,
            AppUserRepository userRepository) {

        this.dependencyService = dependencyService;
        this.userRepository = userRepository;
    }

    // Add dependency
    @PostMapping
    public ResponseEntity<TaskDependencyResponse> addDependency(
            @PathVariable Long taskId,
            @RequestBody AddDependencyRequest request,
            Authentication authentication) {

        Long requesterId = getRequesterId(authentication);

        TaskDependency dependency =
                dependencyService.addDependency(
                        taskId,
                        request.getDependsOnTaskId(),
                        requesterId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(dependency));
    }

    // Get dependencies
    @GetMapping
    public ResponseEntity<List<TaskDependencyResponse>> getDependencies(
            @PathVariable Long taskId,
            Authentication authentication) {

        Long requesterId = getRequesterId(authentication);

        List<TaskDependencyResponse> responses =
                dependencyService
                        .getDependencies(taskId, requesterId)
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(responses);
    }

    // Remove dependency
    @DeleteMapping("/{dependsOnTaskId}")
    public ResponseEntity<Void> removeDependency(
            @PathVariable Long taskId,
            @PathVariable Long dependsOnTaskId,
            Authentication authentication) {

        Long requesterId = getRequesterId(authentication);

        dependencyService.removeDependency(
                taskId, dependsOnTaskId, requesterId);

        return ResponseEntity.noContent().build();
    }

    private Long getRequesterId(Authentication authentication) {

        AppUser user = userRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Authenticated user not found"));

        return user.getId();
    }

    private TaskDependencyResponse toResponse(
            TaskDependency dependency) {

        TaskDependencyResponse response =
                new TaskDependencyResponse();

        response.setId(dependency.getId());
        response.setTaskId(dependency.getTask().getId());
        response.setDependsOnTaskId(
                dependency.getDependsOnTask().getId());
        response.setCreatedAt(dependency.getCreatedAt());

        return response;
    }
}