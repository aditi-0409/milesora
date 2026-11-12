package com.qveto.milesora.report;

public class ProjectOverviewReport {

    private Long projectId;

    private long totalTasks;
    private long todoTasks;
    private long inProgressTasks;
    private long inReviewTasks;
    private long completedTasks;
    private long blockedTasks;
    private long overdueTasks;

    private double totalLoggedHours;

    public ProjectOverviewReport() {
    }

    public ProjectOverviewReport(
            Long projectId,
            long totalTasks,
            long todoTasks,
            long inProgressTasks,
            long inReviewTasks,
            long completedTasks,
            long blockedTasks,
            long overdueTasks,
            double totalLoggedHours) {

        this.projectId = projectId;
        this.totalTasks = totalTasks;
        this.todoTasks = todoTasks;
        this.inProgressTasks = inProgressTasks;
        this.inReviewTasks = inReviewTasks;
        this.completedTasks = completedTasks;
        this.blockedTasks = blockedTasks;
        this.overdueTasks = overdueTasks;
        this.totalLoggedHours = totalLoggedHours;
    }

    public Long getProjectId() {
        return projectId;
    }

    public long getTotalTasks() {
        return totalTasks;
    }

    public long getTodoTasks() {
        return todoTasks;
    }

    public long getInProgressTasks() {
        return inProgressTasks;
    }

    public long getInReviewTasks() {
        return inReviewTasks;
    }

    public long getCompletedTasks() {
        return completedTasks;
    }

    public long getBlockedTasks() {
        return blockedTasks;
    }

    public long getOverdueTasks() {
        return overdueTasks;
    }

    public double getTotalLoggedHours() {
        return totalLoggedHours;
    }
}