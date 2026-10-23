import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useDemoMode } from '../../context/DemoModeContext';
import { notificationService } from '../../services/notificationService';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { ROLE_LABELS, cn } from '../../utils/formatters';
import {
  Menu,
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  Sparkles,
  ChevronDown,
  RotateCcw,
  CheckCheck
} from 'lucide-react';

export function Topbar({ onOpenMobile, onOpenSearch, onOpenQuickCreate }) {
  const { user, logout, switchRoleForDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isDemo, toggleDemoMode, resetMockData } = useDemoMode();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);
  const roleRef = useRef(null);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const notifs = await notificationService.getAll(user?.id);
        setNotifications(notifs || []);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    }
    loadNotifications();
  }, [user]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleRoleSelect = (role) => {
    switchRoleForDemo(role);
    setShowRoleMenu(false);
  };

  return (
    <header className="h-16 px-4 md:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-20 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Middle: Global Search Trigger (Ctrl+K) */}
      <div className="flex-1 max-w-md hidden lg:block">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all text-xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search tasks, projects, people...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[10px] text-slate-500">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Create Action */}
        <button
          onClick={onOpenQuickCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create</span>
        </button>

        {/* Role Preview Switcher Badge (for testing & evaluation) */}
        {isDemo && (
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 border border-brand-200/80 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-medium transition-colors"
              title="Switch demo evaluation role"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span className="hidden md:inline font-semibold">{ROLE_LABELS[user?.role] || user?.role}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Role Perspective
                </div>
                <button
                  onClick={() => handleRoleSelect('ADMIN')}
                  className={cn(
                    'w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between',
                    user?.role === 'ADMIN' ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'
                  )}
                >
                  <span>Administrator (Elena)</span>
                  {user?.role === 'ADMIN' && <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
                </button>
                <button
                  onClick={() => handleRoleSelect('PROJECT_MANAGER')}
                  className={cn(
                    'w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between',
                    user?.role === 'PROJECT_MANAGER' ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'
                  )}
                >
                  <span>Project Manager (Sarah)</span>
                  {user?.role === 'PROJECT_MANAGER' && <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
                </button>
                <button
                  onClick={() => handleRoleSelect('EMPLOYEE')}
                  className={cn(
                    'w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between',
                    user?.role === 'EMPLOYEE' ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'
                  )}
                >
                  <span>Team Member (Alex)</span>
                  {user?.role === 'EMPLOYEE' && <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
                </button>
                <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                  <button
                    onClick={resetMockData}
                    className="w-full text-left px-3 py-1.5 text-[11px] text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Demo Database</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate(notif.link || '/notifications');
                      }}
                      className={cn(
                        'p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex gap-3 items-start',
                        !notif.isRead ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                      )}
                    >
                      <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', !notif.isRead ? 'bg-brand-600' : 'bg-transparent')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                          {notif.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline"
                >
                  View All Notifications &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Profile Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="User profile menu"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
              alt={user?.name}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {user?.email}
                </p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {ROLE_LABELS[user?.role] || user?.role}
                </span>
              </div>

              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile & Preferences</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>System Settings</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
