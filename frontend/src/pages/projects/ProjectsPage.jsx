import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/dateUtils';
import { PROJECT_STATUS_CONFIG, PRIORITY_CONFIG } from '../../utils/formatters';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  Filter, 
  Trash2, 
  Edit3, 
  Calendar, 
  Users, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export function ProjectsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formKey, setFormKey] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState('ACTIVE');
  const [formPriority, setFormPriority] = useState('MEDIUM');
  const [formDueDate, setFormDueDate] = useState('');
  const [formManagerId, setFormManagerId] = useState('');

  const loadProjects = async () => {
    try {
      setLoading(true);
      const [projs, usrs] = await Promise.all([
        projectService.getAll(),
        userService.getAll()
      ]);
      setProjects(projs || []);
      setUsers(usrs || []);
      if (usrs && usrs.length > 0 && !formManagerId) {
        setFormManagerId(usrs[0].id);
      }
    } catch (err) {
      error(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormName('');
    setFormKey('');
    setFormDescription('');
    setFormStatus('ACTIVE');
    setFormPriority('MEDIUM');
    setFormDueDate('');
    setFormManagerId(user?.id || users[0]?.id || 1);
    setCreateModalOpen(true);
  };

  const openEditModal = (p, e) => {
    e.stopPropagation();
    setEditingProject(p);
    setFormName(p.name);
    setFormKey(p.key);
    setFormDescription(p.description || '');
    setFormStatus(p.status);
    setFormPriority(p.priority);
    setFormDueDate(p.dueDate ? p.dueDate.split('T')[0] : '');
    setFormManagerId(p.manager?.id || p.managerId || users[0]?.id);
    setCreateModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      error('Project name is required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingProject) {
        const updated = await projectService.update(editingProject.id, {
          name: formName,
          key: formKey,
          description: formDescription,
          status: formStatus,
          priority: formPriority,
          dueDate: formDueDate || undefined,
          managerId: formManagerId
        });
        success(`Project "${updated.name}" updated successfully!`);
      } else {
        const created = await projectService.create({
          name: formName,
          key: formKey || formName.substring(0, 3).toUpperCase(),
          description: formDescription,
          status: formStatus,
          priority: formPriority,
          dueDate: formDueDate || undefined,
          managerId: formManagerId
        });
        success(`Project "${created.name}" created successfully!`);
      }
      setCreateModalOpen(false);
      loadProjects();
    } catch (err) {
      error(err.message || 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteConfirmId) return;
    try {
      setSubmitting(true);
      await projectService.delete(deleteConfirmId);
      success('Project archived successfully.');
      setDeleteConfirmId(null);
      loadProjects();
    } catch (err) {
      error(err.message || 'Failed to delete project');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter & Sort Logic
  const filtered = projects.filter(p => {
    if (search) {
      const q = search.toLowerCase();
      const matches = p.name.toLowerCase().includes(q) || p.key?.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (statusFilter && p.status !== statusFilter) return false;
    if (priorityFilter && p.priority !== priorityFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'deadline') {
      return new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999');
    }
    if (sortBy === 'progress') {
      return (b.taskStats?.progressPercentage || 0) - (a.taskStats?.progressPercentage || 0);
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Projects Portfolio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track roadmaps, sprint commitments, team assignments, and delivery health.
          </p>
        </div>
        <Button variant="pulse" leftIcon={Plus} onClick={openCreateModal}>
          Create Project
        </Button>
      </div>

      {/* Control Bar: Search, Filters, View Modes */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or key..."
              className="w-full text-xs pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
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
            <option value="newest">Sort: Newest</option>
            <option value="deadline">Sort: Deadline</option>
            <option value="progress">Sort: Progress</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>

          <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <LoadingSpinner text="Loading projects portfolio..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No projects match your filter"
          description="Try clearing your search filters or start an initiative with the button below."
          actionLabel="Create Project"
          onAction={openCreateModal}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => {
            const statusConfig = PROJECT_STATUS_CONFIG[p.status] || PROJECT_STATUS_CONFIG.PLANNING;
            const priorityConfig = PRIORITY_CONFIG[p.priority] || PRIORITY_CONFIG.MEDIUM;
            const progress = p.taskStats?.progressPercentage || 0;

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-400 dark:hover:border-brand-600 transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2.5 py-1 rounded-lg">
                      {p.key}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={p.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                        {statusConfig.label}
                      </Badge>
                      <button
                        onClick={(e) => openEditModal(p, e)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit project"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(p.id);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    <Link to={`/projects/${p.id}`}>
                      {p.name}
                    </Link>
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {p.description || 'No detailed scope provided.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-slate-800 dark:text-slate-200">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-brand-600 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(p.dueDate)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <img
                        src={p.manager?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.manager?.name || 'M')}`}
                        alt={p.manager?.name}
                        title={`Manager: ${p.manager?.name}`}
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <Link
                        to={`/projects/${p.id}`}
                        className="text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-0.5 text-xs"
                      >
                        Details <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Project Name</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Progress</th>
                  <th className="px-5 py-3.5">Deadline</th>
                  <th className="px-5 py-3.5">Manager</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {filtered.map(p => {
                  const statusConfig = PROJECT_STATUS_CONFIG[p.status] || PROJECT_STATUS_CONFIG.PLANNING;
                  const priorityConfig = PRIORITY_CONFIG[p.priority] || PRIORITY_CONFIG.MEDIUM;
                  const progress = p.taskStats?.progressPercentage || 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-brand-600 dark:text-brand-400">
                        {p.key}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                        <Link to={`/projects/${p.id}`} className="hover:text-brand-600 transition-colors">
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={p.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={p.priority === 'CRITICAL' ? 'danger' : p.priority === 'HIGH' ? 'warning' : 'default'} size="sm">
                          {priorityConfig.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-brand-600 h-full rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {formatDate(p.dueDate)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={p.manager?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.manager?.name || 'M')}`}
                            alt={p.manager?.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="text-slate-700 dark:text-slate-300">{p.manager?.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => openEditModal(p, e)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                            title="Delete"
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

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        subtitle="Manage project details, target dates and assigned leadership"
      >
        <form onSubmit={handleSaveProject} className="space-y-4">
          <Input
            label="Project Name"
            required
            value={formName}
            onChange={e => setFormName(e.target.value)}
            placeholder="e.g. Next-Gen Realtime Platform"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Project Key (Code)"
              value={formKey}
              onChange={e => setFormKey(e.target.value)}
              placeholder="e.g. NGP"
              helperText="Unique uppercase prefix for tasks"
            />

            <Select
              label="Project Manager"
              value={formManagerId}
              onChange={e => setFormManagerId(e.target.value)}
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.title || u.role})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Status"
              value={formStatus}
              onChange={e => setFormStatus(e.target.value)}
            >
              <option value="PLANNING">Planning</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
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
              label="Target Deadline"
              type="date"
              value={formDueDate}
              onChange={e => setFormDueDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Project Scope & Objectives
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              placeholder="Strategic goals and deliverables..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete / Archive Confirmation Dialog */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Project Archive"
        subtitle="This action will remove the project from the active workspace"
        maxWidth="max-w-md"
      >
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
          Are you sure you want to archive this project? All associated tasks will be removed from active boards. This change is fully synchronized with your Java backend.
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteProject} isLoading={submitting}>
            Confirm Archive
          </Button>
        </div>
      </Modal>
    </div>
  );
}
