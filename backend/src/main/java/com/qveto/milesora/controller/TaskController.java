package com.qveto.milesora.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.qveto.milesora.dto.CreateTaskRequest;
import com.qveto.milesora.dto.TaskResponse;
import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.Task;
import com.qveto.milesora.repository.AppUserRepository;
import com.qveto.milesora.service.TaskService;

@RestController
@RequestMapping("/api/projects/{projectId}/tasks")
public class TaskController {

    private final TaskService taskService;
    private final AppUserRepository appUserRepository;

    public TaskController(
            TaskService taskService,
            AppUserRepository appUserRepository) {
        this.taskService = taskService;
        this.appUserRepository = appUserRepository;
    }

    private Long getRequesterId(Authentication authentication) {
        AppUser user = appUserRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return user.getId();
    }

    private Task convertToTask(CreateTaskRequest request) {
        Task task = new Task();

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStartDate(request.getStartDate());
        task.setDueDate(request.getDueDate());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());

        if (request.getAssignedToId() != null) {
            AppUser assignedUser = appUserRepository
                    .findById(request.getAssignedToId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Assigned user not found"));

            task.setAssignedTo(assignedUser);
        }

        return task;
    }

    private TaskResponse convertToResponse(Task task) {
        TaskResponse response = new TaskResponse();

        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus());
        response.setPriority(task.getPriority());
        response.setStartDate(task.getStartDate());
        response.setDueDate(task.getDueDate());

        response.setProjectId(
                task.getProject() != null ? task.getProject().getId() : null);

        response.setCreatedById(
                task.getCreatedBy() != null ? task.getCreatedBy().getId() : null);

        response.setAssignedToId(
                task.getAssignedTo() != null ? task.getAssignedTo().getId() : null);

        response.setAssignedToName(
                task.getAssignedTo() != null ? task.getAssignedTo().getName() : null);

        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());

        return response;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable Long projectId,
            @RequestBody CreateTaskRequest request,
            Authentication authentication) {

        Long requesterId = getRequesterId(authentication);

        Task task = convertToTask(request);

        Task savedTask = taskService.createTask(
                projectId, task, requesterId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(convertToResponse(savedTask));
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getProjectTasks(
            @PathVariable Long projectId,
            Authentication authentication) {

        Long requesterId = getRequesterId(authentication);

        List<TaskResponse> tasks = taskService
                .getProjectTasks(projectId, requesterId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponse> getTaskById(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            Authentication authentication) {

        Long requesterId = getRequesterId(authentication);

        Task task = taskService.getTaskById(
                projectId, taskId, requesterId);

        return ResponseEntity.ok(convertToResponse(task));
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @RequestBody CreateTaskRequest request,
            Authentication authentication) {

        Long requesterId = getRequesterId(authentication);

        Task updatedTask = convertToTask(request);

        Task savedTask = taskService.updateTask(
                projectId, taskId, updatedTask, requesterId);

        return ResponseEntity.ok(convertToResponse(savedTask));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            Authentication authentication) {

        Long requesterId = getRequesterId(authentication);

        taskService.deleteTask(projectId, taskId, requesterId);

        return ResponseEntity.noContent().build();
    }
}