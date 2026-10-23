import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useDemoMode } from '../../context/DemoModeContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { ROLE_LABELS } from '../../utils/formatters';
import { 
  Settings, 
  User, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Database, 
  Server, 
  RotateCcw, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Link2
} from 'lucide-react';

export function SettingsPage() {
  const { user, updateUserProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isDemo, toggleDemoMode, resetMockData } = useDemoMode();
  const { success, error } = useToast();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [title, setTitle] = useState(user?.title || '');
  const [department, setDepartment] = useState(user?.department || 'Engineering');
  const [savingProfile, setSavingProfile] = useState(false);

  // Backend Diagnostic Test
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState(null);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const updated = await userService.updateProfile(user.id, {
        name,
        email,
        title,
        department
      });
      updateUserProfile(updated);
      success('Profile details saved successfully.');
    } catch (err) {
      error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleTestBackendConnection = async () => {
    setTestingConnection(true);
    setConnectionResult(null);
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${apiUrl}/health`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      }).catch(async () => {
        // Try root fallback
        return fetch(apiUrl, { signal: controller.signal });
      });
      clearTimeout(timeoutId);

      if (res && res.ok) {
        setConnectionResult({
          status: 'SUCCESS',
          message: `Successfully reached Spring Boot REST API at ${apiUrl} (${res.status} ${res.statusText})`
        });
        success('Live backend connection verified!');
      } else {
        setConnectionResult({
          status: 'WARNING',
          message: `Endpoint reached at ${apiUrl} but returned status ${res.status}. Verify your Spring Security permitAll rules.`
        });
      }
    } catch (err) {
      setConnectionResult({
        status: 'OFFLINE',
        message: `Backend is unreachable at ${apiUrl}. When you run your Java Spring Boot service (e.g., ./mvnw spring-boot:run on port 8080), Taskora Pulse will seamlessly connect.`
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          <span>System Settings &amp; Profile</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your account credentials, theme preferences, and Spring Boot backend integration.
        </p>
      </div>

      {/* Profile Details Card */}
      <Card title="User Profile Information" subtitle="Your credentials and organization title">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/20"
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{user?.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              <Badge variant="primary" size="sm" className="mt-1">
                {ROLE_LABELS[user?.role] || user?.role}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Role Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Lead Technical Architect"
            />

            <Input
              label="Department"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              placeholder="e.g. Platform Engineering"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" isLoading={savingProfile}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Theme & Display Preferences */}
      <Card title="Visual Appearance & Theme" subtitle="Toggle between light and dark SaaS modes">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-brand-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {theme === 'dark' ? 'Dark Theme Active' : 'Light Theme Active (Default)'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Optimized for high contrast and executive review
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={toggleTheme}>
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme
          </Button>
        </div>
      </Card>

      {/* Spring Boot Backend & Demo Mode Diagnostics */}
      <Card
        title="Java Spring Boot Backend Compatibility"
        subtitle="Manage live REST API connection and prototype simulation settings"
      >
        <div className="space-y-6">
          {/* Environment configuration */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Configured Base URL:</span>
              <code className="font-mono text-brand-600 dark:text-brand-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}
              </code>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Mode:</span>
              <Badge variant={isDemo ? 'primary' : 'success'} size="sm">
                {isDemo ? 'Demo Mode (Interactive Simulation)' : 'Live Spring Boot API Mode'}
              </Badge>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                leftIcon={Server}
                isLoading={testingConnection}
                onClick={handleTestBackendConnection}
              >
                Test Connection to Spring Boot
              </Button>

              <Button
                variant={isDemo ? 'secondary' : 'primary'}
                size="sm"
                onClick={toggleDemoMode}
              >
                Switch to {isDemo ? 'Strict Live API Mode' : 'Demo Mode'}
              </Button>

              {isDemo && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={RotateCcw}
                  onClick={resetMockData}
                  className="text-amber-600 hover:text-amber-700"
                >
                  Reset Mock Database
                </Button>
              )}
            </div>

            {/* Diagnostic result feedback */}
            {connectionResult && (
              <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                connectionResult.status === 'SUCCESS'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}>
                {connectionResult.status === 'SUCCESS' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                <span>{connectionResult.message}</span>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500 leading-relaxed">
            <p>
              Consult <code className="text-brand-600 font-bold">API_CONTRACT.md</code> in the repository root for the full REST controller specifications, DTO schemas, and Liquibase database definitions.
            </p>
          </div>
        </div>
      </Card>

      {/* Account Session & Sign Out */}
      <Card title="Session Management" subtitle="Active token and session controls">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Active Session
            </h4>
            <p className="text-[11px] text-slate-400">
              Signed in as {user?.email}
            </p>
          </div>

          <Button variant="danger" size="sm" leftIcon={LogOut} onClick={logout}>
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
