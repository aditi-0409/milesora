import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, message, type };

    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((msg, dur) => addToast(msg, 'success', dur), [addToast]);
  const error = useCallback((msg, dur) => addToast(msg, 'error', dur || 5000), [addToast]);
  const warning = useCallback((msg, dur) => addToast(msg, 'warning', dur), [addToast]);
  const info = useCallback((msg, dur) => addToast(msg, 'info', dur), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast Render Portal */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        {toasts.map(toast => {
          let bg = 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900';
          let Icon = Info;
          let iconColor = 'text-blue-400 dark:text-blue-600';

          if (toast.type === 'success') {
            bg = 'bg-emerald-900/95 text-white border border-emerald-700/60 dark:bg-emerald-100 dark:text-emerald-950 dark:border-emerald-300';
            Icon = CheckCircle2;
            iconColor = 'text-emerald-400 dark:text-emerald-600';
          } else if (toast.type === 'error') {
            bg = 'bg-rose-900/95 text-white border border-rose-700/60 dark:bg-rose-100 dark:text-rose-950 dark:border-rose-300';
            Icon = AlertCircle;
            iconColor = 'text-rose-400 dark:text-rose-600';
          } else if (toast.type === 'warning') {
            bg = 'bg-amber-900/95 text-white border border-amber-700/60 dark:bg-amber-100 dark:text-amber-950 dark:border-amber-300';
            Icon = AlertTriangle;
            iconColor = 'text-amber-400 dark:text-amber-600';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-xl transition-all duration-300 animate-in slide-in-from-right-4 ${bg}`}
              role="alert"
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 transition-opacity p-0.5"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
