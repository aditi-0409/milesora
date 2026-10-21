import { getDaysRemaining } from './dateUtils';

/**
 * Taskora Pulse Deterministic Project Risk Engine
 * Documented rule set for evaluating project and task health.
 * 
 * Rules:
 * 1. Overdue Risk: Incomplete task with due date in past -> +35 risk points.
 * 2. Approaching Deadline: Incomplete task due in <= 3 days -> +20 risk points.
 * 3. Incomplete Prerequisite Blocker: Task has prerequisite dependencies not COMPLETED -> +25 risk points.
 * 4. Priority Weight: CRITICAL adds +15, HIGH adds +10.
 * 5. Assignee Overload: Assignee has > 4 active incomplete tasks -> +10 risk points.
 */

export function calculateTaskRisk(task, allTasks = [], memberActiveTaskCounts = {}) {
  if (task.status === 'COMPLETED') {
    return {
      score: 0,
      level: 'LOW',
      reasons: [],
      factors: [],
      recommendedAction: 'Task completed successfully.'
    };
  }

  let score = 5; // Base uncertainty
  const reasons = [];
  const factors = [];
  const days = getDaysRemaining(task.dueDate);

  // 1. Overdue Rule
  if (days !== null && days < 0) {
    score += 35;
    reasons.push(`Task is overdue by ${Math.abs(days)} day(s).`);
    factors.push('Overdue Deadline');
  } else if (days !== null && days <= 3) {
    score += 20;
    reasons.push(`Deadline is approaching in ${days === 0 ? 'today' : `${days} day(s)`}.`);
    factors.push('Approaching Deadline');
  }

  // 2. Dependency Rule
  if (task.dependencyIds && task.dependencyIds.length > 0) {
    const uncompletedDependencies = allTasks.filter(t => 
      task.dependencyIds.includes(t.id) && t.status !== 'COMPLETED'
    );
    if (uncompletedDependencies.length > 0) {
      score += 25;
      const titles = uncompletedDependencies.map(d => d.taskCode || d.title).join(', ');
      reasons.push(`Prerequisite task(s) [${titles}] are not yet completed.`);
      factors.push('Blocked by Dependency');
    }
  }

  // 3. Priority Rule
  if (task.priority === 'CRITICAL') {
    score += 15;
    factors.push('Critical Priority');
  } else if (task.priority === 'HIGH') {
    score += 10;
    factors.push('High Priority');
  }

  // 4. Assignee Workload Rule
  const assigneeId = task.assignee?.id || task.assigneeId;
  const activeCount = memberActiveTaskCounts[assigneeId] || 0;
  if (activeCount >= 5) {
    score += 15;
    reasons.push(`Assignee is managing ${activeCount} active tasks (above threshold of 4).`);
    factors.push('Workload Overload');
  }

  // Cap score at 100
  score = Math.min(score, 100);

  // Determine Level
  let level = 'LOW';
  if (score >= 70) level = 'CRITICAL';
  else if (score >= 45) level = 'HIGH';
  else if (score >= 25) level = 'MEDIUM';

  // Determine Actionable Recommendation
  let recommendedAction = 'Monitor regular progress.';
  if (factors.includes('Blocked by Dependency') && factors.includes('Approaching Deadline')) {
    recommendedAction = 'Expedite blocking prerequisite tasks or negotiate deadline extension.';
  } else if (factors.includes('Overdue Deadline')) {
    recommendedAction = 'Reschedule due date or assign pairing support immediately.';
  } else if (factors.includes('Workload Overload')) {
    recommendedAction = 'Rebalance active tasks across team members.';
  } else if (factors.includes('Approaching Deadline')) {
    recommendedAction = 'Verify milestone dependencies and prioritize today.';
  }

  return {
    score,
    level,
    reasons: reasons.length > 0 ? reasons : ['Normal operational timeline.'],
    factors,
    recommendedAction
  };
}

/**
 * Calculates aggregate project health score (0-100)
 */
export function calculateProjectHealth(projectTasks = [], allTasks = [], memberActiveCounts = {}) {
  if (!projectTasks || projectTasks.length === 0) {
    return {
      healthScore: 100,
      healthStatus: 'HEALTHY',
      atRiskCount: 0,
      overdueCount: 0,
      blockedCount: 0,
      riskDistribution: { critical: 0, high: 0, medium: 0, low: 0 }
    };
  }

  let totalRiskPoints = 0;
  let overdueCount = 0;
  let blockedCount = 0;
  const riskDistribution = { critical: 0, high: 0, medium: 0, low: 0 };
  const evaluatedTasks = [];

  projectTasks.forEach(task => {
    const risk = calculateTaskRisk(task, allTasks, memberActiveCounts);
    evaluatedTasks.push({ ...task, risk });

    if (risk.level === 'CRITICAL') riskDistribution.critical++;
    else if (risk.level === 'HIGH') riskDistribution.high++;
    else if (risk.level === 'MEDIUM') riskDistribution.medium++;
    else riskDistribution.low++;

    if (risk.factors.includes('Overdue Deadline')) overdueCount++;
    if (risk.factors.includes('Blocked by Dependency')) blockedCount++;

    totalRiskPoints += risk.score;
  });

  const avgRisk = totalRiskPoints / projectTasks.length;
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - avgRisk)));

  let healthStatus = 'HEALTHY';
  if (healthScore < 50 || riskDistribution.critical > 0) {
    healthStatus = 'CRITICAL';
  } else if (healthScore < 75 || riskDistribution.high > 1) {
    healthStatus = 'NEEDS_ATTENTION';
  }

  return {
    healthScore,
    healthStatus,
    atRiskCount: riskDistribution.critical + riskDistribution.high,
    overdueCount,
    blockedCount,
    riskDistribution,
    evaluatedTasks
  };
}
