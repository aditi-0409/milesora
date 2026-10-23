import { apiClient } from './apiClient';
import { mockAdapter } from './mockAdapter';
import { isDemoMode } from './modeConfig';

export const projectService = {
  async getAll(params = {}) {
    if (isDemoMode()) {
      return mockAdapter.getProjects();
    }
    return apiClient.get('/projects', params);
  },

  async getById(id) {
    if (isDemoMode()) {
      return mockAdapter.getProjectById(id);
    }
    return apiClient.get(`/projects/${id}`);
  },

  async create(data) {
    if (isDemoMode()) {
      return mockAdapter.createProject(data);
    }
    return apiClient.post('/projects', data);
  },

  async update(id, data) {
    if (isDemoMode()) {
      return mockAdapter.updateProject(id, data);
    }
    return apiClient.put(`/projects/${id}`, data);
  },

  async delete(id) {
    if (isDemoMode()) {
      return mockAdapter.deleteProject(id);
    }
    return apiClient.delete(`/projects/${id}`);
  }
};
