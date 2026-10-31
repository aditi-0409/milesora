import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatDate, getDeadlineStatus, formatTimeAgo } from '../../utils/dateUtils';
import { TASK_STATUS_CONFIG, PRIORITY_CONFIG } from '../../utils/formatters';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Flame, 
  ArrowUpRight, 
  FolderKanban, 
  Columns3,
  CalendarCheck2,
  CheckCircle2
} from 'lucide-react';

export function EmployeeDashboard({ data, user, onOpenQuickCreate }) {
  const {
    myActiveTasks = [],
    myCompletedCount = 0,
    myOverdueCount = 0,
    myOverdueTasks = [],
    tasksDueToday = [],
    recentActivity = []
  } = data || {};

  const totalAssigned = myActiveTasks.length + myCompletedCount;
  const workloadLevel = myActiveTasks.length >= 6 ? 'Heavy' : myActiveTasks.length >= 4 ? 'Moderate' : 'Optimal';
  const workloadColor = myActiveTasks.length >= 6 ? 'text-rose-500' : myActiveTasks.length >= 4 ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-brand-900/40">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Personal Execution Workspace
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-lg">
            You have <strong className="text-white">{myActiveTasks.length} active tasks</strong> assigned to you across projects. Let&apos;s get them delivered on schedule.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/kanban">
            <Button variant="secondary" size="sm" leftIcon={Columns3}>
              My Board
            </Button>
          </Link>
          <Button variant="pulse" size="sm" leftIcon={CheckSquare} onClick={onOpenQuickCreate}>
            New Task
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Workload</span>
            <Flame className={`w-4 h-4 ${workloadColor}`} />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {myActiveTasks.length} Tasks
          </div>
          <p className={`text-xs font-medium mt-1 ${workloadColor}`}>
            Status: {workloadLevel} Load
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Due Today</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {tasksDueToday.length}
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
            Focus milestones
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overdue Alerts</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {myOverdueCount}
          </div>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
            Requires attention
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed Deliveries</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {myCompletedCount}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Signed off
          </p>
        </Card>
      </div>

      {/* Main Focus: My Active Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          className="lg:col-span-2"
          title="My Active Tasks"
          subtitle="Prioritized work items currently assigned to your queue"
          action={
            <Link to="/my-tasks" className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-semibold">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {myActiveTasks.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              No active tasks assigned! Enjoy your clear queue.
            </p>
          ) : (
            <div className="space-y-3">
              {myActiveTasks.map(t => {
                const deadline = getDeadlineStatus(t.dueDate, t.status);
                const priorityConfig = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.MEDIUM;
                const statusConfig = TASK_STATUS_CONFIG[t.status] || TASK_STATUS_CONFIG.TO_DO;

                return (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-brand-400 dark:hover:border-brand-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-200/70 dark:bg-slate-700/60 px-1.5 py-0.5 rounded">
                          {t.taskCode || `#${t.id}`}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate">
                          {t.projectName}
                        </span>
                        <Badge variant={t.priority === 'CRITICAL' ? 'danger' : t.priority === 'HIGH' ? 'warning' : 'default'} size="sm">
                          {priorityConfig.label}
                        </Badge>
                      </div>
                      <Link
                        to={`/tasks?highlight=${t.id}`}
                        className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors line-clamp-1"
                      >
                        {t.title}
                      </Link>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                          {deadline.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Due {formatDate(t.dueDate)}
                        </span>
                      </div>
                      <Badge variant={t.status === 'IN_PROGRESS' ? 'primary' : 'default'} size="sm">
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Right Column: Due Today Focus & Quick Project Links */}
        <div className="space-y-6">
          <Card title="Today's Priority Deadlines" subtitle="Items due by end of day">
            <div className="space-y-3">
              {tasksDueToday.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 flex flex-col items-center gap-2">
                  <CalendarCheck2 className="w-8 h-8 text-emerald-500/60" />
                  <span>No tasks due today. Good pace!</span>
                </div>
              ) : (
                tasksDueToday.map(t => (
                  <div key={t.id} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                    <span className="font-mono text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      {t.taskCode}
                    </span>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 line-clamp-1">
                      {t.title}
                    </h5>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-200/60 dark:border-amber-800/60 text-[10px] text-amber-800 dark:text-amber-300">
                      <span>{t.projectName}</span>
                      <Link to="/kanban" className="font-bold underline">
                        Update Status &rarr;
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card title="My Workspaces" subtitle="Direct access to assigned projects">
            <div className="space-y-2">
              <Link
                to="/projects/1"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-1 rounded">
                    CAM
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Cloud Architecture Modernization
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/projects/2"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950 px-2 py-1 rounded">
                    TPM
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Milesora Mobile App V2
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
