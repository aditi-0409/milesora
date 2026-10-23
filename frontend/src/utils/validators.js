/**
 * Form validation helpers for the authentication pages.
 */

export const PASSWORD_RULES = [
  { id: 'length', label: '8 to 64 characters', test: (p) => p.length >= 8 && p.length <= 64 },
  { id: 'upper', label: 'One uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number (0-9)', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'One special character (! @ # $ % & *)', test: (p) => /[^A-Za-z0-9\s]/.test(p) },
  { id: 'space', label: 'No spaces', test: (p) => !/\s/.test(p) },
];

export function getFailedPasswordRules(password = '') {
  return PASSWORD_RULES.filter((rule) => !rule.test(password));
}

const NAME_REGEX = /^\p{L}[\p{L}\p{M}\s'.-]*$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{10,20}$/;

export function isValidName(value = '') {
  return NAME_REGEX.test(value.trim());
}

export function isValidEmail(value = '') {
  return EMAIL_REGEX.test(value.trim());
}

export function isValidPhone(value = '') {
  const trimmed = value.trim();
  if (!PHONE_REGEX.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

/** Formats a Date as yyyy-mm-dd using the local time zone (for <input type="date">). */
export function toDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Returns age in whole years for a yyyy-mm-dd string, or null when invalid. */
export function getAgeFromDob(dob = '') {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const birth = new Date(year, month - 1, day);
  if (
    Number.isNaN(birth.getTime()) ||
    birth.getFullYear() !== year ||
    birth.getMonth() !== month - 1 ||
    birth.getDate() !== day
  ) {
    return null;
  }
  const now = new Date();
  let age = now.getFullYear() - year;
  const hadBirthday =
    now.getMonth() > month - 1 || (now.getMonth() === month - 1 && now.getDate() >= day);
  if (!hadBirthday) age -= 1;
  return age;
}
