package com.qveto.milesora.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.qveto.milesora.entity.*;
import com.qveto.milesora.repository.*;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final AppUserRepository userRepository;
    private final ProjectMemberRepository memberRepository;

    public TaskService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            AppUserRepository userRepository,
            ProjectMemberRepository memberRepository) {

        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
    }

    // Create task
    public Task createTask(
            Long projectId,
            Task task,
            Long requesterId) {

        Project project = getProject(projectId);

        AppUser requester = getUser(requesterId);

        validateManagerAccess(project, requesterId);

        validateDates(task);

        if (task.getAssignedTo() != null) {

            AppUser assignee =
                    getUser(task.getAssignedTo().getId());

            validateMember(projectId, assignee.getId());

            task.setAssignedTo(assignee);
        }

        task.setProject(project);
        task.setCreatedBy(requester);

        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.TODO);
        }

        if (task.getPriority() == null) {
            task.setPriority(TaskPriority.MEDIUM);
        }

        return taskRepository.save(task);
    }

    // Get all tasks in a project
    @Transactional(readOnly = true)
    public List<Task> getProjectTasks(
            Long projectId, Long requesterId) {

        Project project = getProject(projectId);

        validateMemberAccess(project, requesterId);

        return taskRepository.findAllByProject_Id(projectId);
    }

    // Get task by ID
    @Transactional(readOnly = true)
    public Task getTaskById(
            Long projectId,
            Long taskId,
            Long requesterId) {

        Project project = getProject(projectId);

        validateMemberAccess(project, requesterId);

        return taskRepository
                .findByIdAndProject_Id(taskId, projectId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Task not found"));
    }

    // Update task
    public Task updateTask(
            Long projectId,
            Long taskId,
            Task updatedTask,
            Long requesterId) {

        Project project = getProject(projectId);

        validateManagerAccess(project, requesterId);

        Task existingTask = taskRepository
                .findByIdAndProject_Id(taskId, projectId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Task not found"));

        validateDates(updatedTask);

        if (updatedTask.getAssignedTo() != null) {

            AppUser assignee =
                    getUser(updatedTask.getAssignedTo().getId());

            validateMember(projectId, assignee.getId());

            existingTask.setAssignedTo(assignee);

        } else {
            // Clear the existing assignment when no assignee is supplied.
            existingTask.setAssignedTo(null);
        }

        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setDescription(
                updatedTask.getDescription());

        existingTask.setStartDate(
                updatedTask.getStartDate());

        existingTask.setDueDate(
                updatedTask.getDueDate());

        if (updatedTask.getStatus() != null) {
            existingTask.setStatus(
                    updatedTask.getStatus());
        }

        if (updatedTask.getPriority() != null) {
            existingTask.setPriority(
                    updatedTask.getPriority());
        }

        return taskRepository.save(existingTask);
    }

    // Delete task
    public void deleteTask(
            Long projectId,
            Long taskId,
            Long requesterId) {

        Project project = getProject(projectId);

        validateManagerAccess(project, requesterId);

        Task task = taskRepository
                .findByIdAndProject_Id(taskId, projectId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Task not found"));

        taskRepository.delete(task);
    }

    // Validate task dates
    private void validateDates(Task task) {

        if (task.getTitle() == null ||
                task.getTitle().isBlank()) {

            throw new IllegalArgumentException(
                    "Task title is required");
        }

        if (task.getStartDate() != null &&
                task.getDueDate() != null &&
                task.getDueDate().isBefore(
                        task.getStartDate())) {

            throw new IllegalArgumentException(
                    "Due date cannot be before start date");
        }
    }

    // Validate that the assigned user is an eligible project member.
    // VIEWER members cannot be assigned tasks.
    private void validateMember(Long projectId, Long userId) {

        Project project = getProject(projectId);

        boolean isOwner = project.getCreatedBy()
                .getId().equals(userId);

        if (isOwner) {
            return;
        }

        ProjectMember membership = memberRepository
                .findByProject_IdAndUser_Id(projectId, userId)
                .orElseThrow(() -> new SecurityException(
                        "User must be a project member."));

        if (membership.getRole() == ProjectMemberRole.VIEWER) {
            throw new SecurityException(
                    "Viewers cannot be assigned tasks.");
        }
    }

    // Check manager access
    private void validateManagerAccess(
            Project project, Long requesterId) {

        boolean isOwner =
                project.getCreatedBy()
                        .getId().equals(requesterId);

        boolean isManager =
                memberRepository
                        .findByProject_IdAndUser_Id(
                                project.getId(), requesterId)
                        .map(member ->
                                member.getRole()
                                        == ProjectMemberRole.MANAGER)
                        .orElse(false);

        if (!isOwner && !isManager) {
            throw new SecurityException(
                    "Only project owner or manager can manage tasks");
        }
    }

    // Check member access
    private void validateMemberAccess(
            Project project, Long requesterId) {

        boolean isOwner =
                project.getCreatedBy()
                        .getId().equals(requesterId);

        boolean isMember =
                memberRepository
                        .existsByProject_IdAndUser_Id(
                                project.getId(), requesterId);

        if (!isOwner && !isMember) {
            throw new SecurityException(
                    "You do not have access to this project");
        }
    }

    private Project getProject(Long projectId) {

        return projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Project not found"));
    }

    private AppUser getUser(Long userId) {

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"));
    }
}