import React from 'react';

// Base skeleton pulse animation
const SkeletonBase = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

// ─── Individual Skeletons ──────────────────────────────────────────────────────
export const SkeletonText = ({ width = 'w-full', height = 'h-3' }) => (
  <SkeletonBase className={`${width} ${height}`} />
);

export const SkeletonAvatar = ({ size = 'w-8 h-8' }) => (
  <SkeletonBase className={`${size} !rounded-full flex-shrink-0`} />
);

export const SkeletonBadge = () => (
  <SkeletonBase className="w-16 h-5 !rounded-full" />
);

// ─── Stat Card Skeleton ────────────────────────────────────────────────────────
export const SkeletonStatCard = () => (
  <div className="card p-4 space-y-3">
    <SkeletonText width="w-24" height="h-2.5" />
    <SkeletonText width="w-16" height="h-8" />
    <SkeletonText width="w-20" height="h-2" />
  </div>
);

// ─── Table Row Skeleton ────────────────────────────────────────────────────────
export const SkeletonTableRow = ({ cols = 6 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="table-td">
        <SkeletonText
          width={i === 0 ? 'w-20' : i === 1 ? 'w-48' : i === cols - 1 ? 'w-16' : 'w-24'}
          height="h-3"
        />
      </td>
    ))}
  </tr>
);

// ─── Full Table Skeleton ───────────────────────────────────────────────────────
export const SkeletonTable = ({ rows = 5, cols = 6 }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i} className="table-th">
              <SkeletonText width="w-16" height="h-2.5" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} cols={cols} />
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Dashboard Skeleton ───────────────────────────────────────────────────────
export const SkeletonDashboard = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <SkeletonText width="w-48" height="h-6" />
      <SkeletonText width="w-64" height="h-3" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
    </div>
    <div className="card">
      <div className="card-header">
        <SkeletonText width="w-32" height="h-4" />
      </div>
      <SkeletonTable rows={5} cols={6} />
    </div>
  </div>
);

// ─── Ticket Detail Skeleton ────────────────────────────────────────────────────
export const SkeletonTicketDetail = () => (
  <div className="flex gap-6">
    <div className="flex-1 space-y-5">
      <div className="flex gap-2">
        <SkeletonBadge />
        <SkeletonBadge />
        <SkeletonBadge />
      </div>
      <div className="space-y-2">
        <SkeletonText width="w-24" height="h-2.5" />
        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonText key={i} width={i === 3 ? 'w-3/4' : 'w-full'} height="h-3" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <SkeletonAvatar />
            <div className="flex-1 space-y-2">
              <SkeletonText width="w-40" height="h-2.5" />
              <SkeletonText width="w-full" height="h-3" />
              <SkeletonText width="w-3/4" height="h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="w-60 space-y-3">
      <div className="card p-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <SkeletonText width="w-20" height="h-2.5" />
            <SkeletonText width="w-24" height="h-2.5" />
          </div>
        ))}
      </div>
      <div className="card p-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <SkeletonText width="w-16" height="h-2" />
            <SkeletonText width="w-full" height="h-8" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Card Skeleton ─────────────────────────────────────────────────────────────
export const SkeletonCard = ({ lines = 3 }) => (
  <div className="card p-5 space-y-3">
    <SkeletonText width="w-32" height="h-4" />
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonText key={i} width={i === lines - 1 ? 'w-3/4' : 'w-full'} height="h-3" />
    ))}
  </div>
);
