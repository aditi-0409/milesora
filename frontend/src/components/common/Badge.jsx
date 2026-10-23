import React from 'react';
import { cn } from '../../utils/formatters';

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
  ...props
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    primary: 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 border-brand-200 dark:border-brand-800',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    accent: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/70 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  };

  const dotColors = {
    default: 'bg-slate-400',
    primary: 'bg-brand-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    accent: 'bg-cyan-500',
    sky: 'bg-sky-500',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border font-medium transition-colors select-none',
        variants[variant] || variants.default,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            dotColors[variant] || dotColors.default
          )}
        />
      )}
      <span>{children}</span>
    </span>
  );
}
