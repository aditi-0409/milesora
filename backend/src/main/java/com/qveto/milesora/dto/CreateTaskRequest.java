package com.qveto.milesora.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import com.qveto.milesora.entity.TaskPriority;
import com.qveto.milesora.entity.TaskStatus;

public class CreateTaskRequest {

    @NotBlank(message = "Task title is required.")
    @Size(max = 200, message = "Task title cannot exceed 200 characters.")
    private String title;

    @Size(max = 3000, message = "Description cannot exceed 3000 characters.")
    private String description;

    private LocalDate startDate;

    private LocalDate dueDate;

    private Long assignedToId;

    private TaskStatus status;

    private TaskPriority priority;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Long getAssignedToId() {
        return assignedToId;
    }

    public void setAssignedToId(Long assignedToId) {
        this.assignedToId = assignedToId;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }
}