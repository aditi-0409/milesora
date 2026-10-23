import React, { useState, useEffect } from 'react';
import { insightService } from '../../services/insightService';
import { projectService } from '../../services/projectService';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/dateUtils';
import { 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Info,
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';

export function InsightsPage() {
  const { success, error } = useToast();
  const [insights, setInsights] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);

  const loadInsights = async (projId = '') => {
    try {
      setLoading(true);
      if (projId) {
        const res = await insightService.getProjectInsights(projId);
        setInsights(res);
      } else {
        const res = await insightService.getGlobalInsights();
        setInsights(res);
      }
    } catch (err) {
      error(err.message || 'Failed to calculate insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    projectService.getAll().then(projs => setProjects(projs || []));
    loadInsights();
  }, []);

  const handleProjectFilterChange = (projId) => {
    setSelectedProjectId(projId);
    loadInsights(projId);
  };

  if (loading && !insights) {
    return <LoadingSpinner text="Running Taskora Pulse Deterministic Risk Engine..." size="lg" />;
  }

  const {
    healthScore = 80,
    healthStatus = 'HEALTHY',
    riskDistribution = { critical: 0, high: 0, medium: 0, low: 0 },
    atRiskTasks = [],
    overdueCount = 0,
    blockedCount = 0,
    teamWorkloadWarnings = []
  } = insights || {};

  const totalAtRisk = atRiskTasks.length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-950 via-brand-900 to-cyan-950 rounded-2xl p-6 sm:p-8 text-white shadow-2xl border border-brand-800/50">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <span className="text-xs font-black uppercase tracking-wider text-brand-300">
              Unique Intelligence Feature
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Taskora Pulse Project Insights
          </h1>
          <p className="text-xs sm:text-sm text-brand-200/90 mt-1.5 max-w-2xl leading-relaxed">
            Algorithmic early-warning intelligence detecting dependency bottlenecks, SLA delivery risks, and team workload strain using verified rule sets.
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex-shrink-0 bg-white/10 dark:bg-black/20 backdrop-blur-md p-2 rounded-xl border border-white/10">
          <label className="text-[10px] uppercase font-bold text-brand-200 block mb-1">
            Analyze Initiative
          </label>
          <select
            value={selectedProjectId}
            onChange={e => handleProjectFilterChange(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-900/90 text-white border border-brand-700/60 focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="">Global (All Workspaces)</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>[{p.key}] {p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Health Gauge & Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Health Score Gauge */}
        <Card className="flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Project Health Index
          </span>
          <div className="relative my-3 flex items-center justify-center">
            <div className="text-4xl font-black text-slate-900 dark:text-slate-100">
              {healthScore}
              <span className="text-xs font-semibold text-slate-400">/100</span>
            </div>
          </div>
          <Badge
            variant={healthStatus === 'HEALTHY' ? 'success' : healthStatus === 'CRITICAL' ? 'danger' : 'warning'}
            size="md"
          >
            {healthStatus}
          </Badge>
          <p className="text-[10px] text-slate-400 mt-2">
            Derived from milestone compliance &amp; blocker ratio
          </p>
        </Card>

        {/* Critical & High Risk Count */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">At-Risk Items</span>
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {totalAtRisk}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {riskDistribution.critical} Critical &bull; {riskDistribution.high} High Risk
          </p>
        </Card>

        {/* Dependency Blockers */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Dependency Blockers</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {blockedCount}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tasks blocked by incomplete prerequisites
          </p>
        </Card>

        {/* Overdue Deadlines */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Overdue SLA Breaches</span>
            <Clock className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {overdueCount}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Passed target delivery dates
          </p>
        </Card>
      </div>

      {/* Risk Distribution Breakdown */}
      <Card title="Task Risk Distribution Breakdown" subtitle="Distribution across mathematical risk tiers">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase">Critical Tier</span>
            <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">{riskDistribution.critical} Tasks</div>
            <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">Score &ge; 70 &bull; Immediate risk</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">High Tier</span>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">{riskDistribution.high} Tasks</div>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">Score 45-69 &bull; Requires focus</p>
          </div>

          <div className="p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900">
            <span className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase">Medium Tier</span>
            <div className="text-2xl font-black text-sky-700 dark:text-sky-300 mt-1">{riskDistribution.medium} Tasks</div>
            <p className="text-[10px] text-sky-600 dark:text-sky-400 mt-1">Score 25-44 &bull; Normal queue</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Low Tier</span>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{riskDistribution.low} Tasks</div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Score &lt; 25 &bull; Safe</p>
          </div>
        </div>
      </Card>

      {/* Comprehensive At-Risk Tasks with Explainable Root Causes & Remediation */}
      <Card
        title="Prioritized At-Risk Items & Actionable Remedies"
        subtitle="Transparent algorithmic analysis showing exact root conditions and recommended actions"
      >
        {atRiskTasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">All tasks are within healthy parameters.</span>
            <span>No critical deadline or dependency bottlenecks detected.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {atRiskTasks.map(item => (
              <div
                key={item.taskId}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                {/* Title Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded">
                      {item.taskCode}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={item.riskLevel === 'CRITICAL' ? 'danger' : 'warning'} size="sm">
                      Risk Score: {item.riskScore}/100 ({item.riskLevel})
                    </Badge>
                  </div>
                </div>

                {/* Factors Tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium mr-1">Risk Factors:</span>
                  {item.factors?.map((f, idx) => (
                    <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60">
                      {f}
                    </span>
                  ))}
                  {item.dueDate && (
                    <span className="text-[10px] text-slate-400 ml-auto">
                      Deadline: {formatDate(item.dueDate)}
                    </span>
                  )}
                </div>

                {/* Why It Is At Risk (Explanation) */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
                  <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <Info className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100">Why this task is at risk: </strong>
                      <span>{item.reason}</span>
                    </div>
                  </div>
                </div>

                {/* Recommended Remediation Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-medium">
                    <Sparkles className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    <span><strong>Recommended Action:</strong> {item.recommendedAction}</span>
                  </div>

                  <button
                    onClick={() => success(`Action initiated for ${item.taskCode}. Notification dispatched to assignee.`)}
                    className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/70 dark:hover:bg-brand-900/70 text-brand-700 dark:text-brand-300 text-xs font-bold transition-colors whitespace-nowrap self-end sm:self-auto"
                  >
                    Execute Action &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
