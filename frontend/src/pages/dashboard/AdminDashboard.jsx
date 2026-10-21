import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatTimeAgo } from '../../utils/dateUtils';
import { 
  Users, 
  FolderKanban, 
  CheckSquare, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  ArrowUpRight, 
  UserPlus, 
  PlusCircle, 
  Sparkles,
  HeartHandshake
} from 'lucide-react';

export function AdminDashboard({ data, onOpenQuickCreate }) {
  const {
    totalUsers,
    totalProjects,
    activeProjects,
    completedProjects,
    totalTasks,
    overdueCount,
    overallCompletionRate,
    teamHealthScore,
    healthStatus,
    recentActivity = []
  } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-900 via-brand-800 to-cyan-900 rounded-2xl p-6 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-brand-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-200">
              Platform Administration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Enterprise Command Center
          </h1>
          <p className="text-xs text-brand-200/90 mt-1 max-w-xl">
            Real-time oversight across all workspaces, delivery velocities, team workloads, and system security.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/team">
            <Button variant="secondary" size="sm" leftIcon={Users}>
              Manage Team
            </Button>
          </Link>
          <Button variant="pulse" size="sm" leftIcon={PlusCircle} onClick={onOpenQuickCreate}>
            New Project
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Personnel</span>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalUsers}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across 3 departments</p>
          </div>
        </Card>

        {/* Total Projects */}
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Projects Pipeline</span>
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalProjects}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="text-emerald-600 font-semibold">{activeProjects} active</span> &bull; {completedProjects} finished
            </p>
          </div>
        </Card>

        {/* Total Tasks */}
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Work Items</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalTasks}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {overallCompletionRate}% completion rate
            </p>
          </div>
        </Card>

        {/* Platform Health Score */}
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">System Health Score</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{teamHealthScore}/100</div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                Status: {healthStatus}
              </p>
            </div>
            {overdueCount > 0 && (
              <Badge variant="danger" size="sm">
                {overdueCount} Overdue
              </Badge>
            )}
          </div>
        </Card>
      </div>

      {/* Middle Grid: Platform Health Breakdown & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health & Insights Card */}
        <Card
          className="lg:col-span-2"
          title="Project Health & Risk Overview"
          subtitle="Real-time delivery risks calculated by Taskora Pulse deterministic risk engine"
          action={
            <Link to="/insights" className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-semibold">
              Deep Insights <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">Delivery Velocity</span>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{overallCompletionRate}%</div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-brand-600 h-full rounded-full" style={{ width: `${overallCompletionRate}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">Active Blockers</span>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{data?.blockedCount || 0} Tasks</div>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">Requires PM unblocking</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">Overdue SLA Breaches</span>
              <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{overdueCount} Items</div>
              <p className="text-[11px] text-slate-400 mt-1">Requires deadline rescheduling</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/50 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-brand-900 dark:text-brand-200">
                Pulse Recommendation Engine
              </h4>
              <p className="text-xs text-brand-700 dark:text-brand-300 mt-0.5 leading-relaxed">
                Taskora Pulse detected 1 critical overdue task in the Mobile App project assigned to Alex Rivera. 
                Rebalancing auxiliary code reviews to Marcus Vance will protect milestone delivery on Dec 15.
              </p>
            </div>
          </div>
        </Card>

        {/* Administration Actions & Quick Shortcuts */}
        <Card title="Admin Quick Actions" subtitle="System governance shortcuts">
          <div className="space-y-3">
            <Link
              to="/team"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 bg-slate-50/50 dark:bg-slate-800/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    Invite Team Member
                  </div>
                  <div className="text-[10px] text-slate-400">Assign roles and permissions</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
            </Link>

            <Link
              to="/reports"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 bg-slate-50/50 dark:bg-slate-800/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    Export Delivery Reports
                  </div>
                  <div className="text-[10px] text-slate-400">Download CSV dataset</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
            </Link>

            <Link
              to="/settings"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 bg-slate-50/50 dark:bg-slate-800/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    Backend Connection Audit
                  </div>
                  <div className="text-[10px] text-slate-400">Verify Spring Boot REST API</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Team Activity Audit Stream */}
      <Card
        title="Enterprise Activity Audit Stream"
        subtitle="Recent real-time events across projects and tasks"
        action={
          <Link to="/collaboration" className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold">
            View All Activity
          </Link>
        }
      >
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {recentActivity.map((act) => (
            <div key={act.id} className="py-3 flex items-start gap-3">
              <img
                src={act.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(act.user?.name || 'User')}`}
                alt={act.user?.name}
                className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <span className="font-bold">{act.user?.name}</span>{' '}
                    <span className="text-slate-500 font-normal">{act.detail}</span>
                  </p>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {formatTimeAgo(act.timestamp)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="default" size="sm">
                    {act.target}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
