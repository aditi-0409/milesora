package com.qveto.milesora.service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.qveto.milesora.dto.DashboardResponse;
import com.qveto.milesora.entity.Project;
import com.qveto.milesora.entity.ProjectMember;
import com.qveto.milesora.entity.ProjectStatus;
import com.qveto.milesora.entity.Task;
import com.qveto.milesora.entity.TaskStatus;
import com.qveto.milesora.repository.ProjectMemberRepository;
import com.qveto.milesora.repository.ProjectRepository;
import com.qveto.milesora.repository.TaskRepository;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final TaskRepository taskRepository;

    public DashboardService(
            ProjectRepository projectRepository,
            ProjectMemberRepository memberRepository,
            TaskRepository taskRepository) {

        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.taskRepository = taskRepository;
    }

    public DashboardResponse getDashboard(Long userId) {

        DashboardResponse response = new DashboardResponse();

        Map<Long, Project> projects = new LinkedHashMap<>();

        // Projects created by the user
        for (Project project :
                projectRepository.findAllByCreatedBy_Id(userId)) {

            projects.put(project.getId(), project);
        }

        // Projects joined by the user
        for (ProjectMember member :
                memberRepository.findAllByUser_Id(userId)) {

            Project project = member.getProject();
            projects.put(project.getId(), project);
        }

        List<Project> userProjects = List.copyOf(projects.values());

        response.setTotalProjects(userProjects.size());

        long activeProjects = 0;
        long completedProjects = 0;

        long totalTasks = 0;
        long todoTasks = 0;
        long inProgressTasks = 0;
        long inReviewTasks = 0;
        long completedTasks = 0;
        long blockedTasks = 0;

        long assignedTasks = 0;
        long overdueTasks = 0;

        LocalDate today = LocalDate.now();

        for (Project project : userProjects) {

            if (project.getStatus() == ProjectStatus.ACTIVE) {
                activeProjects++;
            }

            if (project.getStatus() == ProjectStatus.COMPLETED) {
                completedProjects++;
            }

            List<Task> tasks =
                    taskRepository.findAllByProject_Id(project.getId());

            for (Task task : tasks) {

                totalTasks++;

                if (task.getStatus() == TaskStatus.TODO) {
                    todoTasks++;
                }

                if (task.getStatus() == TaskStatus.IN_PROGRESS) {
                    inProgressTasks++;
                }

                if (task.getStatus() == TaskStatus.IN_REVIEW) {
                    inReviewTasks++;
                }

                if (task.getStatus() == TaskStatus.COMPLETED) {
                    completedTasks++;
                }

                if (task.getStatus() == TaskStatus.BLOCKED) {
                    blockedTasks++;
                }

                if (task.getAssignedTo() != null
                        && task.getAssignedTo().getId().equals(userId)) {
                    assignedTasks++;
                }

                if (task.getDueDate() != null
                        && task.getDueDate().isBefore(today)
                        && task.getStatus() != TaskStatus.COMPLETED) {
                    overdueTasks++;
                }
            }
        }

        response.setActiveProjects(activeProjects);
        response.setCompletedProjects(completedProjects);

        response.setTotalTasks(totalTasks);
        response.setTodoTasks(todoTasks);
        response.setInProgressTasks(inProgressTasks);
        response.setInReviewTasks(inReviewTasks);
        response.setCompletedTasks(completedTasks);
        response.setBlockedTasks(blockedTasks);

        response.setAssignedTasks(assignedTasks);
        response.setOverdueTasks(overdueTasks);

        return response;
    }
}