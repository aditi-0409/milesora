import React, { useState, useEffect } from 'react';
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatDate, formatTimeAgo, getDeadlineStatus } from '../../utils/dateUtils';
import { TASK_STATUS_CONFIG, PRIORITY_CONFIG } from '../../utils/formatters';
import { 
  X, 
  Clock, 
  Calendar, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  Paperclip, 
  Send, 
  Upload, 
  FileText, 
  Timer, 
  Plus, 
  AlertCircle 
} from 'lucide-react';

export function TaskDetailDrawer({ task, isOpen, onClose, onUpdated }) {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [currentTask, setCurrentTask] = useState(task);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Comments & time form
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showLogTimeModal, setShowLogTimeModal] = useState(false);
  const [logHours, setLogHours] = useState('2');
  const [logDesc, setLogDesc] = useState('');

  useEffect(() => {
    setCurrentTask(task);
    if (task && isOpen) {
      loadDetails(task.id);
    }
  }, [task, isOpen]);

  const loadDetails = async (taskId) => {
    try {
      setLoading(true);
      const [uList, cList, aList, tList] = await Promise.all([
        userService.getAll(),
        taskService.getComments(taskId),
        taskService.getAttachments(taskId),
        taskService.getTimeEntries(taskId)
      ]);
      setUsers(uList || []);
      setComments(cList || []);
      setAttachments(aList || []);
      setTimeEntries(tList || []);
    } catch (err) {
      console.error('Failed to load task details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !currentTask) return null;

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await taskService.updateStatus(currentTask.id, newStatus);
      setCurrentTask(updated);
      success(`Task status updated to ${newStatus}`);
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      error(err.message || 'Status transition rejected by server');
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      const updated = await taskService.update(currentTask.id, { priority: newPriority });
      setCurrentTask(updated);
      success('Priority updated');
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      error(err.message || 'Failed to update priority');
    }
  };

  const handleAssigneeChange = async (newAssigneeId) => {
    try {
      const updated = await taskService.update(currentTask.id, { assigneeId: newAssigneeId });
      setCurrentTask(updated);
      success('Assignee updated');
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      error(err.message || 'Failed to update assignee');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const newComment = await taskService.addComment(currentTask.id, commentText.trim(), user);
      setComments(prev => [...prev, newComment]);
      setCommentText('');
      success('Comment posted');
    } catch (err) {
      error(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      error('File size exceeds 10MB limit.');
      return;
    }

    try {
      const newAttachment = await taskService.uploadAttachment(currentTask.id, file, user);
      setAttachments(prev => [newAttachment, ...prev]);
      success(`Uploaded "${file.name}"`);
    } catch (err) {
      error(err.message || 'Upload failed');
    }
  };

  const handleLogTime = async (e) => {
    e.preventDefault();
    if (!logHours || Number(logHours) <= 0) {
      error('Please enter a valid positive number of hours');
      return;
    }

    try {
      const newEntry = await taskService.logTime(
        currentTask.id,
        { hours: Number(logHours), description: logDesc },
        user
      );
      setTimeEntries(prev => [newEntry, ...prev]);
      setCurrentTask(prev => ({ ...prev, spentHours: (prev.spentHours || 0) + Number(logHours) }));
      setShowLogTimeModal(false);
      setLogDesc('');
      success(`Logged ${logHours}h successfully`);
      if (onUpdated) onUpdated();
    } catch (err) {
      error(err.message || 'Failed to log time');
    }
  };

  const deadline = getDeadlineStatus(currentTask.dueDate, currentTask.status);
  const statusConfig = TASK_STATUS_CONFIG[currentTask.status] || TASK_STATUS_CONFIG.TO_DO;
  const priorityConfig = PRIORITY_CONFIG[currentTask.priority] || PRIORITY_CONFIG.MEDIUM;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-out Drawer */}
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded">
              {currentTask.taskCode || `#${currentTask.id}`}
            </span>
            <span className="text-xs text-slate-400 truncate max-w-[200px]">
              {currentTask.projectName}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Description */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {currentTask.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed whitespace-pre-wrap">
              {currentTask.description || 'No description provided for this task.'}
            </p>
          </div>

          {/* Quick Properties Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 text-xs">
            <div>
              <span className="text-slate-400 font-medium block mb-1">Status</span>
              <select
                value={currentTask.status}
                onChange={e => handleStatusChange(e.target.value)}
                className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500"
              >
                <option value="TO_DO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <span className="text-slate-400 font-medium block mb-1">Priority</span>
              <select
                value={currentTask.priority}
                onChange={e => handlePriorityChange(e.target.value)}
                className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <span className="text-slate-400 font-medium block mb-1">Assignee</span>
              <select
                value={currentTask.assignee?.id || currentTask.assigneeId || ''}
                onChange={e => handleAssigneeChange(e.target.value)}
                className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-slate-400 font-medium block mb-1">Deadline</span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 pt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDate(currentTask.dueDate)}</span>
                <span className={`text-[10px] ml-1 ${deadline.state === 'overdue' ? 'text-rose-500' : 'text-slate-400'}`}>
                  ({deadline.label})
                </span>
              </div>
            </div>
          </div>

          {/* Dependency Information (Prerequisite check) */}
          {currentTask.dependencyTitles && currentTask.dependencyTitles.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Prerequisite Task Dependencies</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                This task has declared dependencies. Moving to Completed requires all prerequisites to be resolved:
              </p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-xs text-amber-900 dark:text-amber-200">
                {currentTask.dependencyTitles.map((dep, idx) => (
                  <li key={idx} className="font-mono text-[11px]">{dep}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Time Tracking Section */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Timer className="w-4 h-4 text-brand-500" />
                <span>Time Tracking</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowLogTimeModal(true)}>
                + Log Time
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500">
                Spent: <strong className="text-slate-900 dark:text-slate-100">{currentTask.spentHours || 0}h</strong>
              </span>
              <span className="text-slate-500">
                Estimated: <strong className="text-slate-900 dark:text-slate-100">{currentTask.estimatedHours || 0}h</strong>
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-600 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.round(((currentTask.spentHours || 0) / (currentTask.estimatedHours || 1)) * 100))}%`
                }}
              />
            </div>
          </div>

          {/* File Attachments Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-slate-400" />
                <span>Attachments ({attachments.length})</span>
              </h4>
              <label className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Attach File</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
              </label>
            </div>

            {attachments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No files attached yet.</p>
            ) : (
              <div className="space-y-2">
                {attachments.map(att => (
                  <div
                    key={att.id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{att.fileName}</span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">({att.fileSize})</span>
                    </div>
                    <button
                      onClick={() => alert(`Simulating file download for ${att.fileName}`)}
                      className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span>Discussion & Comments ({comments.length})</span>
            </h4>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment or update..."
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Button type="submit" variant="primary" size="sm" isLoading={submittingComment}>
                <Send className="w-4 h-4" />
              </Button>
            </form>

            <div className="space-y-3 mt-4">
              {comments.map(c => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                  <img
                    src={c.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.user?.name || 'U')}`}
                    alt={c.user?.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {c.user?.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatTimeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Log Time Modal */}
      {showLogTimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Log Time on {currentTask.taskCode}
            </h3>
            <form onSubmit={handleLogTime} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Hours Spent
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={logHours}
                  onChange={e => setLogHours(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Work Description / Log Notes
                </label>
                <textarea
                  rows={2}
                  value={logDesc}
                  onChange={e => setLogDesc(e.target.value)}
                  placeholder="Summary of changes implemented..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowLogTimeModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Hours
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
