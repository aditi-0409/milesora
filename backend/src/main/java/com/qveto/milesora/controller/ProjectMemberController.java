package com.qveto.milesora.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.server.ResponseStatusException;

import com.qveto.milesora.dto.AddProjectMemberRequest;
import com.qveto.milesora.dto.ProjectMemberResponse;
import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.ProjectMember;
import com.qveto.milesora.repository.AppUserRepository;
import com.qveto.milesora.service.ProjectMemberService;

@RestController
@RequestMapping("/api/projects/{projectId}/members")
public class ProjectMemberController {

    private final ProjectMemberService memberService;
    private final AppUserRepository userRepository;

    public ProjectMemberController(
            ProjectMemberService memberService,
            AppUserRepository userRepository) {

        this.memberService = memberService;
        this.userRepository = userRepository;
    }

    // Add member
    @PostMapping
    public ResponseEntity<ProjectMemberResponse> addMember(
            @PathVariable Long projectId,
            @RequestBody AddProjectMemberRequest request,
            Authentication authentication) {

        Long requesterId = getCurrentUserId(authentication);

        ProjectMember member = memberService.addMember(
                projectId,
                request.getUserId(),
                request.getRole(),
                requesterId
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(member));
    }

    // Get all project members
    @GetMapping
    public ResponseEntity<List<ProjectMemberResponse>> getMembers(
            @PathVariable Long projectId,
            Authentication authentication) {

        Long requesterId = getCurrentUserId(authentication);

        List<ProjectMemberResponse> members =
                memberService.getProjectMembers(
                        projectId, requesterId)
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(members);
    }

    // Remove member
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            Authentication authentication) {

        Long requesterId = getCurrentUserId(authentication);

        memberService.removeMember(
                projectId, userId, requesterId);

        return ResponseEntity.noContent().build();
    }

    // Get authenticated user
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

    // Convert entity into safe response DTO
    private ProjectMemberResponse toResponse(ProjectMember member) {

        ProjectMemberResponse response =
                new ProjectMemberResponse();

        response.setId(member.getId());
        response.setUserId(member.getUser().getId());
        response.setName(member.getUser().getName());
        response.setEmail(member.getUser().getEmail());
        response.setRole(member.getRole());
        response.setJoinedAt(member.getJoinedAt());

        return response;
    }
}