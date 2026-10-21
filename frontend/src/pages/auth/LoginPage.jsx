import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDemoMode } from '../../context/DemoModeContext';
import { AuthShell, AuthBrand } from '../../components/auth/AuthShell';
import { GlassInput } from '../../components/auth/GlassFields';
import { Captcha, isCaptchaValid } from '../../components/auth/Captcha';
import { Button } from '../../components/common/Button';
import { Sparkles, AlertCircle } from 'lucide-react';

const QUICK_PROFILES = [
  { username: 'sarah.pm', name: 'Sarah C.', role: 'Project Mgr' },
  { username: 'elena.admin', name: 'Elena R.', role: 'Admin / CTO' },
  { username: 'alex.dev', name: 'Alex R.', role: 'Engineer' },
];

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaRefresh, setCaptchaRefresh] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { login } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const { isDemo } = useDemoMode();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const refreshCaptcha = () => {
    setCaptchaInput('');
    setCaptchaRefresh((n) => n + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!username.trim() || !password) {
      setFormError('Please enter both your username and password.');
      return;
    }

    if (!captchaInput.trim()) {
      setFormError('Please type the captcha characters shown in the image.');
      return;
    }

    if (!isCaptchaValid(captchaInput, captchaCode)) {
      setFormError('The captcha did not match. Please try the new one.');
      refreshCaptcha();
      return;
    }

    try {
      setLoading(true);
      const res = await login(username.trim(), password);
      toastSuccess(`Welcome back, ${res.user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err.message || 'Authentication failed. Please verify your credentials.');
      toastError(err.message || 'Authentication failed');
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickUsername) => {
    setUsername(quickUsername);
    setPassword('Password123!');
  };

  return (
    <AuthShell maxWidth="max-w-md">
      <AuthBrand title="Sign In" subtitle="Plan Smarter. Collaborate Better. Deliver on Time." />

      {formError && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-300/40 flex items-start gap-2.5 text-xs text-rose-100"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <GlassInput
          id="login-username"
          label="Username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username or work email"
          autoComplete="username"
        />

        <div>
          <GlassInput
            id="login-password"
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <div className="flex justify-end mt-1.5">
            <button
              type="button"
              onClick={() =>
                alert(
                  'Password recovery flow will connect to your Java Spring Boot SMTP mail service. Contact your system administrator for password resets in this build.'
                )
              }
              className="text-[11px] text-white/70 hover:text-white hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <Captcha
          value={captchaInput}
          onChange={setCaptchaInput}
          onCodeChange={setCaptchaCode}
          refreshSignal={captchaRefresh}
          inputId="login-captcha"
        />

        <Button type="submit" variant="pulse" size="lg" className="w-full mt-1" isLoading={loading}>
          Login
        </Button>
      </form>

      {isDemo && (
        <div className="mt-6 pt-5 border-t border-white/15">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/55">
              Quick Evaluation Profiles
            </span>
            <span className="text-[10px] text-cyan-200 flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3" /> Demo Mode
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_PROFILES.map((p) => (
              <button
                key={p.username}
                type="button"
                onClick={() => handleQuickLogin(p.username)}
                className="p-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/40 text-left transition-colors"
              >
                <p className="text-[11px] font-bold text-white leading-tight">{p.name}</p>
                <p className="text-[10px] text-cyan-200 font-medium">{p.role}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 text-center text-xs text-white/70">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-white hover:underline">
          Sign up
        </Link>
      </div>
    </AuthShell>
  );
}
