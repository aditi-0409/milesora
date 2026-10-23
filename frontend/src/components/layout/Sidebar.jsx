import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, cn } from '../../utils/formatters';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FolderKanban, 
  Columns3, 
  Users, 
  MessagesSquare, 
  Activity, 
  BarChart3, 
  Bell, 
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  UserCheck
} from 'lucide-react';

export function Sidebar({ collapsed, setCollapsed }) {
  const { user } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'My Tasks', path: '/my-tasks', icon: CheckSquare },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Kanban Board', path: '/kanban', icon: Columns3 },
    { label: 'Team', path: '/team', icon: Users },
    { label: 'Collaboration', path: '/collaboration', icon: MessagesSquare },
    { label: 'Project Insights', path: '/insights', icon: Activity, badge: 'AI' },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const getRoleIcon = () => {
    if (user?.role === 'ADMIN') return ShieldCheck;
    if (user?.role === 'PROJECT_MANAGER') return Briefcase;
    return UserCheck;
  };
  const RoleIcon = getRoleIcon();

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all duration-300 z-30 select-none flex-shrink-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80">
        <Link to="/" className="flex items-center gap-3 overflow-hidden">
          <img src="/logo.svg" alt="Taskora Pulse Logo" className="w-9 h-9 flex-shrink-0" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base bg-gradient-to-r from-brand-600 via-cyan-600 to-brand-800 dark:from-brand-400 dark:via-cyan-400 dark:to-brand-300 bg-clip-text text-transparent tracking-tight">
                Taskora Pulse
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                Team Intelligence
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'w-5 h-5 flex-shrink-0 transition-colors',
                      isActive
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 uppercase">
                      {item.badge}
                    </span>
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Role & User Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60',
            collapsed ? 'justify-center' : ''
          )}
        >
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
            alt={user?.name}
            className="w-9 h-9 rounded-xl object-cover ring-2 ring-brand-500/20 flex-shrink-0"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {user?.name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <RoleIcon className="w-3 h-3 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  {ROLE_LABELS[user?.role] || user?.role}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
