import { apiClient } from './apiClient';
import { mockAdapter } from './mockAdapter';
import { isDemoMode } from './modeConfig';

export const userService = {
  async getAll() {
    if (isDemoMode()) {
      return mockAdapter.getUsers();
    }

    // Get all projects accessible to the logged-in user.
    const projects = await apiClient.get('/projects');

    if (!Array.isArray(projects) || projects.length === 0) {
      return [];
    }

    // Fetch members from each accessible project.
    const memberLists = await Promise.all(
      projects.map(async (project) => {
        const members = await apiClient.get(
          `/projects/${project.id}/members`
        );

        if (!Array.isArray(members)) {
          return [];
        }

        return members.map((member) => ({
          id: member.userId,
          name: member.name || '',
          email: member.email || '',
          role: member.role,
          projectIds: [project.id],
          projectNames: [project.name].filter(Boolean),
          joinedAt: member.joinedAt
        }));
      })
    );

    // Combine members and remove duplicate users.
    const usersById = new Map();

    memberLists.flat().forEach((member) => {
      const existing = usersById.get(member.id);

      if (existing) {
        existing.projectIds = [
          ...new Set([...existing.projectIds, ...member.projectIds])
        ];

        existing.projectNames = [
          ...new Set([...existing.projectNames, ...member.projectNames])
        ];
      } else {
        usersById.set(member.id, member);
      }
    });

    return Array.from(usersById.values());
  },

  async updateProfile(userId, data) {
    if (isDemoMode()) {
      const db = mockAdapter.getDb();
      const user = db.users.find(
        (u) => u.id === Number(userId)
      );

      if (user) {
        Object.assign(user, data);
        mockAdapter.saveDb(db);

        const current = JSON.parse(
          sessionStorage.getItem('taskora_current_user') || '{}'
        );

        if (current.id === user.id) {
          sessionStorage.setItem(
            'taskora_current_user',
            JSON.stringify({ ...current, ...user })
          );
        }
      }

      return user;
    }

    return apiClient.put(`/users/${userId}`, data);
  }
};
