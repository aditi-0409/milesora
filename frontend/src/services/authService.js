import { apiClient } from './apiClient';
import { mockAdapter } from './mockAdapter';
import { isDemoMode } from './modeConfig';

export const authService = {
  async login(email, password) {
    if (isDemoMode()) {
      const res = await mockAdapter.login(email, password);
      apiClient.setToken(res.token);
      return res;
    }
    // Live Spring Boot call: POST /auth/login
    const res = await apiClient.post('/auth/login', { email, password });
    if (res && res.token) {
      apiClient.setToken(res.token);
    }
    return res;
  },

  async register(data) {
    if (isDemoMode()) {
      const res = await mockAdapter.register(data);
      apiClient.setToken(res.token);
      return res;
    }
    // Live Spring Boot call: POST /auth/register
    const res = await apiClient.post('/auth/register', data);
    if (res && res.token) {
      apiClient.setToken(res.token);
    }
    return res;
  },

  async getCurrentUser() {
    if (isDemoMode()) {
      // In demo mode, return the current mock session
      const savedUser = sessionStorage.getItem('taskora_current_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          // fallback
        }
      }
      const db = mockAdapter.getDb();
      return db ? db.users[0] : null;
    }
    // Live Spring Boot call: GET /auth/me
    return apiClient.get('/auth/me');
  },

  logout() {
    apiClient.setToken(null);
    sessionStorage.removeItem('taskora_current_user');
  }
};
