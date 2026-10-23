import { apiClient } from './apiClient';
import { mockAdapter } from './mockAdapter';
import { isDemoMode } from './modeConfig';

export const notificationService = {
  async getAll(userId) {
    if (isDemoMode()) {
      return mockAdapter.getNotifications(userId);
    }
    return apiClient.get('/notifications');
  },

  async markAsRead(id) {
    if (isDemoMode()) {
      return mockAdapter.markNotificationAsRead(id);
    }
    return apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    if (isDemoMode()) {
      return mockAdapter.markAllNotificationsAsRead();
    }
    return apiClient.patch('/notifications/read-all');
  }
};
