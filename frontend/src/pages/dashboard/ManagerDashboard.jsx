import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatDate, formatTimeAgo, getDeadlineStatus } from '../../utils/dateUtils';
import { PROJECT_STATUS_CONFIG, PRIORITY_CONFIG } from '../../utils/formatters';
import { 
  FolderKanban, 
  CheckSquare, 
  AlertTriangle, 
  Clock, 
  Layers, 
  ArrowUpRight, 
  Plus, 
  AlertCircle,
  TrendingUp,
  Columns3
} from 'lucide-react';

export function ManagerDashboard({ data, onOpenQuickCreate }) {
  const {
  managedProjects = [],
  totalProjects = 0,
  totalTasks = 0,
  completedTasks = 0,
  inProgressTasks = 0,
  inReviewTasks = 0,
  toDoTasks = 0,
  overdueTasks = [],
  blockedTasks = [],
  recentActivity = []
} = data || {};

const projectsList = Array.isArray(managedProjects)
  ? managedProjects
  : Array.isArray(managedProjects?.data)
    ? managedProjects.data
    : Array.isArray(managedProjects?.content)
      ? managedProjects.content
      : [];

const managedProjectsCount = Array.isArray(managedProjects)
  ? managedProjects.length
  : Number(managedProjects) || 0;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-800 via-brand-700 to-cyan-800 rounded-2xl p-6 text-white shadow-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-200">
            Project Delivery Oversight
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
            Project Manager Hub
          </h1>
          <p className="text-xs text-brand-200/90 mt-1 max-w-lg">
            Monitor sprint milestones, resolve dependency blockers, and ensure on-time delivery across your initiatives.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/kanban">
            <Button variant="secondary" size="sm" leftIcon={Columns3}>
              Open Kanban
            </Button>
          </Link>
          <Button variant="pulse" size="sm" leftIcon={Plus} onClick={onOpenQuickCreate}>
            New Task / Project
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Managed Projects</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {managedProjectsCount}
          </div>
          <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-1">
            Active Leadership
          </p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Completion</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {completionRate}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${completionRate}%` }} />
          </div>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Blocked Tasks</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {blockedTasks.length}
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
            Prerequisites pending
          </p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overdue Tasks</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {overdueTasks.length}
          </div>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
            Requires intervention
          </p>
        </Card>
      </div>

      {/* Managed Projects Showcase */}
      <Card
        title="Active Managed Projects"
        subtitle="Current status, delivery velocity and progress breakdown"
        action={
          <Link to="/projects" className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-semibold">
            View All Projects <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projectsList.map(p => {
            const statusConfig = PROJECT_STATUS_CONFIG[p.status] || PROJECT_STATUS_CONFIG.PLANNING;
            const progress = p.taskStats?.progressPercentage || 0;
            return (
              <div
                key={p.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-brand-400 dark:hover:border-brand-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-100/70 dark:bg-brand-950 px-2 py-0.5 rounded-lg">
                      {p.key}
                    </span>
                    <Badge variant={p.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    <Link to={`/projects/${p.id}`} className="hover:text-brand-600 transition-colors">
                      {p.name}
                    </Link>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {p.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-600 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
                    <span>Deadline: {formatDate(p.dueDate)}</span>
                    <Link to={`/projects/${p.id}`} className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                      Project Board &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Status Breakdown & Blocked Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <Card title="Task Pipeline Distribution" subtitle="Work items across development stages">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600 dark:text-slate-400">To Do</span>
                <span>{toDoTasks} tasks</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full" style={{ width: totalTasks ? `${(toDoTasks / totalTasks) * 100}%` : '0%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-brand-600 dark:text-brand-400">In Progress</span>
                <span>{inProgressTasks} tasks</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-600 h-full" style={{ width: totalTasks ? `${(inProgressTasks / totalTasks) * 100}%` : '0%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-orange-600 dark:text-orange-400">In Review / QA</span>
                <span>{inReviewTasks} tasks</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-orange-600 h-full" style={{ width: totalTasks ? `${(inReviewTasks / totalTasks) * 100}%` : '0%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-600 dark:text-emerald-400">Completed</span>
                <span>{completedTasks} tasks</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: totalTasks ? `${(completedTasks / totalTasks) * 100}%` : '0%' }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Blocked and At-Risk Items */}
        <Card
          title="Dependency Blockers & Overdue"
          subtitle="Work items needing manager resolution"
          action={
            <Link to="/tasks" className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold">
              Manage Tasks
            </Link>
          }
        >
          <div className="space-y-3">
            {blockedTasks.length === 0 && overdueTasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                All managed tasks are currently on schedule with no blocking dependencies!
              </p>
            ) : (
              <>
                {blockedTasks.map(t => (
                  <div key={t.id} className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          [{t.taskCode}] {t.title}
                        </span>
                        <Badge variant="warning" size="sm">Blocked</Badge>
                      </div>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                        Prerequisites: {t.dependencyTitles?.join(', ') || 'Incomplete dependency'}
                      </p>
                    </div>
                  </div>
                ))}

                {overdueTasks.map(t => (
                  <div key={t.id} className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          [{t.taskCode}] {t.title}
                        </span>
                        <Badge variant="danger" size="sm">Overdue</Badge>
                      </div>
                      <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                        Due date was {formatDate(t.dueDate)} &bull; Assignee: {t.assignee?.name}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
