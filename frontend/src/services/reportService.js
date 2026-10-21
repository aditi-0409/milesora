import { taskService } from './taskService';
import { projectService } from './projectService';
import { userService } from './userService';
import { calculateProjectHealth } from '../utils/riskEngine';

export const reportService = {
  async getReportData(filters = {}) {
    const [tasks, projects, users] = await Promise.all([
      taskService.getAll(filters),
      projectService.getAll(),
      userService.getAll()
    ]);

    // Tasks by Status
    const statusCounts = {
      TO_DO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      COMPLETED: 0
    };
    tasks.forEach(t => {
      if (statusCounts[t.status] !== undefined) {
        statusCounts[t.status]++;
      }
    });

    const statusChartData = [
      { name: 'To Do', count: statusCounts.TO_DO, fill: '#94a3b8' },
      { name: 'In Progress', count: statusCounts.IN_PROGRESS, fill: '#3b82f6' },
      { name: 'In Review', count: statusCounts.IN_REVIEW, fill: '#f97316' },
      { name: 'Completed', count: statusCounts.COMPLETED, fill: '#10b981' }
    ];

    // Tasks by Priority
    const priorityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    tasks.forEach(t => {
      if (priorityCounts[t.priority] !== undefined) {
        priorityCounts[t.priority]++;
      }
    });

    const priorityChartData = [
      { name: 'Low', count: priorityCounts.LOW, fill: '#64748b' },
      { name: 'Medium', count: priorityCounts.MEDIUM, fill: '#0ea5e9' },
      { name: 'High', count: priorityCounts.HIGH, fill: '#f59e0b' },
      { name: 'Critical', count: priorityCounts.CRITICAL, fill: '#f43f5e' }
    ];

    // Project Completion breakdown
    const projectProgressData = projects.map(p => {
      const pTasks = tasks.filter(t => t.projectId === p.id);
      const total = pTasks.length;
      const completed = pTasks.filter(t => t.status === 'COMPLETED').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        name: p.key || p.name.substring(0, 10),
        fullName: p.name,
        progress,
        totalTasks: total,
        completedTasks: completed
      };
    });

    // Team Workload
    const teamWorkloadData = users.map(u => {
      const assigned = tasks.filter(t => (t.assignee?.id || t.assigneeId) === u.id && t.status !== 'COMPLETED').length;
      const completed = tasks.filter(t => (t.assignee?.id || t.assigneeId) === u.id && t.status === 'COMPLETED').length;
      return {
        name: u.name.split(' ')[0],
        fullName: u.name,
        activeTasks: assigned,
        completedTasks: completed
      };
    });

    // Health and risk distribution
    const health = calculateProjectHealth(tasks, tasks);

    return {
      rawTasks: tasks,
      statusChartData,
      priorityChartData,
      projectProgressData,
      teamWorkloadData,
      health,
      summary: {
        totalTasks: tasks.length,
        completedTasks: statusCounts.COMPLETED,
        completionRate: tasks.length > 0 ? Math.round((statusCounts.COMPLETED / tasks.length) * 100) : 0,
        overdueCount: health.overdueCount,
        blockedCount: health.blockedCount
      }
    };
  },

  exportToCsv(tasks = [], filename = 'taskora_pulse_report.csv') {
    if (!tasks || tasks.length === 0) {
      alert('No data available to export with the current filter settings.');
      return;
    }

    const headers = [
      'Task ID',
      'Title',
      'Project',
      'Status',
      'Priority',
      'Assignee',
      'Due Date',
      'Estimated Hours',
      'Spent Hours',
      'Created Date'
    ];

    const rows = tasks.map(t => [
      `"${t.taskCode || t.id}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.projectName || '').replace(/"/g, '""')}"`,
      `"${t.status}"`,
      `"${t.priority}"`,
      `"${t.assignee ? t.assignee.name : 'Unassigned'}"`,
      `"${t.dueDate || ''}"`,
      t.estimatedHours || 0,
      t.spentHours || 0,
      `"${t.createdAt ? t.createdAt.split('T')[0] : ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
