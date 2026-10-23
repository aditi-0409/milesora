import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const ROLE_LABELS = {
  ADMIN: 'Administrator',
  PROJECT_MANAGER: 'Project Manager',
  EMPLOYEE: 'Team Member',
};

export const PROJECT_STATUS_CONFIG = {
  PLANNING: { label: 'Planning', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800' },
  ACTIVE: { label: 'Active', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' },
  ON_HOLD: { label: 'On Hold', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800/80 dark:text-slate-300 border-slate-300 dark:border-slate-700' },
  COMPLETED: { label: 'Completed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800' },
  ARCHIVED: { label: 'Archived', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-300 dark:border-gray-700' },
};

export const TASK_STATUS_CONFIG = {
  TO_DO: { label: 'To Do', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-brand-100 text-brand-800 dark:bg-brand-950/70 dark:text-brand-300 border-brand-300 dark:border-brand-800' },
  IN_REVIEW: { label: 'In Review', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border-orange-300 dark:border-orange-800' },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' },
};

export const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400' },
  MEDIUM: { label: 'Medium', color: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300' },
  HIGH: { label: 'High', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
  CRITICAL: { label: 'Critical', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' },
};

export function getInitials(name = '') {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function formatHours(hours = 0) {
  if (hours <= 0) return '0h';
  return `${hours}h`;
}
