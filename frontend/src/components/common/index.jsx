import React from 'react';
import { statusClass, statusDotClass, priorityClass, initials, avatarColor } from '../../utils/helpers';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// ─── Status Badge ─────────────────────────────────────────────────────────────
export const StatusBadge = ({ status, size = 'sm' }) => (
  <span className={`badge ${statusClass(status)} ${size === 'lg' ? 'px-3 py-1 text-sm' : ''}`}>
    <span className={`badge-dot ${statusDotClass(status)}`} />
    {status}
  </span>
);

// ─── Priority Badge ───────────────────────────────────────────────────────────
export const PriorityBadge = ({ priority }) => (
  <span className={`badge ${priorityClass(priority)}`}>{priority}</span>
);

// ─── Category Tag ─────────────────────────────────────────────────────────────
export const CategoryTag = ({ category }) => (
  <span className="badge bg-slate-100 text-slate-600">{category}</span>
);

// ─── User Avatar ──────────────────────────────────────────────────────────────
export const Avatar = ({ user, size = 'sm' }) => {
  const sizeMap = { xs: 'w-6 h-6 text-[9px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  const cls = sizeMap[size] || sizeMap.sm;
  if (user?.avatar) {
    return <img src={user.avatar} alt={user.name} className={`${cls} rounded-full object-cover`} />;
  }
  return (
    <div className={`${cls} ${avatarColor(user?.name || '')} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials(user?.name || '?')}
    </div>
  );
};

// ─── User Chip ────────────────────────────────────────────────────────────────
export const UserChip = ({ user, showRole = false }) => {
  if (!user) return <span className="text-slate-400 text-xs">Unassigned</span>;
  return (
    <div className="flex items-center gap-2">
      <Avatar user={user} size="xs" />
      <div>
        <div className="text-xs font-medium text-slate-700 leading-none">{user.name?.split(' ')[0]}</div>
        {showRole && <div className="text-[10px] text-slate-400 mt-0.5 capitalize">{user.role}</div>}
      </div>
    </div>
  );
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' };
  return (
    <svg className={`animate-spin text-blue-600 ${sizes[size]} ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
};

export const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size="xl" />
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
    {Icon && <Icon className="w-12 h-12 text-slate-300 mb-3" />}
    <h3 className="text-sm font-semibold text-slate-600 mb-1">{title}</h3>
    {description && <p className="text-xs text-slate-400 mb-4 max-w-sm">{description}</p>}
    {action}
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, subtitle, size = 'md', children, footer }) => {
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-start justify-center p-4 pt-8">
        <div className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl animate-slide-up`}>
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-slate-800">{title}</h2>
              {subtitle && <p className="text-xs text-slate-400 mt-0.5 font-mono">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="btn-icon mt-0.5 flex-shrink-0">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          {/* Body */}
          <div className="px-6 py-5">{children}</div>
          {/* Footer */}
          {footer && <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">{footer}</div>}
        </div>
      </div>
    </div>
  );
};

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading = false }) => {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<>
        <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={loading}>
          {loading ? <Spinner size="sm" /> : confirmLabel}
        </button>
      </>}>
      <div className="flex gap-3">
        <ExclamationTriangleIcon className={`w-10 h-10 flex-shrink-0 ${danger ? 'text-red-400' : 'text-amber-400'}`} />
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
};

// ─── Form Field ───────────────────────────────────────────────────────────────
export const FormField = ({ label, error, required, children, hint }) => (
  <div>
    {label && (
      <label className="label">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    {children}
    {hint  && !error && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    {error && <p className="error-text">{error}</p>}
  </div>
);

// ─── Select ───────────────────────────────────────────────────────────────────
export const Select = ({ value, onChange, options, placeholder, className = '', disabled = false }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    disabled={disabled}
    className={`input appearance-none cursor-pointer ${className}`}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(opt => (
      typeof opt === 'string'
        ? <option key={opt} value={opt}>{opt}</option>
        : <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, sub, icon: Icon, color = 'text-slate-800', bg = 'bg-white', onClick }) => (
  <div className={`card p-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${bg}`} onClick={onClick}>
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</div>
        <div className={`text-3xl font-bold font-mono leading-none ${color}`}>{value ?? '—'}</div>
        {sub && <div className="text-xs text-slate-400 mt-1.5">{sub}</div>}
      </div>
      {Icon && <div className="p-2 rounded-lg bg-slate-50"><Icon className="w-5 h-5 text-slate-400" /></div>}
    </div>
  </div>
);

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
export const TabBar = ({ tabs, active, onChange }) => (
  <div className="flex border-b border-slate-200 gap-1">
    {tabs.map(tab => (
      <button
        key={tab.key}
        onClick={() => onChange(tab.key)}
        className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px
          ${active === tab.key
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
      >
        {tab.label}
        {tab.count !== undefined && (
          <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold
            ${active === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

// ─── Search Input ─────────────────────────────────────────────────────────────
export const SearchInput = ({ value, onChange, placeholder = 'Search…', className = '' }) => (
  <div className={`relative ${className}`}>
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`input pl-8 ${className}`}
    />
  </div>
);

// ─── File icon ────────────────────────────────────────────────────────────────
export const FileIcon = ({ mimetype }) => {
  const isImage = mimetype?.startsWith('image/');
  const isPdf   = mimetype === 'application/pdf';
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
      ${isImage ? 'bg-blue-100 text-blue-600' : isPdf ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
      {isImage ? '🖼' : isPdf ? 'PDF' : '📄'}
    </div>
  );
};
