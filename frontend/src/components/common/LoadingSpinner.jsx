import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ text = 'Loading data...', size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 gap-3 text-slate-500 dark:text-slate-400 ${className}`}>
      <Loader2 className={`${sizes[size] || sizes.md} animate-spin text-brand-600 dark:text-brand-400`} />
      {text && <span className="text-sm font-medium animate-pulse">{text}</span>}
    </div>
  );
}
