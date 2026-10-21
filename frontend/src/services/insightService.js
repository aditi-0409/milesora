import { apiClient } from './apiClient';
import { mockAdapter } from './mockAdapter';
import { isDemoMode } from './modeConfig';
import { calculateProjectHealth, calculateTaskRisk } from '../utils/riskEngine';

export const insightService = {
  async getProjectInsights(projectId) {
    if (isDemoMode()) {
      const db = mockAdapter.getDb();
      const allTasks = db.tasks;
      const project = db.projects.find(p => p.id === Number(projectId));
      const projectTasks = allTasks.filter(t => t.projectId === Number(projectId));

      // Build active counts map
      const memberActiveCounts = {};
      allTasks.forEach(t => {
        if (t.status !== 'COMPLETED') {
          const id = t.assignee?.id || t.assigneeId;
          if (id) {
            memberActiveCounts[id] = (memberActiveCounts[id] || 0) + 1;
          }
        }
      });

      const health = calculateProjectHealth(projectTasks, allTasks, memberActiveCounts);

      const atRiskTasks = projectTasks
        .map(t => {
          const risk = calculateTaskRisk(t, allTasks, memberActiveCounts);
          return {
            taskId: t.id,
            taskCode: t.taskCode,
            title: t.title,
            priority: t.priority,
            dueDate: t.dueDate,
            assignee: t.assignee,
            riskScore: risk.score,
            riskLevel: risk.level,
            reason: risk.reasons.join(' '),
            factors: risk.factors,
            recommendedAction: risk.recommendedAction
          };
        })
        .filter(t => t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL')
        .sort((a, b) => b.riskScore - a.riskScore);

      const teamWorkloadWarnings = db.users
        .map(u => ({
          userId: u.id,
          userName: u.name,
          activeTasksCount: memberActiveCounts[u.id] || 0,
          threshold: 4,
          status: (memberActiveCounts[u.id] || 0) >= 5 ? 'OVERLOADED' : 'OPTIMAL'
        }))
        .filter(w => w.status === 'OVERLOADED');

      return {
        projectId: project ? project.id : null,
        projectName: project ? project.name : 'All Projects',
        healthScore: health.healthScore,
        healthStatus: health.healthStatus,
        riskDistribution: health.riskDistribution,
        atRiskTasks,
        teamWorkloadWarnings,
        overdueCount: health.overdueCount,
        blockedCount: health.blockedCount
      };
    }

    return apiClient.get(`/insights/projects/${projectId}`);
  },

  async getGlobalInsights() {
    if (isDemoMode()) {
      const db = mockAdapter.getDb();
      const allTasks = db.tasks;

      const memberActiveCounts = {};
      allTasks.forEach(t => {
        if (t.status !== 'COMPLETED') {
          const id = t.assignee?.id || t.assigneeId;
          if (id) {
            memberActiveCounts[id] = (memberActiveCounts[id] || 0) + 1;
          }
        }
      });

      const health = calculateProjectHealth(allTasks, allTasks, memberActiveCounts);

      const atRiskTasks = allTasks
        .map(t => {
          const risk = calculateTaskRisk(t, allTasks, memberActiveCounts);
          return {
            taskId: t.id,
            taskCode: t.taskCode,
            title: t.title,
            priority: t.priority,
            dueDate: t.dueDate,
            assignee: t.assignee,
            projectId: t.projectId,
            projectName: t.projectName,
            riskScore: risk.score,
            riskLevel: risk.level,
            reason: risk.reasons.join(' '),
            factors: risk.factors,
            recommendedAction: risk.recommendedAction
          };
        })
        .filter(t => t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL')
        .sort((a, b) => b.riskScore - a.riskScore);

      return {
        healthScore: health.healthScore,
        healthStatus: health.healthStatus,
        riskDistribution: health.riskDistribution,
        atRiskTasks,
        overdueCount: health.overdueCount,
        blockedCount: health.blockedCount,
        totalEvaluated: allTasks.length
      };
    }

    return apiClient.get('/insights/global');
  }
};
