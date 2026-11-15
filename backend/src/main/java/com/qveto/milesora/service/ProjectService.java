package com.qveto.milesora.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.Project;
import com.qveto.milesora.entity.ProjectMember;
import com.qveto.milesora.entity.ProjectStatus;
import com.qveto.milesora.repository.AppUserRepository;
import com.qveto.milesora.repository.ProjectRepository;
import com.qveto.milesora.repository.ProjectMemberRepository;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final AppUserRepository appUserRepository;
    private final ProjectMemberRepository memberRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            AppUserRepository appUserRepository,
            ProjectMemberRepository memberRepository) {

        this.projectRepository = projectRepository;
        this.appUserRepository = appUserRepository;
        this.memberRepository = memberRepository;
    }

    // Create project
    public Project createProject(Project project, Long userId) {

        AppUser creator = appUserRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        validateDates(project);
        project.setCreatedBy(creator);

        if (project.getStatus() == null) {
            project.setStatus(ProjectStatus.PLANNING);
        }

        return projectRepository.save(project);
    }

    // Get projects created by the user or joined by the user
    @Transactional(readOnly = true)
    public List<Project> getAllProjects(Long userId) {

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

    // Get project by ID if user is creator or member
    @Transactional(readOnly = true)
    public Project getProjectById(Long projectId, Long userId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        boolean isCreator =
                project.getCreatedBy().getId().equals(userId);

        boolean isMember =
                memberRepository.existsByProject_IdAndUser_Id(
                        projectId, userId);

        if (!isCreator && !isMember) {
            throw new SecurityException(
                    "You do not have access to this project");
        }

        return project;
    }

    // Update project: creator only
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

    // Delete project: creator only
    public void deleteProject(Long projectId, Long userId) {

        Project project = getOwnedProject(projectId, userId);
        projectRepository.delete(project);
    }

    // Find project owned by the requester
    private Project getOwnedProject(Long projectId, Long userId) {

        return projectRepository
                .findByIdAndCreatedBy_Id(projectId, userId)
                .orElseThrow(() ->
                        new SecurityException(
                                "Only the project creator can modify this project"));
    }

    // Project date validation
    private void validateDates(Project project) {

        if (project.getName() == null ||
                project.getName().isBlank()) {
            throw new IllegalArgumentException(
                    "Project name is required");
        }

        if (project.getStartDate() != null &&
                project.getEndDate() != null &&
                project.getEndDate().isBefore(project.getStartDate())) {

            throw new IllegalArgumentException(
                    "End date cannot be before start date");
        }
    }
}