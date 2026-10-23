/**
 * Mode Configuration
 * Explicitly distinguishes Demo Mode from Live Backend Mode.
 */

export function isDemoMode() {
  const saved = localStorage.getItem('taskora_demo_mode');
  if (saved !== null) {
    return saved === 'true';
  }
  // Default to VITE_DEMO_MODE env variable, or true if not explicitly false
  return import.meta.env.VITE_DEMO_MODE !== 'false';
}

export function setDemoMode(enabled) {
  localStorage.setItem('taskora_demo_mode', enabled ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('taskora:mode-change', { detail: { demoMode: enabled } }));
}
