import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { TaskDetailDrawer } from '../tasks/TaskDetailDrawer';
import { formatDate, getDeadlineStatus } from '../../utils/dateUtils';
import { PRIORITY_CONFIG } from '../../utils/formatters';
import { 
  Columns3, 
  Plus, 
  Search, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Filter,
  Flame,
  ArrowRight
} from 'lucide-react';

const COLUMNS = [
  { id: 'TO_DO', title: 'To Do', color: 'border-slate-300 dark:border-slate-700', bg: 'bg-slate-50/50 dark:bg-slate-900/40' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-brand-400 dark:border-brand-600', bg: 'bg-brand-50/30 dark:bg-brand-950/20' },
  { id: 'IN_REVIEW', title: 'In Review / QA', color: 'border-orange-400 dark:border-orange-600', bg: 'bg-orange-50/30 dark:bg-orange-950/20' },
  { id: 'COMPLETED', title: 'Completed', color: 'border-emerald-400 dark:border-emerald-600', bg: 'bg-emerald-50/30 dark:bg-emerald-950/20' },
];

export function KanbanPage() {
  const [searchParams] = useSearchParams();
  const initialProjectId = searchParams.get('project') || '';

  const { success, error } = useToast();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Drag state
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // Drawer
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    } catch (err) {
      error(err.message || 'Failed to load Kanban tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter tasks for columns
  const filteredTasks = tasks.filter(t => {
    if (selectedProjectId && String(t.projectId) !== String(selectedProjectId)) return false;
    if (selectedAssigneeId && String(t.assignee?.id || t.assigneeId) !== String(selectedAssigneeId)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !t.taskCode?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Handle Drag & Drop
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', String(taskId));
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = Number(e.dataTransfer.getData('text/plain') || draggedTaskId);
    setDraggedTaskId(null);

    if (!taskId) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === targetStatus) return;

    await executeStatusTransition(taskId, targetStatus);
  };

  const executeStatusTransition = async (taskId, newStatus) => {
    if (updatingTaskId) return; // Prevent duplicate concurrent requests

    const originalTask = tasks.find(t => t.id === taskId);
    if (!originalTask) return;

    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    setUpdatingTaskId(taskId);

    try {
      const updated = await taskService.updateStatus(taskId, newStatus);
      success(`Moved ${originalTask.taskCode} to ${COLUMNS.find(c => c.id === newStatus)?.title}`);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    } catch (err) {
      // Revert optimistic update on server rejection
      setTasks(prev => prev.map(t => t.id === taskId ? originalTask : t));
      error(err.message || 'Status transition was rejected by server business rules.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Columns3 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Interactive Kanban Board</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Drag and drop tasks between workflow stages. Business rules and dependency checks are strictly enforced.
          </p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Kanban tasks..."
              className="w-full text-xs pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <select
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>[{p.key}] {p.name}</option>
            ))}
          </select>

          <select
            value={selectedAssigneeId}
            onChange={e => setSelectedAssigneeId(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Team Members</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong>{filteredTasks.length}</strong> tasks
        </div>
      </div>

      {/* Board Columns Grid */}
      {loading ? (
        <LoadingSpinner text="Synchronizing Kanban columns with Spring Boot backend..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start pb-8">
          {COLUMNS.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            const isDragTarget = dragOverCol === col.id;

            return (
              <div
                key={col.id}
                onDragOver={e => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, col.id)}
                className={`flex flex-col rounded-2xl border-2 transition-all p-3 min-h-[580px] ${col.bg} ${
                  isDragTarget
                    ? 'border-brand-500 bg-brand-100/40 dark:bg-brand-950/40 shadow-glow'
                    : 'border-slate-200/80 dark:border-slate-800/80'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      {col.title}
                    </h3>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 shadow-sm text-slate-600 dark:text-slate-400">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                      Drop tasks here
                    </div>
                  ) : (
                    colTasks.map(task => {
                      const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
                      const deadline = getDeadlineStatus(task.dueDate, task.status);
                      const isOverdue = deadline.state === 'overdue';
                      const hasDependencies = task.dependencyTitles && task.dependencyTitles.length > 0;
                      const isUpdating = updatingTaskId === task.id;

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={e => handleDragStart(e, task.id)}
                          onClick={() => {
                            setSelectedTask(task);
                            setDrawerOpen(true);
                          }}
                          className={`bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-400 dark:hover:border-brand-600 transition-all cursor-grab active:cursor-grabbing select-none relative group ${
                            isUpdating ? 'opacity-50 pointer-events-none' : ''
                          }`}
                        >
                          {/* Card Header: Code & Priority */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-mono text-[11px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded">
                              {task.taskCode}
                            </span>
                            <Badge variant={task.priority === 'CRITICAL' ? 'danger' : task.priority === 'HIGH' ? 'warning' : 'default'} size="sm">
                              {priorityConfig.label}
                            </Badge>
                          </div>

                          {/* Task Title */}
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {task.title}
                          </h4>

                          {/* Blocked or Dependency Indicator */}
                          {hasDependencies && (
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg mb-2 border border-amber-200/60 dark:border-amber-900/60">
                              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">Prerequisites declared</span>
                            </div>
                          )}

                          {/* Card Footer: Due Date & Assignee */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                            <div className={`flex items-center gap-1 font-semibold ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(task.dueDate)}</span>
                            </div>

                            <img
                              src={task.assignee?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(task.assignee?.name || 'U')}`}
                              alt={task.assignee?.name}
                              title={task.assignee?.name || 'Unassigned'}
                              className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                            />
                          </div>

                          {/* Accessible Keyboard Workflow Controls (alternative to Drag & Drop) */}
                          <div
                            onClick={e => e.stopPropagation()}
                            className="mt-2.5 pt-2 border-t border-dashed border-slate-100 dark:border-slate-800/80 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="text-[10px] text-slate-400">Move:</span>
                            <div className="flex items-center gap-1">
                              {col.id !== 'TO_DO' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const prevStatus = col.id === 'COMPLETED' ? 'IN_REVIEW' : col.id === 'IN_REVIEW' ? 'IN_PROGRESS' : 'TO_DO';
                                    executeStatusTransition(task.id, prevStatus);
                                  }}
                                  className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-[10px] flex items-center"
                                  title="Move to previous status"
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </button>
                              )}
                              {col.id !== 'COMPLETED' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextStatus = col.id === 'TO_DO' ? 'IN_PROGRESS' : col.id === 'IN_PROGRESS' ? 'IN_REVIEW' : 'COMPLETED';
                                    executeStatusTransition(task.id, nextStatus);
                                  }}
                                  className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-[10px] flex items-center"
                                  title="Move to next status"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdated={() => loadData()}
      />
    </div>
  );
}
