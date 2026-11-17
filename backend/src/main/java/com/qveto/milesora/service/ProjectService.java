package com.qveto.milesora.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.Project;
import com.qveto.milesora.entity.ProjectMember;
import com.qveto.milesora.entity.ProjectStatus;
import com.qveto.milesora.entity.Role;
import com.qveto.milesora.entity.Task;

import com.qveto.milesora.repository.AppUserRepository;
import com.qveto.milesora.repository.ProjectRepository;
import com.qveto.milesora.repository.ProjectMemberRepository;
import com.qveto.milesora.repository.TaskRepository;
import com.qveto.milesora.repository.CommentRepository;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final AppUserRepository appUserRepository;
    private final ProjectMemberRepository memberRepository;
    private final TaskRepository taskRepository;
    private final TaskService taskService;
    private final CommentRepository commentRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            AppUserRepository appUserRepository,
            ProjectMemberRepository memberRepository,
            TaskRepository taskRepository,
            TaskService taskService,
            CommentRepository commentRepository) {

        this.projectRepository = projectRepository;
        this.appUserRepository = appUserRepository;
        this.memberRepository = memberRepository;
        this.taskRepository = taskRepository;
        this.taskService = taskService;
        this.commentRepository = commentRepository;
    }

    // Create project
    public Project createProject(Project project, Long userId) {

        AppUser creator = appUserRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"));

        validateDates(project);
        project.setCreatedBy(creator);

        if (project.getStatus() == null) {
            project.setStatus(ProjectStatus.PLANNING);
        }

        return projectRepository.save(project);
    }

    // Check whether requester is a global ADMIN
    private boolean isAdmin(Long userId) {

        return appUserRepository.findById(userId)
                .map(user -> user.getRole() == Role.ADMIN)
                .orElse(false);
    }

    // Get projects created by or joined by the user
    // ADMIN can view every project
    @Transactional(readOnly = true)
    public List<Project> getAllProjects(Long userId) {

        if (isAdmin(userId)) {
            return projectRepository.findAll();
        }

        Map<Long, Project> projects = new LinkedHashMap<>();

        for (Project project :
                projectRepository.findAllByCreatedBy_Id(userId)) {
            projects.put(project.getId(), project);
        }

        for (ProjectMember member :
                memberRepository.findAllByUser_Id(userId)) {
            Project project = member.getProject();
            projects.put(project.getId(), project);
        }

        return List.copyOf(projects.values());
    }

    // Get project by ID if user is creator, member or ADMIN
    @Transactional(readOnly = true)
    public Project getProjectById(Long projectId, Long userId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Project not found"));

        if (isAdmin(userId)) {
            return project;
        }

        boolean isCreator =
                project.getCreatedBy().getId().equals(userId);

        boolean isMember =
                memberRepository.existsByProject_IdAndUser_Id(
                        projectId, userId);

        if (!isCreator && !isMember) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have access to this project");
        }

        return project;
    }

    // Update project: creator or ADMIN
    public Project updateProject(
            Long projectId, Project updatedProject, Long userId) {

        Project existingProject = getOwnedProject(projectId, userId);

        validateDates(updatedProject);

        existingProject.setName(updatedProject.getName());
        existingProject.setDescription(updatedProject.getDescription());
        existingProject.setStartDate(updatedProject.getStartDate());
        existingProject.setEndDate(updatedProject.getEndDate());

        if (updatedProject.getStatus() != null) {
            existingProject.setStatus(updatedProject.getStatus());
        }

        return projectRepository.save(existingProject);
    }

    // Delete project and all its related records
    public void deleteProject(Long projectId, Long userId) {

        // Only the project creator or ADMIN can delete the project.
        getOwnedProject(projectId, userId);

        // Retrieve all tasks belonging to this project.
        List<Task> tasks = taskRepository.findAllByProject_Id(projectId);

        // Delete each task and its related records.
        for (Task task : tasks) {
            taskService.deleteTask(
                    projectId,
                    task.getId(),
                    userId
            );
        }

        // Delete all project-level comments.
        commentRepository.deleteAllByProject_Id(projectId);

        // Delete all project memberships.
        memberRepository.deleteAllByProject_Id(projectId);

        // Finally, delete the project.
        projectRepository.deleteById(projectId);
    }

    // Find project owned by requester or accessible to ADMIN
    private Project getOwnedProject(Long projectId, Long userId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Project not found"));

        if (isAdmin(userId)) {
            return project;
        }

        if (!project.getCreatedBy().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the project creator or ADMIN can modify this project");
        }

        return project;
    }

    // Project date validation
    private void validateDates(Project project) {

        if (project.getName() == null ||
                project.getName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Project name is required");
        }

        if (project.getStartDate() != null &&
                project.getEndDate() != null &&
                project.getEndDate().isBefore(project.getStartDate())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "End date cannot be before start date");
        }
    }
}