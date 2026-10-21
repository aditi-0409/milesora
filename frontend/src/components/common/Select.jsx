import React, { forwardRef } from 'react';
import { cn } from '../../utils/formatters';
import { ChevronDown, AlertCircle } from 'lucide-react';

export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    className = '',
    containerClassName = '',
    id,
    required = false,
    children,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={cn(
            'w-full text-sm px-3.5 py-2.5 rounded-xl border appearance-none transition-all duration-150 pr-10',
            'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
            'border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
            error ? 'border-rose-500 focus:ring-rose-500' : '',
            className
          )}
          {...props}
        >
          {children || options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
      </div>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {!error && helperText && (
        <span className="text-xs text-slate-500 dark:text-slate-400">{helperText}</span>
      )}
    </div>
  );
});
