package com.qveto.milesora.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.qveto.milesora.dto.ActivityResponse;
import com.qveto.milesora.dto.CreateDiscussionRequest;
import com.qveto.milesora.dto.DiscussionResponse;
import com.qveto.milesora.service.ActivityService;
import com.qveto.milesora.service.DiscussionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/collaboration")
public class CollaborationController {

    private final DiscussionService discussionService;
    private final ActivityService activityService;

    public CollaborationController(
            DiscussionService discussionService,
            ActivityService activityService) {

        this.discussionService = discussionService;
        this.activityService = activityService;
    }

    // Get all discussions.
    @GetMapping("/discussions")
    public ResponseEntity<List<DiscussionResponse>> getAllDiscussions() {

        return ResponseEntity.ok(
                discussionService.getAllDiscussions());
    }

    // Create a new discussion.
    @PostMapping("/discussions")
    public ResponseEntity<DiscussionResponse> createDiscussion(
            @Valid @RequestBody CreateDiscussionRequest request,
            Authentication authentication) {

        DiscussionResponse response =
                discussionService.createDiscussion(
                        request,
                        authentication.getName());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Get the latest activity records.
    @GetMapping("/activity")
    public ResponseEntity<List<ActivityResponse>> getActivity() {

        return ResponseEntity.ok(
                activityService.getRecentActivities());
    }
}