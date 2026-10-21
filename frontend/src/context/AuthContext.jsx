import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { isDemoMode } from '../services/modeConfig';
import { mockAdapter } from '../services/mockAdapter';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('taskora_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => sessionStorage.getItem('taskora_auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        if (token) {
          const profile = await authService.getCurrentUser();
          if (profile) {
            setUser(profile);
            sessionStorage.setItem('taskora_current_user', JSON.stringify(profile));
          }
        }
      } catch (err) {
        console.error('Failed to load user session:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    // Listen for unauthorized 401 events from apiClient
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('taskora:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('taskora:unauthorized', handleUnauthorized);
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    setUser(res.user);
    setToken(res.token);
    sessionStorage.setItem('taskora_current_user', JSON.stringify(res.user));
    sessionStorage.setItem('taskora_auth_token', res.token);
    return res;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    setUser(res.user);
    setToken(res.token);
    sessionStorage.setItem('taskora_current_user', JSON.stringify(res.user));
    sessionStorage.setItem('taskora_auth_token', res.token);
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  // Allows instant reviewer perspective switching between Admin, PM, and Employee
  const switchRoleForDemo = (newRole) => {
    if (!isDemoMode()) return;
    const db = mockAdapter.getDb();
    if (!db) return;
    const targetUser = db.users.find(u => u.role === newRole) || {
      ...user,
      role: newRole,
      title: newRole === 'ADMIN' ? 'System Administrator' : newRole === 'PROJECT_MANAGER' ? 'Project Manager' : 'Software Engineer'
    };
    setUser(targetUser);
    sessionStorage.setItem('taskora_current_user', JSON.stringify(targetUser));
  };

  const updateUserProfile = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    sessionStorage.setItem('taskora_current_user', JSON.stringify(updated));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    switchRoleForDemo,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
