
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDemoMode } from '../../context/DemoModeContext';
import { dashboardService } from '../../services/dashboardService';
import { AdminDashboard } from './AdminDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { EmployeeDashboard } from './EmployeeDashboard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { QuickCreateModal } from '../../components/layout/QuickCreateModal';
import { ROLE_LABELS } from '../../utils/formatters';
import { Shield, Briefcase, User, Sparkles } from 'lucide-react';

export function DashboardPage() {
  const { user, switchRoleForDemo } = useAuth();
  const { isDemo } = useDemoMode();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError('Please log in to view your dashboard.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await dashboardService.getDashboardData(user);
      setData(response);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
      setError(
        err.message || 'Unable to fetch dashboard statistics from server.'
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && !data) {
    return (
      <LoadingSpinner
        text="Computing real-time workspace intelligence..."
        size="lg"
      />
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center">
        <h3 className="text-base font-bold text-rose-700 dark:text-rose-300">
          Backend Service Unavailable
        </h3>

        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 max-w-md mx-auto">
          {error}
        </p>

        <button
          onClick={loadData}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 disabled:opacity-50"
        >
          {loading ? 'Retrying...' : 'Retry Connection'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Refresh failed: {error}
          </p>
          <button
            onClick={loadData}
            disabled={loading}
            className="text-xs font-semibold text-amber-800 dark:text-amber-200"
          >
            Retry
          </button>
        </div>
      )}

      {isDemo && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>Active Dashboard Perspective:</span>
            <span className="text-brand-600 dark:text-brand-400 font-extrabold uppercase">
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium mr-1 hidden sm:inline">
              Preview As:
            </span>

            <button
              onClick={() => switchRoleForDemo('ADMIN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                user?.role === 'ADMIN'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>

            <button
              onClick={() => switchRoleForDemo('PROJECT_MANAGER')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                user?.role === 'PROJECT_MANAGER'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Project Mgr</span>
            </button>

            <button
              onClick={() => switchRoleForDemo('EMPLOYEE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                user?.role === 'EMPLOYEE'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Employee</span>
            </button>
          </div>
        </div>
      )}

      {user?.role === 'ADMIN' && (
        <AdminDashboard
          data={data}
          onOpenQuickCreate={() => setQuickCreateOpen(true)}
        />
      )}

      {user?.role === 'PROJECT_MANAGER' && (
        <ManagerDashboard
          data={data}
          onOpenQuickCreate={() => setQuickCreateOpen(true)}
        />
      )}

      {user?.role === 'EMPLOYEE' && (
        <EmployeeDashboard
          data={data}
          user={user}
          onOpenQuickCreate={() => setQuickCreateOpen(true)}
        />
      )}

      <QuickCreateModal
        isOpen={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onCreated={loadData}
      />
    </div>
  );
}
