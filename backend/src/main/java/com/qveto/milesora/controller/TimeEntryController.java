package com.qveto.milesora.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.qveto.milesora.dto.TimeEntryRequest;
import com.qveto.milesora.dto.TimeEntryResponse;
import com.qveto.milesora.entity.TimeEntry;
import com.qveto.milesora.service.TimeEntryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tasks/{taskId}/time-entries")
public class TimeEntryController {

    private final TimeEntryService timeEntryService;

    public TimeEntryController(TimeEntryService timeEntryService) {
        this.timeEntryService = timeEntryService;
    }

    // Create a time entry
    @PostMapping
    public ResponseEntity<TimeEntryResponse> createTimeEntry(
            @PathVariable Long taskId,
            @Valid @RequestBody TimeEntryRequest request,
            Authentication authentication) {

        TimeEntry entry = timeEntryService.createTimeEntry(
                taskId, request, authentication.getName());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(entry));
    }

    // Get all accessible time entries for a task
    @GetMapping
    public ResponseEntity<List<TimeEntryResponse>> getTaskTimeEntries(
            @PathVariable Long taskId,
            Authentication authentication) {

        List<TimeEntryResponse> responses =
                timeEntryService.getTaskTimeEntries(
                        taskId, authentication.getName())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    // Get a specific time entry
    @GetMapping("/{entryId}")
    public ResponseEntity<TimeEntryResponse> getTimeEntry(
    		@PathVariable Long taskId,
            @PathVariable Long entryId,
            Authentication authentication) {

        TimeEntry entry = timeEntryService.getTimeEntry(
        		taskId, entryId, authentication.getName());

        return ResponseEntity.ok(toResponse(entry));
    }

    // Update a time entry
    @PutMapping("/{entryId}")
    public ResponseEntity<TimeEntryResponse> updateTimeEntry(
    		@PathVariable Long taskId,
            @PathVariable Long entryId,
            @Valid @RequestBody TimeEntryRequest request,
            Authentication authentication) {

        TimeEntry entry = timeEntryService.updateTimeEntry(
        		taskId, entryId, request, authentication.getName());

        return ResponseEntity.ok(toResponse(entry));
    }

    // Delete a time entry
    @DeleteMapping("/{entryId}")
    public ResponseEntity<Void> deleteTimeEntry(
    		@PathVariable Long taskId,
            @PathVariable Long entryId,
            Authentication authentication) {

        timeEntryService.deleteTimeEntry(
        		taskId, entryId, authentication.getName());

        return ResponseEntity.noContent().build();
    }

    // Convert entity to response DTO
    private TimeEntryResponse toResponse(TimeEntry entry) {

        TimeEntryResponse response = new TimeEntryResponse();

        response.setId(entry.getId());
        response.setTaskId(entry.getTask().getId());
        response.setTaskTitle(entry.getTask().getTitle());
        response.setUserId(entry.getUser().getId());
        response.setUsername(entry.getUser().getUsername());
        response.setEntryDate(entry.getEntryDate());
        response.setHours(entry.getHours());
        response.setDescription(entry.getDescription());
        response.setCreatedAt(entry.getCreatedAt());
        response.setUpdatedAt(entry.getUpdatedAt());

        return response;
    }
}