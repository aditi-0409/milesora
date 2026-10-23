import { 
  INITIAL_USERS, 
  INITIAL_PROJECTS, 
  INITIAL_TASKS, 
  INITIAL_COMMENTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_ACTIVITY_LOG 
} from '../data/mockData';

const STORAGE_KEY = 'taskora_pulse_mock_db_v1';

class MockAdapter {
  constructor() {
    this.initDatabase();
  }

  initDatabase(forceReset = false) {
    if (forceReset || !localStorage.getItem(STORAGE_KEY)) {
      const initialDb = {
        users: [...INITIAL_USERS],
        projects: [...INITIAL_PROJECTS],
        tasks: [...INITIAL_TASKS],
        comments: [...INITIAL_COMMENTS],
        notifications: [...INITIAL_NOTIFICATIONS],
        activityLog: [...INITIAL_ACTIVITY_LOG],
        timeEntries: [
          { id: 1, taskId: 102, userId: 2, hours: 4.5, description: 'Redis cluster setup and latency benchmark', date: '2026-10-13' },
          { id: 2, taskId: 101, userId: 2, hours: 8, description: 'Subnet routing and CIDR block allocation', date: '2026-08-15' }
        ],
        attachments: [
          { id: 1, taskId: 102, fileName: 'redis_cluster_topology.png', fileSize: '1.2 MB', fileType: 'image/png', uploadedBy: 'Alex Rivera', createdAt: '2026-10-13T10:00:00Z' },
          { id: 2, taskId: 202, fileName: 'biometric_security_spec.pdf', fileSize: '2.4 MB', fileType: 'application/pdf', uploadedBy: 'Sarah Connor', createdAt: '2026-10-11T11:45:00Z' }
        ]
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDb));
    }
  }

  getDb() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  saveDb(db) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  async delay(ms = 180) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // --- Auth Mock ---
  async login(email, password) {
    await this.delay();
    const db = this.getDb();
    // Accepts the full email or just the username part before the "@"
    const identifier = String(email || '').trim().toLowerCase();
    const user = db.users.find(u => {
      const mail = String(u.email || '').toLowerCase();
      return mail === identifier || mail.split('@')[0] === identifier;
    });
    
    if (!user) {
      const error = new Error('Invalid username or password');
      error.status = 401;
      throw error;
    }

    return {
      token: `demo-jwt-token-role-${user.role.toLowerCase()}-${user.id}`,
      type: 'Bearer',
      user
    };
  }

  async register(data) {
    await this.delay();
    const db = this.getDb();
    if (db.users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      const error = new Error('An account with this email already exists.');
      error.status = 409;
      throw error;
    }

    const fullName = data.name || [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');
    const newUser = {
      id: Date.now(),
      name: fullName,
      firstName: data.firstName || '',
      middleName: data.middleName || '',
      lastName: data.lastName || '',
      email: data.email,
      phone: data.phone || '',
      dob: data.dob || '',
      role: data.role || 'EMPLOYEE',
      title: data.title || (data.role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Team Member'),
      avatar: data.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      department: data.department || 'Engineering',
      activeWorkload: 'OPTIMAL',
      assignedTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    this.saveDb(db);

    return {
      token: `demo-jwt-token-role-${newUser.role.toLowerCase()}-${newUser.id}`,
      type: 'Bearer',
      user: newUser
    };
  }

  // --- Projects Mock ---
  async getProjects() {
    await this.delay();
    const db = this.getDb();
    // Calculate real stats for each project from actual tasks
    return db.projects.map(proj => {
      const projTasks = db.tasks.filter(t => t.projectId === proj.id);
      const total = projTasks.length;
      const completed = projTasks.filter(t => t.status === 'COMPLETED').length;
      const inProgress = projTasks.filter(t => t.status === 'IN_PROGRESS').length;
      const toDo = projTasks.filter(t => t.status === 'TO_DO').length;
      const inReview = projTasks.filter(t => t.status === 'IN_REVIEW').length;
      const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...proj,
        taskStats: { total, completed, inProgress, toDo, inReview, progressPercentage }
      };
    });
  }

  async getProjectById(id) {
    await this.delay();
    const db = this.getDb();
    const project = db.projects.find(p => p.id === Number(id));
    if (!project) {
      const error = new Error('Project not found');
      error.status = 404;
      throw error;
    }
    const projTasks = db.tasks.filter(t => t.projectId === project.id);
    const total = projTasks.length;
    const completed = projTasks.filter(t => t.status === 'COMPLETED').length;
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      ...project,
      taskStats: { total, completed, progressPercentage },
      members: db.users.filter(u => (project.memberIds || []).includes(u.id))
    };
  }

  async createProject(data) {
    await this.delay();
    const db = this.getDb();
    const manager = db.users.find(u => u.id === Number(data.managerId)) || db.users[0];
    const newProject = {
      id: Date.now(),
      name: data.name,
      key: data.key ? data.key.toUpperCase() : data.name.substring(0, 3).toUpperCase(),
      description: data.description || '',
      status: data.status || 'PLANNING',
      priority: data.priority || 'MEDIUM',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate,
      manager,
      memberIds: data.memberIds && data.memberIds.length ? data.memberIds.map(Number) : [manager.id],
      createdAt: new Date().toISOString()
    };

    db.projects.unshift(newProject);
    db.activityLog.unshift({
      id: Date.now(),
      user: manager,
      action: 'CREATED_PROJECT',
      target: newProject.name,
      detail: `Created project with status ${newProject.status}`,
      projectId: newProject.id,
      timestamp: new Date().toISOString()
    });

    this.saveDb(db);
    return newProject;
  }

  async updateProject(id, data) {
    await this.delay();
    const db = this.getDb();
    const idx = db.projects.findIndex(p => p.id === Number(id));
    if (idx === -1) {
      const error = new Error('Project not found');
      error.status = 404;
      throw error;
    }

    const current = db.projects[idx];
    const updated = {
      ...current,
      ...data,
      key: data.key ? data.key.toUpperCase() : current.key,
      memberIds: data.memberIds ? data.memberIds.map(Number) : current.memberIds
    };

    db.projects[idx] = updated;
    this.saveDb(db);
    return updated;
  }

  async deleteProject(id) {
    await this.delay();
    const db = this.getDb();
    db.projects = db.projects.filter(p => p.id !== Number(id));
    // Also remove associated tasks
    db.tasks = db.tasks.filter(t => t.projectId !== Number(id));
    this.saveDb(db);
    return { success: true };
  }

  // --- Tasks Mock ---
  async getTasks(filters = {}) {
    await this.delay();
    const db = this.getDb();
    let tasks = [...db.tasks];

    if (filters.projectId) {
      tasks = tasks.filter(t => t.projectId === Number(filters.projectId));
    }
    if (filters.assigneeId) {
      tasks = tasks.filter(t => (t.assignee?.id || t.assigneeId) === Number(filters.assigneeId));
    }
    if (filters.status) {
      tasks = tasks.filter(t => t.status === filters.status);
    }
    if (filters.priority) {
      tasks = tasks.filter(t => t.priority === filters.priority);
    }

    return tasks;
  }

  async createTask(data) {
    await this.delay();
    const db = this.getDb();
    const project = db.projects.find(p => p.id === Number(data.projectId)) || db.projects[0];
    const assignee = db.users.find(u => u.id === Number(data.assigneeId)) || null;

    const count = db.tasks.filter(t => t.projectId === project.id).length + 1;
    const taskCode = `${project.key}-${String(count).padStart(2, '0')}`;

    const dependencyIds = (data.dependencyIds || []).map(Number);
    const dependencyTitles = db.tasks
      .filter(t => dependencyIds.includes(t.id))
      .map(t => `${t.taskCode}: ${t.title}`);

    const newTask = {
      id: Date.now(),
      taskCode,
      title: data.title,
      description: data.description || '',
      status: data.status || 'TO_DO',
      priority: data.priority || 'MEDIUM',
      projectId: project.id,
      projectName: project.name,
      assignee,
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate,
      estimatedHours: Number(data.estimatedHours) || 8,
      spentHours: 0,
      dependencyIds,
      dependencyTitles,
      createdAt: new Date().toISOString()
    };

    db.tasks.unshift(newTask);

    db.activityLog.unshift({
      id: Date.now(),
      user: assignee || db.users[0],
      action: 'CREATED_TASK',
      target: newTask.taskCode,
      detail: `Created task "${newTask.title}" in ${project.name}`,
      projectId: project.id,
      timestamp: new Date().toISOString()
    });

    this.saveDb(db);
    return newTask;
  }

  async updateTask(id, data) {
    await this.delay();
    const db = this.getDb();
    const idx = db.tasks.findIndex(t => t.id === Number(id));
    if (idx === -1) {
      const error = new Error('Task not found');
      error.status = 404;
      throw error;
    }

    const current = db.tasks[idx];
    const assignee = data.assigneeId ? db.users.find(u => u.id === Number(data.assigneeId)) : current.assignee;
    
    let dependencyIds = current.dependencyIds;
    let dependencyTitles = current.dependencyTitles;
    if (data.dependencyIds) {
      dependencyIds = data.dependencyIds.map(Number);
      dependencyTitles = db.tasks
        .filter(t => dependencyIds.includes(t.id))
        .map(t => `${t.taskCode}: ${t.title}`);
    }

    const updated = {
      ...current,
      ...data,
      assignee,
      dependencyIds,
      dependencyTitles
    };

    db.tasks[idx] = updated;
    this.saveDb(db);
    return updated;
  }

  async updateTaskStatus(id, newStatus) {
    await this.delay();
    const db = this.getDb();
    const task = db.tasks.find(t => t.id === Number(id));
    if (!task) {
      const error = new Error('Task not found');
      error.status = 404;
      throw error;
    }

    // Business Rule Check: Cannot complete task if dependencies are not COMPLETED
    if (newStatus === 'COMPLETED' && task.dependencyIds && task.dependencyIds.length > 0) {
      const incompletePrereqs = db.tasks.filter(
        t => task.dependencyIds.includes(t.id) && t.status !== 'COMPLETED'
      );

      if (incompletePrereqs.length > 0) {
        const prereqList = incompletePrereqs.map(p => `${p.taskCode} (${p.title})`).join(', ');
        const error = new Error(
          `Cannot complete task '${task.taskCode}' because prerequisite task(s) are incomplete: ${prereqList}`
        );
        error.status = 409;
        throw error;
      }
    }

    const prevStatus = task.status;
    task.status = newStatus;

    db.activityLog.unshift({
      id: Date.now(),
      user: task.assignee || db.users[0],
      action: 'UPDATED_STATUS',
      target: task.taskCode,
      detail: `Changed status from ${prevStatus} to ${newStatus}`,
      projectId: task.projectId,
      timestamp: new Date().toISOString()
    });

    this.saveDb(db);
    return task;
  }

  async deleteTask(id) {
    await this.delay();
    const db = this.getDb();
    db.tasks = db.tasks.filter(t => t.id !== Number(id));
    this.saveDb(db);
    return { success: true };
  }

  // --- Comments & Attachments Mock ---
  async getComments(taskId) {
    await this.delay();
    const db = this.getDb();
    return db.comments.filter(c => c.taskId === Number(taskId));
  }

  async addComment(taskId, content, user) {
    await this.delay();
    const db = this.getDb();
    const newComment = {
      id: Date.now(),
      taskId: Number(taskId),
      user: user || db.users[0],
      content,
      createdAt: new Date().toISOString()
    };
    db.comments.push(newComment);
    this.saveDb(db);
    return newComment;
  }

  async getAttachments(taskId) {
    await this.delay();
    const db = this.getDb();
    return (db.attachments || []).filter(a => a.taskId === Number(taskId));
  }

  async addAttachment(taskId, fileInfo, user) {
    await this.delay();
    const db = this.getDb();
    const newAttachment = {
      id: Date.now(),
      taskId: Number(taskId),
      fileName: fileInfo.name,
      fileSize: `${(fileInfo.size / (1024 * 1024)).toFixed(1)} MB`,
      fileType: fileInfo.type || 'application/octet-stream',
      uploadedBy: user?.name || 'CurrentUser',
      createdAt: new Date().toISOString()
    };
    if (!db.attachments) db.attachments = [];
    db.attachments.unshift(newAttachment);
    this.saveDb(db);
    return newAttachment;
  }

  async getTimeEntries(taskId) {
    await this.delay();
    const db = this.getDb();
    return (db.timeEntries || []).filter(e => e.taskId === Number(taskId));
  }

  async logTime(taskId, data, user) {
    await this.delay();
    const db = this.getDb();
    const newEntry = {
      id: Date.now(),
      taskId: Number(taskId),
      userId: user?.id || 1,
      hours: Number(data.hours),
      description: data.description || 'General progress',
      date: data.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    if (!db.timeEntries) db.timeEntries = [];
    db.timeEntries.unshift(newEntry);

    // Update spentHours on task
    const task = db.tasks.find(t => t.id === Number(taskId));
    if (task) {
      task.spentHours = (task.spentHours || 0) + Number(data.hours);
    }

    this.saveDb(db);
    return newEntry;
  }

  // --- Users & Team Mock ---
  async getUsers() {
    await this.delay();
    const db = this.getDb();
    // Compute dynamic task counts
    return db.users.map(u => {
      const userTasks = db.tasks.filter(t => (t.assignee?.id || t.assigneeId) === u.id);
      const assignedTasks = userTasks.filter(t => t.status !== 'COMPLETED').length;
      const completedTasks = userTasks.filter(t => t.status === 'COMPLETED').length;
      const overdueTasks = userTasks.filter(t => {
        if (t.status === 'COMPLETED' || !t.dueDate) return false;
        return new Date(t.dueDate) < new Date();
      }).length;

      let activeWorkload = 'OPTIMAL';
      if (assignedTasks >= 6) activeWorkload = 'OVERLOADED';
      else if (assignedTasks >= 4) activeWorkload = 'HEAVY';

      const userProjects = db.projects
        .filter(p => (p.memberIds || []).includes(u.id))
        .map(p => p.name);

      return {
        ...u,
        assignedTasks,
        completedTasks,
        overdueTasks,
        activeWorkload,
        activeProjects: userProjects
      };
    });
  }

  // --- Notifications Mock ---
  async getNotifications(userId) {
    await this.delay();
    const db = this.getDb();
    return db.notifications;
  }

  async markNotificationAsRead(id) {
    await this.delay();
    const db = this.getDb();
    const notif = db.notifications.find(n => n.id === Number(id));
    if (notif) notif.isRead = true;
    this.saveDb(db);
    return notif;
  }

  async markAllNotificationsAsRead() {
    await this.delay();
    const db = this.getDb();
    db.notifications.forEach(n => n.isRead = true);
    this.saveDb(db);
    return { success: true };
  }

  // --- Activity Log Mock ---
  async getActivityLog() {
    await this.delay();
    const db = this.getDb();
    return db.activityLog || [];
  }
}

export const mockAdapter = new MockAdapter();
