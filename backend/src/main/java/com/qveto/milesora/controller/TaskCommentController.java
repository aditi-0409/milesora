package com.qveto.milesora.controller;

import java.util.List;

import jakarta.validation.Valid;

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
import org.springframework.web.server.ResponseStatusException;

import com.qveto.milesora.dto.TaskCommentRequest;
import com.qveto.milesora.dto.TaskCommentResponse;
import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.TaskComment;
import com.qveto.milesora.repository.AppUserRepository;
import com.qveto.milesora.service.TaskCommentService;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
public class TaskCommentController {

    private final TaskCommentService commentService;
    private final AppUserRepository userRepository;

    public TaskCommentController(
            TaskCommentService commentService,
            AppUserRepository userRepository) {

        this.commentService = commentService;
        this.userRepository = userRepository;
    }

    // Add a comment
    @PostMapping
    public ResponseEntity<TaskCommentResponse> addComment(
            @PathVariable Long taskId,
            @Valid @RequestBody TaskCommentRequest request,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        TaskComment comment = commentService.addComment(
                taskId, request.getContent(), userId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(comment));
    }

    // Get all comments
    @GetMapping
    public ResponseEntity<List<TaskCommentResponse>> getComments(
            @PathVariable Long taskId,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        List<TaskCommentResponse> responses =
                commentService.getComments(taskId, userId)
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(responses);
    }

    // Update a comment
    @PutMapping("/{commentId}")
    public ResponseEntity<TaskCommentResponse> updateComment(
            @PathVariable Long taskId,
            @PathVariable Long commentId,
            @Valid @RequestBody TaskCommentRequest request,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        TaskComment comment = commentService.updateComment(
                taskId, commentId, request.getContent(), userId);

        return ResponseEntity.ok(toResponse(comment));
    }

    // Delete a comment
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long taskId,
            @PathVariable Long commentId,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        commentService.deleteComment(taskId, commentId, userId);

        return ResponseEntity.noContent().build();
    }

    // Get logged-in user's ID
    private Long getUserId(Authentication authentication) {

        AppUser user = userRepository.findByUsername(
                authentication.getName())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found."));

        return user.getId();
    }

    // Convert entity to response DTO
    private TaskCommentResponse toResponse(TaskComment comment) {

        TaskCommentResponse response = new TaskCommentResponse();

        response.setId(comment.getId());
        response.setTaskId(comment.getTask().getId());
        response.setAuthorId(comment.getAuthor().getId());
        response.setAuthorName(comment.getAuthor().getName());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        response.setUpdatedAt(comment.getUpdatedAt());

        return response;
    }
}