import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatTimeAgo } from '../../utils/dateUtils';
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  MessageSquare, 
  FolderKanban, 
  ShieldCheck, 
  Clock,
  ArrowRight
} from 'lucide-react';

export function NotificationsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD'

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const list = await notificationService.getAll(user?.id);
      setNotifications(list || []);
    } catch (err) {
      error(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      success('Marked as read');
    } catch (err) {
      error(err.message || 'Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      success('All notifications marked as read');
    } catch (err) {
      error(err.message || 'Failed to mark all as read');
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ALERT': return AlertTriangle;
      case 'MENTION': return MessageSquare;
      case 'PROJECT': return FolderKanban;
      case 'SYSTEM': return ShieldCheck;
      default: return Bell;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving notification events..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Notification Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Stay informed of SLA alerts, mentions, prerequisite resolutions, and project milestones.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" leftIcon={CheckCheck} onClick={handleMarkAllRead}>
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'ALL'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'UNREAD'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          title={filter === 'UNREAD' ? 'You have read all notifications!' : 'No notifications'}
          description="You are completely up to date. New activity mentions and task alerts will show up here."
          icon={Bell}
        />
      ) : (
        <Card noPadding>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map(notif => {
              const Icon = getTypeIcon(notif.type);
              return (
                <div
                  key={notif.id}
                  onClick={() => navigate(notif.link || '/')}
                  className={`p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                    !notif.isRead ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                      notif.type === 'ALERT'
                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                        : 'bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-2 block">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {!notif.isRead && (
                      <button
                        onClick={e => handleMarkAsRead(notif.id, e)}
                        className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => navigate(notif.link || '/')}
                      className="p-1 rounded-lg text-slate-400 hover:text-brand-600"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
