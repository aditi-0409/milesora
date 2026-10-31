
import { apiClient } from './apiClient';
import { mockAdapter } from './mockAdapter';
import { isDemoMode } from './modeConfig';
import { calculateProjectHealth } from '../utils/riskEngine';

export const dashboardService = {
  async getDashboardData(user) {
    // Demo mode: use mock data.
    if (isDemoMode()) {
      const db = mockAdapter.getDb();
      const allTasks = db.tasks;
      const allProjects = db.projects;
      const allUsers = db.users;

      const totalUsers = allUsers.length;
      const totalProjects = allProjects.length;

      const activeProjects = allProjects.filter(
        p => p.status === 'ACTIVE'
      ).length;

      const completedProjects = allProjects.filter(
        p => p.status === 'COMPLETED'
      ).length;

      const totalTasks = allTasks.length;

      const completedTasks = allTasks.filter(
        t => t.status === 'COMPLETED'
      ).length;

      const inProgressTasks = allTasks.filter(
        t => t.status === 'IN_PROGRESS'
      ).length;

      const inReviewTasks = allTasks.filter(
        t => t.status === 'IN_REVIEW'
      ).length;

      const toDoTasks = allTasks.filter(
        t => t.status === 'TO_DO'
      ).length;

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const isOverdue = task => {
        if (task.status === 'COMPLETED' || !task.dueDate) {
          return false;
        }

        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        return dueDate < now;
      };

      const overdueTasks = allTasks.filter(isOverdue);

      const tasksDueToday = allTasks.filter(task => {
        if (task.status === 'COMPLETED' || !task.dueDate) {
          return false;
        }

        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        return dueDate.getTime() === now.getTime();
      });

      const blockedTasks = allTasks.filter(task => {
        if (
          task.status === 'COMPLETED' ||
          !task.dependencyIds?.length
        ) {
          return false;
        }

        return allTasks.some(
          dependency =>
            task.dependencyIds.includes(dependency.id) &&
            dependency.status !== 'COMPLETED'
        );
      });

      const currentUserId = user?.id ?? 1;

      const myAssignedTasks = allTasks.filter(
        task =>
          (task.assignee?.id ?? task.assigneeId) === currentUserId
      );

      const myActiveTasks = myAssignedTasks.filter(
        task => task.status !== 'COMPLETED'
      );

      const myCompletedTasks = myAssignedTasks.filter(
        task => task.status === 'COMPLETED'
      );

      const myOverdueTasks = myAssignedTasks.filter(isOverdue);

      const health = calculateProjectHealth(allTasks, allTasks);

      const managedProjects = allProjects.filter(
        project =>
          (project.manager?.id ?? project.managerId) === currentUserId
      );

      return {
        totalUsers,
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        completedTasks,
        inProgressTasks,
        inReviewTasks,
        toDoTasks,
        overdueCount: overdueTasks.length,
        overdueTasks,
        tasksDueTodayCount: tasksDueToday.length,
        tasksDueToday,
        blockedCount: blockedTasks.length,
        blockedTasks,
        overallCompletionRate:
          totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0,
        teamHealthScore: health.healthScore,
        healthStatus: health.healthStatus,
        recentActivity: db.activityLog.slice(0, 8),

        // Employee statistics
        myAssignedCount: myAssignedTasks.length,
        myActiveTasks,
        myCompletedCount: myCompletedTasks.length,
        myOverdueCount: myOverdueTasks.length,
        myOverdueTasks,

        // Project manager statistics
        managedProjects:
          managedProjects.length > 0
            ? managedProjects
            : allProjects.slice(0, 3),
      };
    }

    // Real backend mode: fetch data from Spring Boot.
    try {
      const response = await apiClient.get('/dashboard/stats');

      console.log('Dashboard statistics received from backend:', response);

      return response;
    } catch (error) {
      console.error('Dashboard API request failed:', error);
      throw error;
    }
  },
};
