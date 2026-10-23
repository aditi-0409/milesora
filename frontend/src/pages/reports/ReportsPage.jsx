import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { projectService } from '../../services/projectService';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  Download, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export function ReportsPage() {
  const { success, error } = useToast();
  const [reportData, setReportData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async (projId = '') => {
    try {
      setLoading(true);
      const [projs, data] = await Promise.all([
        projectService.getAll(),
        reportService.getReportData({ projectId: projId || undefined })
      ]);
      setProjects(projs || []);
      setReportData(data);
    } catch (err) {
      error(err.message || 'Failed to generate reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProjectFilter = (projId) => {
    setSelectedProjectId(projId);
    loadData(projId);
  };

  const handleExportCsv = () => {
    if (!reportData?.rawTasks || reportData.rawTasks.length === 0) {
      error('No task data available to export with current filter.');
      return;
    }
    const filename = selectedProjectId
      ? `taskora_pulse_project_${selectedProjectId}_report.csv`
      : 'taskora_pulse_global_delivery_report.csv';

    reportService.exportToCsv(reportData.rawTasks, filename);
    success('CSV report generated and downloaded successfully!');
  };

  if (loading && !reportData) {
    return <LoadingSpinner text="Aggregating performance analytics from API..." size="lg" />;
  }

  const {
    statusChartData = [],
    priorityChartData = [],
    projectProgressData = [],
    teamWorkloadData = [],
    summary = {}
  } = reportData || {};

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Reports &amp; Delivery Intelligence</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Realtime workload metrics, status distribution, milestone velocity and CSV data exports.
          </p>
        </div>

        <Button variant="pulse" leftIcon={Download} onClick={handleExportCsv}>
          Export CSV Report
        </Button>
      </div>

      {/* Filter and KPI Strip */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Filter Scope:</span>
          <select
            value={selectedProjectId}
            onChange={e => handleProjectFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Projects Portfolio</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>[{p.key}] {p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-slate-400">Total Work Items: </span>
            <strong className="text-slate-800 dark:text-slate-200">{summary.totalTasks}</strong>
          </div>
          <div>
            <span className="text-slate-400">Completion: </span>
            <strong className="text-emerald-600 font-bold">{summary.completionRate}%</strong>
          </div>
          <div>
            <span className="text-slate-400">Overdue: </span>
            <strong className={summary.overdueCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-800 dark:text-slate-200'}>
              {summary.overdueCount}
            </strong>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution (Pie / Donut) */}
        <Card
          title="Task Distribution by Status"
          subtitle="Work items categorized by development stage"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
                <Legend
                  formatter={(val, entry) => (
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {val} ({entry.payload.count})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Priority Breakdown (Bar Chart) */}
        <Card
          title="Task Distribution by Priority"
          subtitle="Urgency classification across selected scope"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityChartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`cell-priority-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Project Completion Velocity (Horizontal Bar) */}
        <Card
          title="Initiative Completion Velocity"
          subtitle="Percentage milestone progress per project"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectProgressData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} unit="%" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip
                  formatter={(value, name, item) => [`${value}% (${item.payload.completedTasks}/${item.payload.totalTasks} completed)`, 'Progress']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="progress" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Team Workload Allocation */}
        <Card
          title="Team Workload Distribution"
          subtitle="Active vs completed tasks per team member"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamWorkloadData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
                <Legend
                  formatter={(val) => (
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium capitalize">
                      {val === 'activeTasks' ? 'Active Incomplete' : 'Completed'}
                    </span>
                  )}
                />
                <Bar dataKey="activeTasks" fill="#60a5fa" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completedTasks" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Exportable Data Preview Table */}
      <Card
        title="Filtered Dataset Summary"
        subtitle="This exact dataset is compiled and exported via the CSV Download button"
        action={
          <Button variant="outline" size="sm" leftIcon={FileSpreadsheet} onClick={handleExportCsv}>
            Download CSV
          </Button>
        }
      >
        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800 sticky top-0">
              <tr>
                <th className="px-4 py-2.5">Task ID</th>
                <th className="px-4 py-2.5">Title</th>
                <th className="px-4 py-2.5">Project</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Priority</th>
                <th className="px-4 py-2.5">Assignee</th>
                <th className="px-4 py-2.5">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {reportData?.rawTasks?.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-2 font-mono font-bold text-brand-600 dark:text-brand-400">
                    {t.taskCode}
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">
                    {t.title}
                  </td>
                  <td className="px-4 py-2 text-slate-500 truncate">{t.projectName}</td>
                  <td className="px-4 py-2 font-semibold">{t.status}</td>
                  <td className="px-4 py-2">{t.priority}</td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                    {t.assignee?.name || 'Unassigned'}
                  </td>
                  <td className="px-4 py-2 text-slate-500">{t.dueDate || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
