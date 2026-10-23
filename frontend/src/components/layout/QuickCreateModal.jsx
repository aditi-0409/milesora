import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService';
import { CheckSquare, FolderKanban } from 'lucide-react';

export function QuickCreateModal({ isOpen, onClose, onCreated }) {
  const [tab, setTab] = useState('task'); // 'task' | 'project'
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const { success, error } = useToast();

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskProjectId, setTaskProjectId] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskEstimatedHours, setTaskEstimatedHours] = useState('8');

  // Project form state
  const [projName, setProjName] = useState('');
  const [projKey, setProjKey] = useState('');
  const [projDescription, setProjDescription] = useState('');
  const [projPriority, setProjPriority] = useState('MEDIUM');
  const [projDueDate, setProjDueDate] = useState('');
  const [projManagerId, setProjManagerId] = useState('');

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        projectService.getAll(),
        userService.getAll()
      ]).then(([projs, usrs]) => {
        setProjects(projs || []);
        setUsers(usrs || []);
        if (projs && projs.length > 0 && !taskProjectId) {
          setTaskProjectId(projs[0].id);
        }
        if (usrs && usrs.length > 0 && !taskAssigneeId) {
          setTaskAssigneeId(usrs[0].id);
          setProjManagerId(usrs[0].id);
        }
      });
    }
  }, [isOpen]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      error('Task title is required');
      return;
    }
    if (!taskProjectId) {
      error('Please select a project');
      return;
    }

    try {
      setLoading(true);
      const created = await taskService.create({
        title: taskTitle,
        description: taskDescription,
        projectId: taskProjectId,
        assigneeId: taskAssigneeId,
        priority: taskPriority,
        dueDate: taskDueDate || undefined,
        estimatedHours: Number(taskEstimatedHours) || 8,
        status: 'TO_DO'
      });
      success(`Task "${created.taskCode}" created successfully!`);
      // Reset form
      setTaskTitle('');
      setTaskDescription('');
      onClose();
      if (onCreated) onCreated('task', created);
    } catch (err) {
      error(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projName.trim()) {
      error('Project name is required');
      return;
    }

    try {
      setLoading(true);
      const created = await projectService.create({
        name: projName,
        key: projKey || projName.substring(0, 3).toUpperCase(),
        description: projDescription,
        priority: projPriority,
        dueDate: projDueDate || undefined,
        managerId: projManagerId,
        status: 'PLANNING'
      });
      success(`Project "${created.name}" created successfully!`);
      setProjName('');
      setProjKey('');
      setProjDescription('');
      onClose();
      if (onCreated) onCreated('project', created);
    } catch (err) {
      error(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Create"
      subtitle="Instantly register a new item in Taskora Pulse"
    >
      {/* Tab Switcher */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setTab('task')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            tab === 'task'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>New Task</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('project')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            tab === 'project'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {tab === 'task' ? (
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            required
            value={taskTitle}
            onChange={e => setTaskTitle(e.target.value)}
            placeholder="e.g. Implement OAuth2 refresh token rotation"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Project"
              required
              value={taskProjectId}
              onChange={e => setTaskProjectId(e.target.value)}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.key}] {p.name}
                </option>
              ))}
            </Select>

            <Select
              label="Assignee"
              value={taskAssigneeId}
              onChange={e => setTaskAssigneeId(e.target.value)}
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Priority"
              value={taskPriority}
              onChange={e => setTaskPriority(e.target.value)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>

            <Input
              label="Due Date"
              type="date"
              value={taskDueDate}
              onChange={e => setTaskDueDate(e.target.value)}
            />

            <Input
              label="Est. Hours"
              type="number"
              min="1"
              value={taskEstimatedHours}
              onChange={e => setTaskEstimatedHours(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Description / Acceptance Criteria
            </label>
            <textarea
              rows={3}
              value={taskDescription}
              onChange={e => setTaskDescription(e.target.value)}
              placeholder="Detailed requirements or technical notes..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              Create Task
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Name"
            required
            value={projName}
            onChange={e => setProjName(e.target.value)}
            placeholder="e.g. AI Workflow Optimization"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Project Key (Code)"
              value={projKey}
              onChange={e => setProjKey(e.target.value)}
              placeholder="e.g. AWO"
              helperText="Prefix used for all generated task codes"
            />

            <Select
              label="Lead Project Manager"
              value={projManagerId}
              onChange={e => setProjManagerId(e.target.value)}
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.title || u.role})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Priority"
              value={projPriority}
              onChange={e => setProjPriority(e.target.value)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>

            <Input
              label="Target Deadline"
              type="date"
              value={projDueDate}
              onChange={e => setProjDueDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Project Scope & Objectives
            </label>
            <textarea
              rows={3}
              value={projDescription}
              onChange={e => setProjDescription(e.target.value)}
              placeholder="High-level architecture and delivery goals..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              Create Project
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
