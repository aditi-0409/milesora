package com.qveto.milesora.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.qveto.milesora.dto.TimeEntryRequest;
import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.Project;
import com.qveto.milesora.entity.ProjectMember;
import com.qveto.milesora.entity.ProjectMemberRole;
import com.qveto.milesora.entity.Role;
import com.qveto.milesora.entity.Task;
import com.qveto.milesora.entity.TimeEntry;
import com.qveto.milesora.repository.AppUserRepository;
import com.qveto.milesora.repository.ProjectMemberRepository;
import com.qveto.milesora.repository.TaskRepository;
import com.qveto.milesora.repository.TimeEntryRepository;

@Service
public class TimeEntryService {

    private final TimeEntryRepository timeEntryRepository;
    private final TaskRepository taskRepository;
    private final AppUserRepository appUserRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public TimeEntryService(
            TimeEntryRepository timeEntryRepository,
            TaskRepository taskRepository,
            AppUserRepository appUserRepository,
            ProjectMemberRepository projectMemberRepository) {

        this.timeEntryRepository = timeEntryRepository;
        this.taskRepository = taskRepository;
        this.appUserRepository = appUserRepository;
        this.projectMemberRepository = projectMemberRepository;
    }

    // Create a time entry
    @Transactional
    public TimeEntry createTimeEntry(
            Long taskId, TimeEntryRequest request, String username) {

        AppUser user = getUser(username);
        Task task = getTask(taskId);

        validateCreateAccess(task, user);
        validateHours(request.getHours());

        TimeEntry entry = new TimeEntry();
        entry.setTask(task);
        entry.setUser(user);
        entry.setEntryDate(request.getEntryDate());
        entry.setHours(request.getHours());
        entry.setDescription(request.getDescription());

        return timeEntryRepository.save(entry);
    }

    // Get time entries for a task
    @Transactional(readOnly = true)
    public List<TimeEntry> getTaskTimeEntries(
            Long taskId, String username) {

        AppUser user = getUser(username);
        Task task = getTask(taskId);

        ProjectMember membership = validateViewAccess(task, user);

        if (canViewAllEntries(task.getProject(), user, membership)) {
            return timeEntryRepository
                    .findAllByTask_IdOrderByEntryDateDesc(taskId);
        }

        return timeEntryRepository
                .findAllByTask_IdAndUser_IdOrderByEntryDateDesc(
                        taskId, user.getId());
    }

    // Get one time entry, ensuring it belongs to the supplied task
    @Transactional(readOnly = true)
    public TimeEntry getTimeEntry(
            Long taskId, Long entryId, String username) {

        AppUser user = getUser(username);

        TimeEntry entry = timeEntryRepository
                .findByIdAndTask_Id(entryId, taskId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Time entry not found."));

        ProjectMember membership =
                validateViewAccess(entry.getTask(), user);

        if (!canViewAllEntries(
                entry.getTask().getProject(), user, membership)
                && !entry.getUser().getId().equals(user.getId())) {

            throw new SecurityException(
                    "You can only view your own time entries.");
        }

        return entry;
    }

    // Update a time entry, ensuring it belongs to the supplied task
    @Transactional
    public TimeEntry updateTimeEntry(
            Long taskId, Long entryId,
            TimeEntryRequest request, String username) {

        AppUser user = getUser(username);

        TimeEntry entry = timeEntryRepository
                .findByIdAndTask_Id(entryId, taskId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Time entry not found."));

        validateManageAccess(entry, user);
        validateHours(request.getHours());

        entry.setEntryDate(request.getEntryDate());
        entry.setHours(request.getHours());
        entry.setDescription(request.getDescription());

        return timeEntryRepository.save(entry);
    }

    // Delete a time entry, ensuring it belongs to the supplied task
    @Transactional
    public void deleteTimeEntry(
            Long taskId, Long entryId, String username) {

        AppUser user = getUser(username);

        TimeEntry entry = timeEntryRepository
                .findByIdAndTask_Id(entryId, taskId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Time entry not found."));

        validateManageAccess(entry, user);

        timeEntryRepository.delete(entry);
    }

    // Find authenticated user
    private AppUser getUser(String username) {
        return appUserRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found."));
    }

    // Find task
    private Task getTask(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Task not found."));
    }

    // Validate hours
    private void validateHours(Double hours) {
        if (hours == null || !Double.isFinite(hours)
                || hours <= 0 || hours > 24) {

            throw new IllegalArgumentException(
                    "Hours must be greater than zero and cannot exceed 24.");
        }
    }

    // Check Admin role
    private boolean isAdmin(AppUser user) {
        return user.getRole() == Role.ADMIN;
    }

    // Check Project Owner
    private boolean isProjectOwner(Project project, AppUser user) {
        return project.getCreatedBy().getId().equals(user.getId());
    }

    // Find project membership
    private ProjectMember getMembership(Project project, AppUser user) {
        return projectMemberRepository
                .findByProject_IdAndUser_Id(
                        project.getId(), user.getId())
                .orElseThrow(() ->
                        new SecurityException(
                                "You are not a member of this project."));
    }

    // Check project management role
    private boolean hasManagementRole(ProjectMember membership) {
        return membership != null
                && (membership.getRole() == ProjectMemberRole.OWNER
                || membership.getRole() == ProjectMemberRole.MANAGER);
    }

    // Check whether user can view all project entries
    private boolean canViewAllEntries(
            Project project, AppUser user, ProjectMember membership) {

        return isAdmin(user)
                || isProjectOwner(project, user)
                || hasManagementRole(membership)
                || (membership != null
                && membership.getRole() == ProjectMemberRole.VIEWER);
    }

    // Validate viewing permission
    private ProjectMember validateViewAccess(Task task, AppUser user) {

        Project project = task.getProject();

        if (isAdmin(user) || isProjectOwner(project, user)) {
            return null;
        }

        return getMembership(project, user);
    }

    // Validate creation permission
    private void validateCreateAccess(Task task, AppUser user) {

        Project project = task.getProject();

        if (isAdmin(user) || isProjectOwner(project, user)) {
            return;
        }

        ProjectMember membership = getMembership(project, user);

        if (membership.getRole() == ProjectMemberRole.VIEWER) {
            throw new SecurityException(
                    "Viewers cannot create time entries.");
        }
    }

    // Validate update and deletion permission
    private void validateManageAccess(TimeEntry entry, AppUser user) {

        Project project = entry.getTask().getProject();

        if (isAdmin(user) || isProjectOwner(project, user)) {
            return;
        }

        ProjectMember membership = getMembership(project, user);

        if (membership.getRole() == ProjectMemberRole.VIEWER) {
            throw new SecurityException(
                    "Viewers cannot update or delete time entries.");
        }

        if (hasManagementRole(membership)) {
            return;
        }

        if (!entry.getUser().getId().equals(user.getId())) {
            throw new SecurityException(
                    "You can only modify your own time entries.");
        }
    }
}