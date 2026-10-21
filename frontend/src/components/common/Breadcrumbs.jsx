import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_NAME_MAP = {
  projects: 'Projects',
  tasks: 'Tasks',
  kanban: 'Kanban Board',
  team: 'Team & Workload',
  insights: 'Project Insights',
  collaboration: 'Collaboration',
  reports: 'Reports & Analytics',
  notifications: 'Notifications',
  settings: 'Settings & Profile'
};

export function Breadcrumbs({ customCrumbs }) {
  const location = useLocation();

  if (customCrumbs) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
          <Home className="w-3.5 h-3.5" />
        </Link>
        {customCrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
            {crumb.path ? (
              <Link to={crumb.path} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }

  const segments = location.pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Overview</span>
      </Link>
      {segments.map((segment, idx) => {
        const path = `/${segments.slice(0, idx + 1).join('/')}`;
        const isLast = idx === segments.length - 1;
        const name = ROUTE_NAME_MAP[segment] || (!isNaN(segment) ? `#${segment}` : segment);

        return (
          <React.Fragment key={path}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {name}
              </span>
            ) : (
              <Link to={path} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
