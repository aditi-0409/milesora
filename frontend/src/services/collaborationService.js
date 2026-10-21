import { apiClient } from './apiClient';
import { mockAdapter } from './mockAdapter';
import { isDemoMode } from './modeConfig';

export const collaborationService = {
  async getActivityTimeline() {
    if (isDemoMode()) {
      return mockAdapter.getActivityLog();
    }
    return apiClient.get('/collaboration/activity');
  },

  async getDiscussions() {
    if (isDemoMode()) {
      const db = mockAdapter.getDb();
      return [
        {
          id: 1,
          title: 'Sprint 24 Architectural Sync & Cloud Migration Milestones',
          author: db.users[0],
          category: 'Architecture',
          content: 'Team, please review the revised Redis cluster architecture and ensure security groups permit ingress from our ECS cluster subnets only.',
          repliesCount: 4,
          createdAt: '2026-10-14T09:00:00Z',
          pinned: true
        },
        {
          id: 2,
          title: 'Mobile App V2 Biometric QA Protocol',
          author: db.users[3],
          category: 'QA & Testing',
          content: 'We have configured automated test suites across iOS 17 and Android 14. Please submit pull requests to the staging branch for smoke test validation.',
          repliesCount: 2,
          createdAt: '2026-10-13T15:30:00Z',
          pinned: false
        }
      ];
    }
    return apiClient.get('/collaboration/discussions');
  },

  async postDiscussion(data, user) {
    if (isDemoMode()) {
      const db = mockAdapter.getDb();
      const newDisc = {
        id: Date.now(),
        title: data.title,
        category: data.category || 'General',
        content: data.content,
        author: user || db.users[0],
        repliesCount: 0,
        createdAt: new Date().toISOString(),
        pinned: false
      };
      return newDisc;
    }
    return apiClient.post('/collaboration/discussions', data);
  }
};
