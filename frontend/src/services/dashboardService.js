import { apiClient } from './apiClient';
import { mockAdapter } from './mockAdapter';
import { isDemoMode } from './modeConfig';
import { calculateProjectHealth } from '../utils/riskEngine';

export const dashboardService = {
  async getDashboardData(user) {
    if (isDemoMode()) {
      const db = mockAdapter.getDb();
      const allTasks = db.tasks;
      const allProjects = db.projects;
      const allUsers = db.users;

      const totalUsers = allUsers.length;
      const totalProjects = allProjects.length;
      const activeProjects = allProjects.filter(p => p.status === 'ACTIVE').length;
      const completedProjects = allProjects.filter(p => p.status === 'COMPLETED').length;

      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(t => t.status === 'COMPLETED').length;
      const inProgressTasks = allTasks.filter(t => t.status === 'IN_PROGRESS').length;
      const inReviewTasks = allTasks.filter(t => t.status === 'IN_REVIEW').length;
      const toDoTasks = allTasks.filter(t => t.status === 'TO_DO').length;

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const overdueTasks = allTasks.filter(t => {
        if (t.status === 'COMPLETED' || !t.dueDate) return false;
        const d = new Date(t.dueDate);
        d.setHours(0, 0, 0, 0);
        return d < now;
      });

      const tasksDueToday = allTasks.filter(t => {
        if (t.status === 'COMPLETED' || !t.dueDate) return false;
        const d = new Date(t.dueDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === now.getTime();
      });

      const blockedTasks = allTasks.filter(t => {
        if (t.status === 'COMPLETED' || !t.dependencyIds || t.dependencyIds.length === 0) return false;
        return allTasks.some(p => t.dependencyIds.includes(p.id) && p.status !== 'COMPLETED');
      });

      // User-specific
      const currentUserId = user?.id || 1;
      const myAssignedTasks = allTasks.filter(t => (t.assignee?.id || t.assigneeId) === currentUserId);
      const myActiveTasks = myAssignedTasks.filter(t => t.status !== 'COMPLETED');
      const myCompletedTasks = myAssignedTasks.filter(t => t.status === 'COMPLETED');
      const myOverdueTasks = myAssignedTasks.filter(t => {
        if (t.status === 'COMPLETED' || !t.dueDate) return false;
        const d = new Date(t.dueDate);
        d.setHours(0, 0, 0, 0);
        return d < now;
      });

      const health = calculateProjectHealth(allTasks, allTasks);

      // Managed projects for PM
      const managedProjects = allProjects.filter(p => p.manager?.id === currentUserId || p.managerId === currentUserId);

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
        overallCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        teamHealthScore: health.healthScore,
        healthStatus: health.healthStatus,
        recentActivity: db.activityLog.slice(0, 8),
        // Employee specifics
        myAssignedCount: myAssignedTasks.length,
        myActiveTasks,
        myCompletedCount: myCompletedTasks.length,
        myOverdueCount: myOverdueTasks.length,
        myOverdueTasks,
        // PM specifics
        managedProjects: managedProjects.length > 0 ? managedProjects : allProjects.slice(0, 3),
      };
    }

    return apiClient.get('/dashboard/stats');
  }
};
