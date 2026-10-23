import React, { forwardRef, useState } from 'react';
import { cn } from '../../utils/formatters';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    type = 'text',
    className = '',
    containerClassName = '',
    id,
    required = false,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          ref={ref}
          id={inputId}
          type={effectiveType}
          required={required}
          className={cn(
            'w-full text-sm px-3.5 py-2.5 rounded-xl border transition-all duration-150',
            'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
            error ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : '',
            isPassword ? 'pr-10' : '',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(p => !p)}
            className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
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
