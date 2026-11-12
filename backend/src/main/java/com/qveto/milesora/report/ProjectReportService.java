package com.qveto.milesora.report;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.qveto.milesora.entity.Project;
import com.qveto.milesora.entity.Task;
import com.qveto.milesora.entity.TaskStatus;
import com.qveto.milesora.entity.TimeEntry;
import com.qveto.milesora.repository.ProjectMemberRepository;
import com.qveto.milesora.repository.ProjectRepository;
import com.qveto.milesora.repository.TaskRepository;
import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.Role;
import com.qveto.milesora.repository.AppUserRepository;

@Service
@Transactional(readOnly = true)
public class ProjectReportService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final TaskRepository taskRepository;
    private final ReportRepository reportRepository;
    private final AppUserRepository userRepository;

    public ProjectReportService(
            ProjectRepository projectRepository,
            ProjectMemberRepository memberRepository,
            TaskRepository taskRepository,
            ReportRepository reportRepository,
            AppUserRepository userRepository) {

        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.taskRepository = taskRepository;
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
    }

    public ProjectOverviewReport getProjectOverview(
            Long projectId, Long requesterId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Project not found"));

        validateReportAccess(project, requesterId);

        List<Task> tasks =
                taskRepository.findAllByProject_Id(projectId);

        long todo = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.TODO)
                .count();

        long inProgress = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.IN_PROGRESS)
                .count();

        long inReview = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.IN_REVIEW)
                .count();

        long completed = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.COMPLETED)
                .count();

        long blocked = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.BLOCKED)
                .count();

        long overdue = tasks.stream()
                .filter(task ->
                        task.getDueDate() != null
                        && task.getDueDate().isBefore(LocalDate.now())
                        && task.getStatus() != TaskStatus.COMPLETED)
                .count();

        List<TimeEntry> timeEntries =
                reportRepository.findAllTimeEntriesByProjectId(projectId);

        double totalHours = timeEntries.stream()
                .mapToDouble(TimeEntry::getHours)
                .sum();

        return new ProjectOverviewReport(
                projectId,
                tasks.size(),
                todo,
                inProgress,
                inReview,
                completed,
                blocked,
                overdue,
                totalHours);
    }

    private void validateReportAccess(
            Project project, Long requesterId) {

        AppUser requester = userRepository.findById(requesterId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        // Global Admin can view reports for any project.
        if (requester.getRole() == Role.ADMIN) {
            return;
        }

        // Project creator can view the report.
        boolean isOwner = project.getCreatedBy()
                .getId().equals(requesterId);

        // Project members can view the report.
        boolean isMember = memberRepository
                .existsByProject_IdAndUser_Id(
                        project.getId(), requesterId);

        if (!isOwner && !isMember) {
            throw new SecurityException(
                    "You do not have permission to view this project's reports");
        }
    }
}