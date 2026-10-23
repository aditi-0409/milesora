import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AuthShell, AuthBrand } from '../../components/auth/AuthShell';
import { GlassInput, GlassSelect } from '../../components/auth/GlassFields';
import { Captcha, isCaptchaValid } from '../../components/auth/Captcha';
import { Button } from '../../components/common/Button';
import { AlertCircle, Check, Circle, Upload, User, X } from 'lucide-react';
import {
  PASSWORD_RULES,
  getFailedPasswordRules,
  isValidName,
  isValidEmail,
  isValidPhone,
  getAgeFromDob,
  toDateInputValue,
} from '../../utils/validators';
import { resizeImageToDataUrl } from '../../utils/imageUtils';

const ROLE_OPTIONS = [
  { value: 'EMPLOYEE', label: 'Team Member / Engineer' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager' },
  { value: 'ADMIN', label: 'System Administrator' },
];

const DEPARTMENT_OPTIONS = [
  'Engineering',
  'Platform Engineering',
  'Product Management',
  'Design',
  'Quality Assurance',
  'DevOps & Infrastructure',
  'Data & Analytics',
  'Operations',
  'Human Resources',
  'Finance',
  'Marketing',
  'Sales',
  'Customer Support',
  'Executive Leadership',
].map((d) => ({ value: d, label: d }));

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MIN_AGE = 16;

const INITIAL_FORM = {
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  phone: '',
  dob: '',
  role: 'EMPLOYEE',
  title: '',
  department: '',
  password: '',
  confirmPassword: '',
};

function validateForm(form) {
  const errors = {};

  if (!form.firstName.trim()) errors.firstName = 'First name is required.';
  else if (!isValidName(form.firstName)) errors.firstName = 'Use letters only.';

  if (form.middleName.trim() && !isValidName(form.middleName)) errors.middleName = 'Use letters only.';

  if (!form.lastName.trim()) errors.lastName = 'Last name is required.';
  else if (!isValidName(form.lastName)) errors.lastName = 'Use letters only.';

  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address.';

  if (!form.phone.trim()) errors.phone = 'Phone number is required.';
  else if (!isValidPhone(form.phone)) errors.phone = 'Enter a valid phone number (10-15 digits).';

  if (!form.dob) {
    errors.dob = 'Date of birth is required.';
  } else {
    const age = getAgeFromDob(form.dob);
    if (age === null) errors.dob = 'Enter a valid date.';
    else if (age < 0) errors.dob = 'Date of birth cannot be in the future.';
    else if (age < MIN_AGE) errors.dob = `You must be at least ${MIN_AGE} years old.`;
    else if (age > 100) errors.dob = 'Enter a valid date of birth.';
  }

  if (!form.role) errors.role = 'Select a role.';
  if (!form.title.trim()) errors.title = 'Job title is required.';
  if (!form.department) errors.department = 'Select a department.';

  if (!form.password) errors.password = 'Password is required.';
  else if (getFailedPasswordRules(form.password).length > 0) errors.password = 'Password does not meet all requirements below.';

  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password.';
  else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.';

  return errors;
}

export function RegisterPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [avatar, setAvatar] = useState('');
  const [avatarName, setAvatarName] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaRefresh, setCaptchaRefresh] = useState(0);
  const [captchaError, setCaptchaError] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fileInputRef = useRef(null);
  const errorRef = useRef(null);

  const { register } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const navigate = useNavigate();

  const errors = validateForm(form);
  const fieldError = (key) => (showErrors ? errors[key] : undefined);

  const today = new Date();
  const maxDob = toDateInputValue(today);
  const minDob = toDateInputValue(new Date(today.getFullYear() - 100, today.getMonth(), today.getDate()));

  useEffect(() => {
    if (formError && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [formError]);

  const setField = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const refreshCaptcha = () => {
    setCaptchaInput('');
    setCaptchaRefresh((n) => n + 1);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;

    setAvatarError('');

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setAvatarError('Please choose a JPG, PNG or WebP image.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setAvatarError('The image must be 5 MB or smaller.');
      return;
    }

    try {
      setAvatarBusy(true);
      const dataUrl = await resizeImageToDataUrl(file, 256);
      setAvatar(dataUrl);
      setAvatarName(file.name);
    } catch {
      setAvatarError('We could not read that image. Please try a different file.');
    } finally {
      setAvatarBusy(false);
    }
  };

  const removeAvatar = () => {
    setAvatar('');
    setAvatarName('');
    setAvatarError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setCaptchaError('');
    setShowErrors(true);

    if (Object.keys(errors).length > 0) {
      setFormError('Please correct the highlighted fields.');
      return;
    }

    if (!captchaInput.trim()) {
      setCaptchaError('Please type the captcha characters.');
      setFormError('Please complete the captcha.');
      return;
    }

    if (!isCaptchaValid(captchaInput, captchaCode)) {
      setCaptchaError('The captcha did not match.');
      setFormError('The captcha did not match. Please try the new one.');
      refreshCaptcha();
      return;
    }

    const firstName = form.firstName.trim();
    const middleName = form.middleName.trim();
    const lastName = form.lastName.trim();

    try {
      setLoading(true);
      const res = await register({
        name: [firstName, middleName, lastName].filter(Boolean).join(' '),
        firstName,
        middleName,
        lastName,
        email: form.email.trim(),
        phone: form.phone.trim(),
        dob: form.dob,
        role: form.role,
        title: form.title.trim(),
        department: form.department,
        avatar: avatar || undefined,
        password: form.password,
      });
      toastSuccess(`Welcome to Taskora Pulse, ${res.user.name}!`);
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.');
      toastError(err.message || 'Registration failed');
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const failedIds = new Set(getFailedPasswordRules(form.password).map((r) => r.id));

  return (
    <AuthShell maxWidth="max-w-3xl">
      <AuthBrand title="Create Account" subtitle="Set up your profile and join your organization's workspace" />

      {formError && (
        <div
          ref={errorRef}
          role="alert"
          className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-300/40 flex items-start gap-2.5 text-xs text-rose-100"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Profile picture */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl border border-white/15 bg-white/5">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/30 bg-white/10 flex items-center justify-center flex-shrink-0">
            {avatar ? (
              <img src={avatar} alt="Profile preview" className="w-full h-full object-cover" />
            ) : (
              <User className="w-9 h-9 text-white/50" />
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-medium text-white/80">Profile picture</p>
            <p className="text-[11px] text-white/50 mt-0.5">
              {avatarName ? avatarName : 'JPG, PNG or WebP, up to 5 MB (optional)'}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                disabled={avatarBusy}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-white/15 border border-white/25 hover:bg-white/25 transition-colors disabled:opacity-60"
              >
                <Upload className="w-3.5 h-3.5" />
                {avatarBusy ? 'Processing...' : avatar ? 'Change picture' : 'Upload profile picture'}
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>
            {avatarError && (
              <p className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-rose-300 font-medium mt-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {avatarError}
              </p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
              aria-label="Upload profile picture"
            />
          </div>
        </div>

        {/* Name */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassInput
            id="reg-first-name"
            label="First Name"
            required
            value={form.firstName}
            onChange={setField('firstName')}
            placeholder="e.g. Jordan"
            autoComplete="given-name"
            error={fieldError('firstName')}
          />
          <GlassInput
            id="reg-middle-name"
            label="Middle Name"
            value={form.middleName}
            onChange={setField('middleName')}
            placeholder="Optional"
            autoComplete="additional-name"
            error={fieldError('middleName')}
          />
          <GlassInput
            id="reg-last-name"
            label="Last Name"
            required
            value={form.lastName}
            onChange={setField('lastName')}
            placeholder="e.g. Smith"
            autoComplete="family-name"
            error={fieldError('lastName')}
          />
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassInput
            id="reg-email"
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={setField('email')}
            placeholder="e.g. jordan@company.com"
            autoComplete="email"
            error={fieldError('email')}
          />
          <GlassInput
            id="reg-phone"
            label="Phone Number"
            type="tel"
            required
            value={form.phone}
            onChange={setField('phone')}
            placeholder="e.g. +91 98765 43210"
            autoComplete="tel"
            error={fieldError('phone')}
          />
        </div>

        {/* Personal & role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassInput
            id="reg-dob"
            label="Date of Birth"
            type="date"
            required
            value={form.dob}
            onChange={setField('dob')}
            min={minDob}
            max={maxDob}
            autoComplete="bday"
            error={fieldError('dob')}
          />
          <GlassSelect
            id="reg-role"
            label="Role"
            required
            value={form.role}
            onChange={setField('role')}
            options={ROLE_OPTIONS}
            error={fieldError('role')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassInput
            id="reg-title"
            label="Job Title"
            required
            value={form.title}
            onChange={setField('title')}
            placeholder="e.g. Backend Lead"
            autoComplete="organization-title"
            error={fieldError('title')}
          />
          <GlassSelect
            id="reg-department"
            label="Department"
            required
            value={form.department}
            onChange={setField('department')}
            options={DEPARTMENT_OPTIONS}
            placeholder="Select department"
            error={fieldError('department')}
          />
        </div>

        {/* Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassInput
            id="reg-password"
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={setField('password')}
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={fieldError('password')}
          />
          <GlassInput
            id="reg-confirm-password"
            label="Confirm Password"
            type="password"
            required
            value={form.confirmPassword}
            onChange={setField('confirmPassword')}
            placeholder="Repeat your password"
            autoComplete="new-password"
            error={fieldError('confirmPassword')}
          />
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 p-3 rounded-xl border border-white/15 bg-white/5" aria-label="Password requirements">
          {PASSWORD_RULES.map((rule) => {
            const met = form.password.length > 0 && !failedIds.has(rule.id);
            return (
              <li
                key={rule.id}
                className={`flex items-center gap-2 text-[11px] transition-colors ${met ? 'text-emerald-300' : 'text-white/55'}`}
              >
                {met ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <Circle className="w-3.5 h-3.5 flex-shrink-0" />}
                <span>{rule.label}</span>
              </li>
            );
          })}
        </ul>

        {/* Captcha */}
        <div className="sm:max-w-sm">
          <Captcha
            value={captchaInput}
            onChange={(v) => {
              setCaptchaInput(v);
              if (captchaError) setCaptchaError('');
            }}
            onCodeChange={setCaptchaCode}
            refreshSignal={captchaRefresh}
            error={captchaError}
            inputId="register-captcha"
          />
        </div>

        <Button type="submit" variant="pulse" size="lg" className="w-full mt-2" isLoading={loading}>
          Register
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-white/70">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-white hover:underline">
          Sign in
        </Link>
      </div>
    </AuthShell>
  );
}
