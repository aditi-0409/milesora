import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/formatters';

const fieldBase =
  'glass-input w-full text-sm px-3.5 py-2.5 rounded-lg border text-white placeholder:text-white/45 ' +
  'bg-white/10 border-white/20 transition-all duration-150 ' +
  'focus:outline-none focus:ring-2 focus:ring-cyan-300/60 focus:border-white/50';

function FieldLabel({ htmlFor, label, required }) {
  if (!label) return null;
  return (
    <label htmlFor={htmlFor} className="text-xs font-medium text-white/80">
      {label} {required && <span className="text-rose-300">*</span>}
    </label>
  );
}

function FieldMessage({ error, helperText }) {
  if (error) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-rose-300 font-medium">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }
  if (helperText) {
    return <span className="text-xs text-white/50">{helperText}</span>;
  }
  return null;
}

export const GlassInput = forwardRef(function GlassInput(
  { label, error, helperText, type = 'text', className = '', containerClassName = '', id, required = false, ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <div className="relative flex items-center">
        <input
          ref={ref}
          id={id}
          type={effectiveType}
          className={cn(
            fieldBase,
            error ? 'border-rose-300/80 focus:ring-rose-300/60' : '',
            isPassword ? 'pr-10' : '',
            type === 'date' ? '[color-scheme:dark]' : '',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 text-white/60 hover:text-white transition-colors p-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      <FieldMessage error={error} helperText={helperText} />
    </div>
  );
});

export const GlassSelect = forwardRef(function GlassSelect(
  { label, error, helperText, options = [], placeholder, className = '', containerClassName = '', id, required = false, ...props },
  ref
) {
  return (
    <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <div className="relative flex items-center">
        <select
          ref={ref}
          id={id}
          className={cn(
            fieldBase,
            'appearance-none pr-10 [color-scheme:dark]',
            error ? 'border-rose-300/80 focus:ring-rose-300/60' : '',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" className="text-slate-900 bg-white">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-slate-900 bg-white">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-white/60 absolute right-3 pointer-events-none" />
      </div>
      <FieldMessage error={error} helperText={helperText} />
    </div>
  );
});
