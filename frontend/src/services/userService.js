import { apiClient } from './apiClient';
import { mockAdapter } from './mockAdapter';
import { isDemoMode } from './modeConfig';

export const userService = {
  async getAll() {
    if (isDemoMode()) {
      return mockAdapter.getUsers();
    }
    return apiClient.get('/team');
  },

  async updateProfile(userId, data) {
    if (isDemoMode()) {
      const db = mockAdapter.getDb();
      const user = db.users.find(u => u.id === Number(userId));
      if (user) {
        Object.assign(user, data);
        mockAdapter.saveDb(db);
        // update local session if matching
        const current = JSON.parse(sessionStorage.getItem('taskora_current_user') || '{}');
        if (current.id === user.id) {
          sessionStorage.setItem('taskora_current_user', JSON.stringify({ ...current, ...user }));
        }
      }
      return user;
    }
    return apiClient.put(`/users/${userId}`, data);
  }
};
