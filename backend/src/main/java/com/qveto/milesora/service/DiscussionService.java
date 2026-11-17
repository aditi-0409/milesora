package com.qveto.milesora.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.qveto.milesora.dto.CreateDiscussionRequest;
import com.qveto.milesora.dto.DiscussionResponse;
import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.Discussion;
import com.qveto.milesora.repository.AppUserRepository;
import com.qveto.milesora.repository.DiscussionRepository;

@Service
@Transactional
public class DiscussionService {

    private final DiscussionRepository discussionRepository;
    private final AppUserRepository userRepository;
    private final ActivityService activityService;

    public DiscussionService(
            DiscussionRepository discussionRepository,
            AppUserRepository userRepository,
            ActivityService activityService) {

        this.discussionRepository = discussionRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    // Create a discussion.
    public DiscussionResponse createDiscussion(
            CreateDiscussionRequest request,
            String username) {

        AppUser author = getUser(username);

        validateRequest(request);

        Discussion discussion = new Discussion();

        discussion.setTitle(request.getTitle().trim());

        discussion.setCategory(
                request.getCategory() == null
                        || request.getCategory().isBlank()
                        ? "General"
                        : request.getCategory().trim());

        discussion.setContent(request.getContent().trim());
        discussion.setAuthor(author);

        Discussion savedDiscussion =
                discussionRepository.save(discussion);

        // Record the discussion creation activity.
        activityService.recordActivity(
                author,
                "posted a new discussion",
                savedDiscussion.getTitle());

        return toResponse(savedDiscussion);
    }

    // Retrieve all discussions.
    @Transactional(readOnly = true)
    public List<DiscussionResponse> getAllDiscussions() {

        return discussionRepository
                .findAllByOrderByPinnedDescCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Find the authenticated user.
    private AppUser getUser(String username) {

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"));
    }

    // Validate discussion details.
    private void validateRequest(
            CreateDiscussionRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Discussion details are required");
        }

        if (request.getTitle() == null
                || request.getTitle().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Discussion title is required");
        }

        if (request.getTitle().trim().length() > 200) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Title cannot exceed 200 characters");
        }

        if (request.getContent() == null
                || request.getContent().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Discussion content is required");
        }

        if (request.getContent().trim().length() > 5000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Content cannot exceed 5000 characters");
        }

        if (request.getCategory() != null
                && request.getCategory().trim().length() > 60) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Category cannot exceed 60 characters");
        }
    }

    // Convert entity to response DTO.
    private DiscussionResponse toResponse(
            Discussion discussion) {

        return new DiscussionResponse(
                discussion.getId(),
                discussion.getTitle(),
                discussion.getCategory(),
                discussion.getContent(),
                discussion.getAuthor().getId(),
                discussion.getAuthor().getName(),
                discussion.getCreatedAt(),
                0L,
                discussion.isPinned());
    }
}