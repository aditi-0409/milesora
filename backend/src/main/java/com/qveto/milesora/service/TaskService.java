package com.qveto.milesora.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.qveto.milesora.entity.*;
import com.qveto.milesora.repository.*;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final AppUserRepository userRepository;
    private final ProjectMemberRepository memberRepository;
    private final NotificationService notificationService;
    private final TaskDependencyRepository dependencyRepository;
    private final TimeEntryRepository timeEntryRepository;
    private final TaskCommentRepository taskCommentRepository;
    private final NotificationRepository notificationRepository;
    private final AttachmentService attachmentService;
    private final ActivityService activityService;

    public TaskService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            AppUserRepository userRepository,
            ProjectMemberRepository memberRepository,
            NotificationService notificationService,
            TaskDependencyRepository dependencyRepository,
            TimeEntryRepository timeEntryRepository,
            TaskCommentRepository taskCommentRepository,
            NotificationRepository notificationRepository,
            AttachmentService attachmentService,
            ActivityService activityService) {

        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
        this.notificationService = notificationService;
        this.dependencyRepository = dependencyRepository;
        this.timeEntryRepository = timeEntryRepository;
        this.taskCommentRepository = taskCommentRepository;
        this.notificationRepository = notificationRepository;
        this.attachmentService = attachmentService;
        this.activityService = activityService;
    }

    // Create task.
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

        Task savedTask = taskRepository.save(task);

        if (savedTask.getAssignedTo() != null) {
            notificationService.createNotification(
                    savedTask.getAssignedTo().getId(),
                    "New Task Assigned",
                    "You have been assigned a new task: "
                            + savedTask.getTitle(),
                    NotificationType.TASK_ASSIGNED,
                    savedTask.getId()
            );
        }

        activityService.recordActivity(
                requester,
                "created a new task",
                savedTask.getTitle());

        return savedTask;
    }

    // Get all tasks in a project.
    @Transactional(readOnly = true)
    public List<Task> getProjectTasks(
            Long projectId, Long requesterId) {

        Project project = getProject(projectId);
        validateMemberAccess(project, requesterId);

        return taskRepository.findAllByProject_Id(projectId);
    }

    // Get task by ID.
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
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Task not found"));
    }

    // Update task.
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
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Task not found"));

        validateDates(updatedTask);

        Long previousAssigneeId =
                existingTask.getAssignedTo() != null
                        ? existingTask.getAssignedTo().getId()
                        : null;

        if (updatedTask.getAssignedTo() != null) {

            AppUser assignee =
                    getUser(updatedTask.getAssignedTo().getId());

            validateMember(projectId, assignee.getId());
            existingTask.setAssignedTo(assignee);

        } else {
            existingTask.setAssignedTo(null);
        }

        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setStartDate(updatedTask.getStartDate());
        existingTask.setDueDate(updatedTask.getDueDate());

        if (updatedTask.getStatus() != null) {
            existingTask.setStatus(updatedTask.getStatus());
        }

        if (updatedTask.getPriority() != null) {
            existingTask.setPriority(updatedTask.getPriority());
        }

        Task savedTask = taskRepository.save(existingTask);

        Long newAssigneeId =
                savedTask.getAssignedTo() != null
                        ? savedTask.getAssignedTo().getId()
                        : null;

        if (newAssigneeId != null) {

            if (!newAssigneeId.equals(previousAssigneeId)) {

                notificationService.createNotification(
                        newAssigneeId,
                        "Task Assigned",
                        "You have been assigned the task: "
                                + savedTask.getTitle(),
                        NotificationType.TASK_ASSIGNED,
                        savedTask.getId()
                );

            } else {

                notificationService.createNotification(
                        newAssigneeId,
                        "Task Updated",
                        "Your assigned task has been updated: "
                                + savedTask.getTitle(),
                        NotificationType.TASK_UPDATED,
                        savedTask.getId()
                );
            }
        }

        AppUser requester = getUser(requesterId);

        activityService.recordActivity(
                requester,
                "updated a task",
                savedTask.getTitle());

        return savedTask;
    }

    // Delete task and all related records.
    public void deleteTask(
            Long projectId,
            Long taskId,
            Long requesterId) {

        Project project = getProject(projectId);
        validateManagerAccess(project, requesterId);

        Task task = taskRepository
                .findByIdAndProject_Id(taskId, projectId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Task not found"));

        AppUser requester = getUser(requesterId);
        String taskTitle = task.getTitle();

        // Remove dependencies in both directions.
        dependencyRepository.deleteAllByTask_Id(taskId);
        dependencyRepository.deleteAllByDependsOnTask_Id(taskId);

        // Remove related records.
        timeEntryRepository.deleteAllByTask_Id(taskId);
        taskCommentRepository.deleteAllByTask_Id(taskId);
        notificationRepository.deleteAllByTask_Id(taskId);

        // Remove attachment records and schedule physical file cleanup.
        attachmentService.deleteAllTaskAttachments(taskId);

        // Finally, delete the task.
        taskRepository.delete(task);

        activityService.recordActivity(
                requester,
                "deleted a task",
                taskTitle);
    }

    // Validate task dates.
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
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "User must be a project member."));

        if (membership.getRole() == ProjectMemberRole.VIEWER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Viewers cannot be assigned tasks.");
        }
    }

    // Check manager access.
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
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only project owner or manager can manage tasks");
        }
    }

    // Check member access.
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
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have access to this project");
        }
    }

    private Project getProject(Long projectId) {

        return projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Project not found"));
    }

    private AppUser getUser(Long userId) {

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"));
    }
}