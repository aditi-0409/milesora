import React from 'react';
import { cn } from '../../utils/formatters';

export function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  footer,
  noPadding = false,
  ...props
}) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all',
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
      {footer && (
        <div className="px-6 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
}
