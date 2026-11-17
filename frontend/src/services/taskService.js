import { apiClient } from './apiClient';
import { mockAdapter } from './mockAdapter';
import { isDemoMode } from './modeConfig';

export const taskService = {
  async getAll(params = {}) {
    if (isDemoMode()) {
      return mockAdapter.getTasks(params);
    }

    // First fetch all projects accessible to the logged-in user.
    const projects = await apiClient.get('/projects');

    if (!Array.isArray(projects) || projects.length === 0) {
      return [];
    }

    // Fetch tasks separately for each project.
    const taskLists = await Promise.all(
      projects.map(async (project) => {
        const tasks = await apiClient.get(
          `/projects/${project.id}/tasks`
        );

        if (!Array.isArray(tasks)) {
          return [];
        }

        return tasks.map((task) => ({
          ...task,
          projectId: project.id,
          projectName: project.name,
          assignee: task.assignedToId
            ? {
              id: task.assignedToId,
              name: task.assignedToName
            }
            : null
        }));
      })
    );

    return taskLists.flat();
  },

  async create(data) {
    if (isDemoMode()) {
      return mockAdapter.createTask(data);
    }
    return apiClient.post('/tasks', data);
  },

  async update(id, data) {
    if (isDemoMode()) {
      return mockAdapter.updateTask(id, data);
    }
    return apiClient.put(`/tasks/${id}`, data);
  },

  async updateStatus(id, status) {
    if (isDemoMode()) {
      return mockAdapter.updateTaskStatus(id, status);
    }
    return apiClient.patch(`/tasks/${id}/status`, { status });
  },

  async delete(id) {
    if (isDemoMode()) {
      return mockAdapter.deleteTask(id);
    }
    return apiClient.delete(`/tasks/${id}`);
  },

  async getComments(taskId) {
    if (isDemoMode()) {
      return mockAdapter.getComments(taskId);
    }
    return apiClient.get(`/tasks/${taskId}/comments`);
  },

  async addComment(taskId, content, user) {
    if (isDemoMode()) {
      return mockAdapter.addComment(taskId, content, user);
    }
    return apiClient.post(`/tasks/${taskId}/comments`, { content });
  },

  async getAttachments(taskId) {
    if (isDemoMode()) {
      return mockAdapter.getAttachments(taskId);
    }
    return apiClient.get(`/tasks/${taskId}/attachments`);
  },

  async uploadAttachment(taskId, file, user) {
    if (isDemoMode()) {
      return mockAdapter.addAttachment(taskId, file, user);
    }

    const formData = new FormData();
    formData.append('file', file);

    return apiClient.upload(`/tasks/${taskId}/attachments`, formData);
  },

  async getTimeEntries(taskId) {
    if (isDemoMode()) {
      return mockAdapter.getTimeEntries(taskId);
    }
    return apiClient.get(`/tasks/${taskId}/time-entries`);
  },

  async logTime(taskId, data, user) {
    if (isDemoMode()) {
      return mockAdapter.logTime(taskId, data, user);
    }
    return apiClient.post(`/tasks/${taskId}/time-entries`, data);
  }
};
