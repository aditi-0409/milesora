import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import { formatDate, getDeadlineStatus } from '../../utils/dateUtils';
import { TASK_STATUS_CONFIG, PRIORITY_CONFIG } from '../../utils/formatters';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Clock, 
  AlertTriangle, 
  ArrowUpDown,
  Calendar,
  Layers
} from 'lucide-react';

export function TasksPage({ myTasksOnly = false }) {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const { success, error } = useToast();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [sortBy, setSortBy] = useState('deadline');

  // Selected for drawer
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Modal for Create/Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formProjectId, setFormProjectId] = useState('');
  const [formAssigneeId, setFormAssigneeId] = useState('');
  const [formStatus, setFormStatus] = useState('TO_DO');
  const [formPriority, setFormPriority] = useState('MEDIUM');
  const [formDueDate, setFormDueDate] = useState('');
  const [formEstHours, setFormEstHours] = useState('8');
  const [formDependencyIds, setFormDependencyIds] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tList, pList, uList] = await Promise.all([
        taskService.getAll(),
        projectService.getAll(),
        userService.getAll()
      ]);
      setTasks(tList || []);
      setProjects(pList || []);
      setUsers(uList || []);

      if (highlightId && tList) {
        const found = tList.find(t => String(t.id) === highlightId);
        if (found) {
          setSelectedTask(found);
          setDrawerOpen(true);
        }
      }
    } catch (err) {
      error(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [highlightId]);

  const openCreateModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormProjectId(projects[0]?.id || '');
    setFormAssigneeId(users[0]?.id || '');
    setFormStatus('TO_DO');
    setFormPriority('MEDIUM');
    setFormDueDate('');
    setFormEstHours('8');
    setFormDependencyIds([]);
    setModalOpen(true);
  };

  const openEditModal = (t, e) => {
    e.stopPropagation();
    setEditingTask(t);
    setFormTitle(t.title);
    setFormDescription(t.description || '');
    setFormProjectId(t.projectId);
    setFormAssigneeId(t.assignee?.id || t.assigneeId || '');
    setFormStatus(t.status);
    setFormPriority(t.priority);
    setFormDueDate(t.dueDate ? t.dueDate.split('T')[0] : '');
    setFormEstHours(String(t.estimatedHours || 8));
    setFormDependencyIds(t.dependencyIds || []);
    setModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      error('Task title is required');
      return;
    }
    if (!formProjectId) {
      error('Please select a project');
      return;
    }

    try {
      setSubmitting(true);
      if (editingTask) {
        const updated = await taskService.update(editingTask.id, {
          title: formTitle,
          description: formDescription,
          projectId: formProjectId,
          assigneeId: formAssigneeId,
          status: formStatus,
          priority: formPriority,
          dueDate: formDueDate || undefined,
          estimatedHours: Number(formEstHours) || 8,
          dependencyIds: formDependencyIds
        });
        success(`Task "${updated.taskCode}" updated successfully!`);
      } else {
        const created = await taskService.create({
          title: formTitle,
          description: formDescription,
          projectId: formProjectId,
          assigneeId: formAssigneeId,
          status: formStatus,
          priority: formPriority,
          dueDate: formDueDate || undefined,
          estimatedHours: Number(formEstHours) || 8,
          dependencyIds: formDependencyIds
        });
        success(`Task "${created.taskCode}" created successfully!`);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteConfirmId) return;
    try {
      setSubmitting(true);
      await taskService.delete(deleteConfirmId);
      success('Task deleted successfully.');
      setDeleteConfirmId(null);
      if (selectedTask?.id === deleteConfirmId) {
        setDrawerOpen(false);
      }
      loadData();
    } catch (err) {
      error(err.message || 'Failed to delete task');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (myTasksOnly) {
      // Check current user
      const currentUser = JSON.parse(sessionStorage.getItem('taskora_current_user') || '{}');
      if ((t.assignee?.id || t.assigneeId) !== currentUser.id) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const match = t.title.toLowerCase().includes(q) || t.taskCode?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (projectFilter && String(t.projectId) !== String(projectFilter)) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (assigneeFilter && String(t.assignee?.id || t.assigneeId) !== String(assigneeFilter)) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'deadline') {
      return new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999');
    }
    if (sortBy === 'priority') {
      const pWeights = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {myTasksOnly ? 'My Assigned Tasks' : 'Task Operations Central'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track, assign, prioritize, and verify delivery across all sprint initiatives.
          </p>
        </div>
        <Button variant="pulse" leftIcon={Plus} onClick={openCreateModal}>
          Create New Task
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or code..."
            className="w-full text-xs pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>[{p.key}] {p.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="TO_DO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="deadline">Sort: Deadline</option>
            <option value="priority">Sort: Priority</option>
            <option value="newest">Sort: Newest</option>
          </select>
        </div>
      </div>

      {/* Task Table */}
      {loading ? (
        <LoadingSpinner text="Loading task registry..." />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks found matching criteria"
          description="Adjust your search filters or create a new task."
          actionLabel="Create Task"
          onAction={openCreateModal}
        />
      ) : (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Task Title</th>
                  <th className="px-5 py-3.5">Project</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Assignee</th>
                  <th className="px-5 py-3.5">Deadline</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {filteredTasks.map(t => {
                  const deadline = getDeadlineStatus(t.dueDate, t.status);
                  const statusConfig = TASK_STATUS_CONFIG[t.status] || TASK_STATUS_CONFIG.TO_DO;
                  const priorityConfig = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.MEDIUM;
                  const isBlocked = t.dependencyTitles && t.dependencyTitles.length > 0;

                  return (
                    <tr
                      key={t.id}
                      onClick={() => {
                        setSelectedTask(t);
                        setDrawerOpen(true);
                      }}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-brand-600 dark:text-brand-400">
                        {t.taskCode || `#${t.id}`}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{t.title}</span>
                          {isBlocked && (
                            <span title="Has dependencies">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 truncate max-w-[140px]">
                        {t.projectName}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={t.status === 'COMPLETED' ? 'success' : t.status === 'IN_PROGRESS' ? 'primary' : 'default'} size="sm">
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={t.priority === 'CRITICAL' ? 'danger' : t.priority === 'HIGH' ? 'warning' : 'default'} size="sm">
                          {priorityConfig.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={t.assignee?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(t.assignee?.name || 'U')}`}
                            alt={t.assignee?.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                            {t.assignee?.name || 'Unassigned'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-semibold ${deadline.state === 'overdue' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {deadline.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => openEditModal(t, e)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Edit task"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(t.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Task Details Side Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdated={() => loadData()}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? `Edit Task ${editingTask.taskCode}` : 'Create New Work Item'}
        subtitle="Specify task scope, dependencies, estimated hours and assignment"
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <Input
            label="Task Title"
            required
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
            placeholder="e.g. Implement STOMP WebSocket mesh endpoint"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Project"
              required
              value={formProjectId}
              onChange={e => setFormProjectId(e.target.value)}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>[{p.key}] {p.name}</option>
              ))}
            </Select>

            <Select
              label="Assignee"
              value={formAssigneeId}
              onChange={e => setFormAssigneeId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Status"
              value={formStatus}
              onChange={e => setFormStatus(e.target.value)}
            >
              <option value="TO_DO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="COMPLETED">Completed</option>
            </Select>

            <Select
              label="Priority"
              value={formPriority}
              onChange={e => setFormPriority(e.target.value)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>

            <Input
              label="Due Date"
              type="date"
              value={formDueDate}
              onChange={e => setFormDueDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Estimated Hours"
              type="number"
              min="1"
              value={formEstHours}
              onChange={e => setFormEstHours(e.target.value)}
            />

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Prerequisite Dependency (Optional)
              </label>
              <select
                value={formDependencyIds[0] || ''}
                onChange={e => {
                  const val = e.target.value;
                  setFormDependencyIds(val ? [Number(val)] : []);
                }}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="">No prerequisite task</option>
                {tasks
                  .filter(t => !editingTask || t.id !== editingTask.id)
                  .map(t => (
                    <option key={t.id} value={t.id}>
                      [{t.taskCode}] {t.title}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Technical Description / Acceptance Criteria
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              placeholder="Implementation details, architecture requirements..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Task Deletion"
        subtitle="This operation will permanently remove the task"
        maxWidth="max-w-md"
      >
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          Are you sure you want to delete this task? Associated comments and logged time entries will be unlinked.
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteTask} isLoading={submitting}>
            Delete Task
          </Button>
        </div>
      </Modal>
    </div>
  );
}
