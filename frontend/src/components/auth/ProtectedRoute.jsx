import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner size="lg" text="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6">
          Your current role (<strong>{user?.role}</strong>) does not have permission to view this section.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  return children;
}
