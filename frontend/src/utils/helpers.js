import { formatDistanceToNow, format } from 'date-fns';

// Date formatting
export const relativeTime = (date) => {
  if (!date) return '';
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); }
  catch { return ''; }
};

export const formatDate = (date, fmt = 'dd MMM yyyy') => {
  if (!date) return '';
  try { return format(new Date(date), fmt); }
  catch { return ''; }
};

export const formatDateTime = (date) => formatDate(date, 'dd MMM yyyy, HH:mm');

// File size
export const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// Avatar initials
export const initials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

// Avatar colour from name
const AVATAR_COLOURS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500',
  'bg-red-500', 'bg-pink-500', 'bg-cyan-500', 'bg-orange-500',
];
export const avatarColor = (name = '') => {
  const idx = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLOURS[idx % AVATAR_COLOURS.length];
};

// Status → CSS class mapping
export const statusClass = (status) => {
  const map = {
    'Open':        'status-Open',
    'In Progress': 'status-InProgress',
    'On Hold':     'status-OnHold',
    'Resolved':    'status-Resolved',
    'Closed':      'status-Closed',
  };
  return map[status] || 'status-Closed';
};

export const statusDotClass = (status) => {
  const map = {
    'Open':        'status-dot-Open',
    'In Progress': 'status-dot-InProgress',
    'On Hold':     'status-dot-OnHold',
    'Resolved':    'status-dot-Resolved',
    'Closed':      'status-dot-Closed',
  };
  return map[status] || 'bg-slate-400';
};

export const priorityClass = (priority) => {
  const map = {
    'Low':    'priority-Low',
    'Medium': 'priority-Medium',
    'High':   'priority-High',
    'Urgent': 'priority-Urgent',
  };
  return map[priority] || 'priority-Medium';
};

// Truncate
export const truncate = (str, n = 80) =>
  str && str.length > n ? str.slice(0, n) + '...' : str;

// Debounce
export const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

// Category icons (emoji)
export const categoryIcon = (cat) => {
  const map = {
    'Hardware':       '🖥️',
    'Software':       '💻',
    'Network':        '🌐',
    'Account/Access': '🔑',
    'Other':          '📋',
  };
  return map[cat] || '📋';
};

export const STATUSES    = ['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed'];
export const PRIORITIES  = ['Low', 'Medium', 'High', 'Urgent'];
export const CATEGORIES  = ['Hardware', 'Software', 'Network', 'Account/Access', 'Other'];
export const ROLES       = ['employee', 'technician', 'admin'];
