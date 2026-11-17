package com.qveto.milesora.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.qveto.milesora.entity.ProjectMemberRole;
import com.qveto.milesora.entity.Role;
import com.qveto.milesora.entity.Task;
import com.qveto.milesora.entity.TaskDependency;
import com.qveto.milesora.repository.AppUserRepository;
import com.qveto.milesora.repository.ProjectMemberRepository;
import com.qveto.milesora.repository.TaskDependencyRepository;
import com.qveto.milesora.repository.TaskRepository;

@Service
@Transactional
public class TaskDependencyService {

    private final TaskDependencyRepository dependencyRepository;
    private final TaskRepository taskRepository;
    private final ProjectMemberRepository memberRepository;
    private final AppUserRepository userRepository;

    public TaskDependencyService(
            TaskDependencyRepository dependencyRepository,
            TaskRepository taskRepository,
            ProjectMemberRepository memberRepository,
            AppUserRepository userRepository) {

        this.dependencyRepository = dependencyRepository;
        this.taskRepository = taskRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    // Add dependency
    public TaskDependency addDependency(
            Long taskId,
            Long dependsOnTaskId,
            Long requesterId) {

        Task task = getTask(taskId);
        Task dependsOnTask = getTask(dependsOnTaskId);

        validateManagerAccess(task, requesterId);

        if (taskId.equals(dependsOnTaskId)) {
            throw new IllegalArgumentException(
                    "A task cannot depend on itself");
        }

        if (!task.getProject().getId().equals(
                dependsOnTask.getProject().getId())) {
            throw new IllegalArgumentException(
                    "Both tasks must belong to the same project");
        }

        if (dependencyRepository.existsByTask_IdAndDependsOnTask_Id(
                taskId, dependsOnTaskId)) {
            throw new IllegalArgumentException(
                    "Dependency already exists");
        }

        if (createsCycle(taskId, dependsOnTaskId)) {
            throw new IllegalArgumentException(
                    "Circular dependency is not allowed");
        }

        TaskDependency dependency = new TaskDependency();
        dependency.setTask(task);
        dependency.setDependsOnTask(dependsOnTask);

        return dependencyRepository.save(dependency);
    }

    // Get dependencies of a task
    @Transactional(readOnly = true)
    public List<TaskDependency> getDependencies(
            Long taskId, Long requesterId) {

        Task task = getTask(taskId);

        validateProjectAccess(task, requesterId);

        return dependencyRepository.findAllByTask_Id(taskId);
    }

    // Remove dependency
    public void removeDependency(
            Long taskId,
            Long dependsOnTaskId,
            Long requesterId) {

        Task task = getTask(taskId);

        validateManagerAccess(task, requesterId);

        if (!dependencyRepository.existsByTask_IdAndDependsOnTask_Id(
                taskId, dependsOnTaskId)) {
            throw new IllegalArgumentException(
                    "Dependency not found");
        }

        dependencyRepository.deleteByTask_IdAndDependsOnTask_Id(
                taskId, dependsOnTaskId);
    }

    // Check whether adding a dependency creates a cycle
    private boolean createsCycle(
            Long taskId, Long dependsOnTaskId) {

        return canReach(dependsOnTaskId, taskId, new HashSet<>());
    }

    private boolean canReach(
            Long currentTaskId,
            Long targetTaskId,
            Set<Long> visited) {

        if (currentTaskId.equals(targetTaskId)) {
            return true;
        }

        if (!visited.add(currentTaskId)) {
            return false;
        }

        List<TaskDependency> dependencies =
                dependencyRepository.findAllByTask_Id(currentTaskId);

        for (TaskDependency dependency : dependencies) {

            Long nextTaskId =
                    dependency.getDependsOnTask().getId();

            if (canReach(nextTaskId, targetTaskId, visited)) {
                return true;
            }
        }

        return false;
    }

    // Check global ADMIN role
    private boolean isAdmin(Long requesterId) {

        return userRepository.findById(requesterId)
                .map(user -> user.getRole() == Role.ADMIN)
                .orElse(false);
    }

    // Validate owner, manager or ADMIN access
    private void validateManagerAccess(
            Task task, Long requesterId) {

        if (isAdmin(requesterId)) {
            return;
        }

        boolean isOwner =
                task.getProject().getCreatedBy()
                        .getId().equals(requesterId);

        boolean isManager =
                memberRepository
                        .findByProject_IdAndUser_Id(
                                task.getProject().getId(),
                                requesterId)
                        .map(member ->
                                member.getRole()
                                        == ProjectMemberRole.MANAGER)
                        .orElse(false);

        if (!isOwner && !isManager) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only project owner, manager or ADMIN can manage dependencies");
        }
    }

    // Validate project access
    private void validateProjectAccess(
            Task task, Long requesterId) {

        if (isAdmin(requesterId)) {
            return;
        }

        boolean isOwner =
                task.getProject().getCreatedBy()
                        .getId().equals(requesterId);

        boolean isMember =
                memberRepository.existsByProject_IdAndUser_Id(
                        task.getProject().getId(), requesterId);

        if (!isOwner && !isMember) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have access to this project");
        }
    }

    private Task getTask(Long taskId) {

        return taskRepository.findById(taskId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Task not found"));
    }
}