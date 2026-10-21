import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FolderKanban, CheckSquare, Users, ArrowRight, X } from 'lucide-react';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService';

export function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([
        projectService.getAll(),
        taskService.getAll(),
        userService.getAll()
      ]).then(([p, t, u]) => {
        setProjects(p || []);
        setTasks(t || []);
        setUsers(u || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredProjects = q
    ? projects.filter(p => p.name.toLowerCase().includes(q) || p.key?.toLowerCase().includes(q)).slice(0, 4)
    : projects.slice(0, 3);

  const filteredTasks = q
    ? tasks.filter(t => t.title.toLowerCase().includes(q) || t.taskCode?.toLowerCase().includes(q)).slice(0, 5)
    : tasks.slice(0, 4);

  const filteredUsers = q
    ? users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-brand-500" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search projects, tasks, teammates..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            autoFocus
          />
          <kbd className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {loading && (
            <div className="p-8 text-center text-xs text-slate-400">
              Indexing items...
            </div>
          )}

          {/* Projects Category */}
          {filteredProjects.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5" />
                <span>Projects</span>
              </div>
              {filteredProjects.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleSelect(`/projects/${p.id}`)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-1.5 py-0.5 rounded">
                      {p.key}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      {p.name}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}

          {/* Tasks Category */}
          {filteredTasks.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Tasks</span>
              </div>
              {filteredTasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => handleSelect(`/tasks?highlight=${t.id}`)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                      {t.taskCode || `#${t.id}`}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      {t.title}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex-shrink-0">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Users Category */}
          {filteredUsers.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Team Members</span>
              </div>
              {filteredUsers.map(u => (
                <div
                  key={u.id}
                  onClick={() => handleSelect('/team')}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{u.name}</span>
                    <span className="text-slate-400 text-[10px]">({u.role})</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}

          {!loading && filteredProjects.length === 0 && filteredTasks.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              No results found for &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
