package com.qveto.milesora.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.Project;
import com.qveto.milesora.entity.ProjectStatus;
import com.qveto.milesora.repository.AppUserRepository;
import com.qveto.milesora.repository.ProjectRepository;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final AppUserRepository appUserRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            AppUserRepository appUserRepository) {
        this.projectRepository = projectRepository;
        this.appUserRepository = appUserRepository;
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

    // Get all projects created by a user
    @Transactional(readOnly = true)
    public List<Project> getAllProjects(Long userId) {

        return projectRepository.findAllByCreatedBy_Id(userId);
    }

    // Get project by ID
    @Transactional(readOnly = true)
    public Project getProjectById(Long projectId, Long userId) {

        return projectRepository
                .findByIdAndCreatedBy_Id(projectId, userId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));
    }

    // Update project
    public Project updateProject(
            Long projectId, Project updatedProject, Long userId) {

        Project existingProject =
                getProjectById(projectId, userId);

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

    // Delete project
    public void deleteProject(Long projectId, Long userId) {

        Project project = getProjectById(projectId, userId);

        projectRepository.delete(project);
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