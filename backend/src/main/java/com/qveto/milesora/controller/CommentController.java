package com.qveto.milesora.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.qveto.milesora.dto.CommentRequest;
import com.qveto.milesora.dto.CommentResponse;
import com.qveto.milesora.service.CommentService;

@RestController
@RequestMapping("/api")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    // Add a comment to a project.
    @PostMapping("/projects/{projectId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long projectId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication) {

        CommentResponse response = commentService.addComment(
                projectId,
                request.getContent(),
                authentication.getName());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

    // Get all comments belonging to a project.
    @GetMapping("/projects/{projectId}/comments")
    public ResponseEntity<List<CommentResponse>> getProjectComments(
            @PathVariable Long projectId,
            Authentication authentication) {

        List<CommentResponse> comments =
                commentService.getProjectComments(
                        projectId,
                        authentication.getName());

        return ResponseEntity.ok(comments);
    }

    // Edit a comment.
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication) {

        CommentResponse response = commentService.updateComment(
                commentId,
                request.getContent(),
                authentication.getName());

        return ResponseEntity.ok(response);
    }

    // Delete a comment.
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            Authentication authentication) {

        commentService.deleteComment(
                commentId,
                authentication.getName());

        return ResponseEntity.noContent().build();
    }
}