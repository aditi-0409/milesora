import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import { insightService } from '../../services/insightService';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { formatDate, formatTimeAgo, getDeadlineStatus } from '../../utils/dateUtils';
import { PROJECT_STATUS_CONFIG, PRIORITY_CONFIG, TASK_STATUS_CONFIG } from '../../utils/formatters';
import { 
  FolderKanban, 
  CheckSquare, 
  Columns3, 
  Users, 
  Activity, 
  Sparkles, 
  ArrowLeft, 
  Calendar, 
  Plus, 
  AlertTriangle, 
  Clock, 
  ShieldAlert,
  CheckCircle2,
  ListTodo
} from 'lucide-react';

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tasks' | 'kanban' | 'team' | 'activity' | 'insights'

  const loadData = async () => {
    try {
      setLoading(true);
      const [proj, tList, ins] = await Promise.all([
        projectService.getById(id),
        taskService.getAll({ projectId: id }),
        insightService.getProjectInsights(id)
      ]);
      setProject(proj);
      setTasks(tList || []);
      setInsights(ins);
    } catch (err) {
      error(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading && !project) {
    return <LoadingSpinner text="Loading project workspace..." size="lg" />;
  }

  if (!project) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">The requested project could not be found or has been removed.</p>
        <Link to="/projects">
          <Button variant="primary">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  // Calculate real progress from tasks
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statusConfig = PROJECT_STATUS_CONFIG[project.status] || PROJECT_STATUS_CONFIG.PLANNING;
  const priorityConfig = PRIORITY_CONFIG[project.priority] || PRIORITY_CONFIG.MEDIUM;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FolderKanban },
    { id: 'tasks', label: `Tasks (${totalTasks})`, icon: CheckSquare },
    { id: 'kanban', label: 'Kanban Board', icon: Columns3 },
    { id: 'team', label: `Team (${project.members?.length || 0})`, icon: Users },
    { id: 'insights', label: 'Project Insights', icon: Activity, badge: 'Intelligence' },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation Back */}
      <div className="flex items-center justify-between">
        <Breadcrumbs
          customCrumbs={[
            { label: 'Projects', path: '/projects' },
            { label: project.name }
          ]}
        />
        <Link to="/projects">
          <Button variant="ghost" size="sm" leftIcon={ArrowLeft}>
            All Projects
          </Button>
        </Link>
      </div>

      {/* Project Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2.5 py-1 rounded-lg">
                {project.key}
              </span>
              <Badge variant={project.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                {statusConfig.label}
              </Badge>
              <Badge variant={project.priority === 'CRITICAL' ? 'danger' : project.priority === 'HIGH' ? 'warning' : 'default'} size="sm">
                {priorityConfig.label} Priority
              </Badge>
              {insights && (
                <Badge variant={insights.healthStatus === 'HEALTHY' ? 'success' : insights.healthStatus === 'CRITICAL' ? 'danger' : 'warning'} size="sm">
                  Health: {insights.healthScore}/100
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {project.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {project.description || 'No detailed scope provided.'}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Due {formatDate(project.dueDate)}</span>
            </div>
            <Link to={`/kanban?project=${project.id}`}>
              <Button variant="pulse" size="sm" leftIcon={Columns3}>
                Open Interactive Kanban
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    active ? 'bg-white/20 text-white' : 'bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <span className="text-xs font-semibold text-slate-500">Milestone Progress</span>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {progressPercentage}%
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-brand-600 h-full rounded-full" style={{ width: `${progressPercentage}%` }} />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                {completedTasks} of {totalTasks} work items completed
              </p>
            </Card>

            <Card>
              <span className="text-xs font-semibold text-slate-500">Lead Project Manager</span>
              <div className="flex items-center gap-3 mt-2">
                <img
                  src={project.manager?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=PM`}
                  alt={project.manager?.name}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-500/20"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{project.manager?.name}</h4>
                  <p className="text-[11px] text-slate-400">{project.manager?.email}</p>
                </div>
              </div>
            </Card>

            <Card>
              <span className="text-xs font-semibold text-slate-500">Risk Assessment</span>
              <div className="text-2xl font-black mt-1 text-brand-600 dark:text-brand-400">
                {insights?.healthScore || 85}/100
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                Condition: {insights?.healthStatus || 'HEALTHY'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {insights?.atRiskTasks?.length || 0} tasks flagged for attention
              </p>
            </Card>
          </div>

          {/* Quick Task List preview */}
          <Card
            title="Work Breakdown Schedule"
            subtitle="Tasks registered in this initiative"
            action={
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold"
              >
                View All &rarr;
              </button>
            }
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {tasks.slice(0, 5).map(t => (
                <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {t.taskCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {t.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={t.status === 'COMPLETED' ? 'success' : t.status === 'IN_PROGRESS' ? 'primary' : 'default'} size="sm">
                      {t.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Tasks List */}
      {activeTab === 'tasks' && (
        <Card title={`Project Tasks (${tasks.length})`} subtitle="All active and completed work items">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Task Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {t.taskCode}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {t.title}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={t.status === 'COMPLETED' ? 'success' : t.status === 'IN_PROGRESS' ? 'primary' : 'default'} size="sm">
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={t.priority === 'CRITICAL' ? 'danger' : t.priority === 'HIGH' ? 'warning' : 'default'} size="sm">
                        {t.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {t.assignee?.name || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(t.dueDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Kanban redirect */}
      {activeTab === 'kanban' && (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Columns3 className="w-12 h-12 text-brand-600 dark:text-brand-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            Project Kanban Board
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Drag, prioritize, and update tasks specifically within {project.name}.
          </p>
          <Link to={`/kanban?project=${project.id}`}>
            <Button variant="pulse" leftIcon={Columns3}>
              Open Full Kanban View
            </Button>
          </Link>
        </div>
      )}

      {/* Tab 4: Team */}
      {activeTab === 'team' && (
        <Card title="Assigned Members" subtitle="Personnel dedicated to this initiative">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(project.members || []).map(m => (
              <div key={m.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <img
                  src={m.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name)}`}
                  alt={m.name}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-500/20"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{m.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{m.title || m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 5: Insights */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <Card title="Milesora Algorithmic Insights" subtitle="Predictive risk conditions and recommended actions">
            {insights?.atRiskTasks?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No high-risk bottlenecks detected in this project. Everything is running within target thresholds!
              </div>
            ) : (
              <div className="space-y-4">
                {insights?.atRiskTasks?.map(riskTask => (
                  <div
                    key={riskTask.taskId}
                    className="p-5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded">
                          {riskTask.taskCode}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {riskTask.title}
                        </h4>
                      </div>
                      <Badge variant="danger" size="sm">
                        Risk Score: {riskTask.riskScore}/100
                      </Badge>
                    </div>

                    <div className="text-xs text-rose-800 dark:text-rose-300 bg-white/70 dark:bg-slate-900/60 p-3 rounded-lg border border-rose-200/60 dark:border-rose-900/40">
                      <strong>Risk Condition:</strong> {riskTask.reason}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500">
                        <strong>Recommended Action:</strong> {riskTask.recommendedAction}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
