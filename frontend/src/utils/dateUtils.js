/**
 * Safe date parsing and formatting utilities
 */

export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function getDaysRemaining(dueDateString) {
  if (!dueDateString) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDateString);
  due.setHours(0, 0, 0, 0);
  
  if (isNaN(due.getTime())) return null;
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getDeadlineStatus(dueDateString, status) {
  if (status === 'COMPLETED') return { label: 'Completed', state: 'completed' };
  const days = getDaysRemaining(dueDateString);
  if (days === null) return { label: 'No Deadline', state: 'none' };
  
  if (days < 0) {
    return { label: `${Math.abs(days)}d Overdue`, state: 'overdue' };
  } else if (days === 0) {
    return { label: 'Due Today', state: 'due-today' };
  } else if (days <= 3) {
    return { label: `Due in ${days}d`, state: 'due-soon' };
  }
  return { label: `Due in ${days}d`, state: 'normal' };
}

export function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffSeconds = Math.floor((now - past) / 1000);

  if (diffSeconds < 60) return 'just now';
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateString);
}
