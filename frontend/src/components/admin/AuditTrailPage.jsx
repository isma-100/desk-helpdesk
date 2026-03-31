import React, { useState, useEffect, useCallback } from 'react';
import { auditAPI } from 'api';
import { Avatar, PageLoader, EmptyState, SearchInput } from 'components/common';
import { formatDateTime, relativeTime } from 'utils/helpers';
import { ShieldCheckIcon, FunnelIcon } from '@heroicons/react/24/outline';

const ACTION_LABELS = {
  ticket_created:    { label: 'Ticket Created',    color: 'bg-green-50 text-green-700' },
  ticket_updated:    { label: 'Ticket Updated',    color: 'bg-blue-50 text-blue-700' },
  ticket_assigned:   { label: 'Assigned',          color: 'bg-indigo-50 text-indigo-700' },
  ticket_unassigned: { label: 'Unassigned',        color: 'bg-slate-100 text-slate-600' },
  status_changed:    { label: 'Status Changed',    color: 'bg-amber-50 text-amber-700' },
  priority_changed:  { label: 'Priority Changed',  color: 'bg-orange-50 text-orange-700' },
  comment_added:     { label: 'Comment Added',     color: 'bg-purple-50 text-purple-700' },
  comment_deleted:   { label: 'Comment Deleted',   color: 'bg-red-50 text-red-700' },
  file_uploaded:     { label: 'File Uploaded',     color: 'bg-cyan-50 text-cyan-700' },
  user_created:      { label: 'User Created',      color: 'bg-green-50 text-green-700' },
  user_updated:      { label: 'User Updated',      color: 'bg-blue-50 text-blue-700' },
  user_deactivated:  { label: 'User Deactivated',  color: 'bg-red-50 text-red-700' },
  resolution_added:  { label: 'Resolution Saved',  color: 'bg-green-50 text-green-700' },
  ticket_closed:     { label: 'Ticket Closed',     color: 'bg-slate-100 text-slate-600' },
};

const ACTION_TYPES = Object.keys(ACTION_LABELS);

export const AuditTrailPage = () => {
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [filters, setFilters]   = useState({ action: 'all', page: 1 });
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 50 };
      if (filters.action !== 'all') params.action = filters.action;
      const res = await auditAPI.getAll(params);
      setLogs(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { /* handled globally */ }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const setFilter = (k, v) => setFilters(p => ({ ...p, [k]: v, page: 1 }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Audit Trail</h2>
          <p className="text-sm text-slate-400 mt-0.5">Complete record of all system actions</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-100 px-3 py-1.5 rounded-lg">
          <ShieldCheckIcon className="w-3.5 h-3.5" />
          {pagination.total || 0} total events
        </div>
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100">
          <button onClick={() => setShowFilters(v => !v)}
            className={`btn btn-secondary btn-sm gap-1.5 ${showFilters ? 'bg-slate-100' : ''}`}>
            <FunnelIcon className="w-3.5 h-3.5" /> Filter by Action
          </button>
          <span className="text-xs text-slate-400 ml-auto">
            Showing {logs.length} of {pagination.total || 0} events
          </span>
        </div>

        {/* Filter chips */}
        {showFilters && (
          <div className="flex flex-wrap gap-1.5 px-5 py-3 border-b border-slate-100 bg-slate-50">
            <button onClick={() => setFilter('action', 'all')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all
                ${filters.action === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}>
              All
            </button>
            {ACTION_TYPES.map(a => (
              <button key={a} onClick={() => setFilter('action', a)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all
                  ${filters.action === a ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}>
                {ACTION_LABELS[a]?.label || a}
              </button>
            ))}
          </div>
        )}

        {/* Table */}
        {loading ? <PageLoader /> : logs.length === 0 ? (
          <EmptyState icon={ShieldCheckIcon} title="No audit events found" description="Try a different filter" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th w-36">Time</th>
                  <th className="table-th w-40">Actor</th>
                  <th className="table-th w-28">Action</th>
                  <th className="table-th w-28">Ticket</th>
                  <th className="table-th">Description</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const meta = ACTION_LABELS[log.action] || { label: log.action, color: 'bg-slate-100 text-slate-600' };
                  return (
                    <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                      <td className="table-td">
                        <div className="text-xs font-mono text-slate-500">{formatDateTime(log.createdAt)}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{relativeTime(log.createdAt)}</div>
                      </td>
                      <td className="table-td">
                        {log.performedBy ? (
                          <div className="flex items-center gap-2">
                            <Avatar user={log.performedBy} size="xs" />
                            <div>
                              <div className="text-xs font-medium text-slate-700">{log.performedBy.name}</div>
                              <div className="text-[10px] text-slate-400 capitalize">{log.performedBy.role}</div>
                            </div>
                          </div>
                        ) : <span className="text-xs text-slate-400">System</span>}
                      </td>
                      <td className="table-td">
                        <span className={`badge text-[10px] ${meta.color}`}>{meta.label}</span>
                      </td>
                      <td className="table-td">
                        {log.ticket ? (
                          <span className="font-mono text-xs text-blue-600">{log.ticket.ticketId}</span>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      <td className="table-td">
                        <span className="text-xs text-slate-600">{log.description}</span>
                        {log.changes?.before && (
                          <div className="mt-1 flex gap-2 items-center">
                            <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded font-mono">
                              {JSON.stringify(log.changes.before).slice(0, 40)}
                            </span>
                            <span className="text-slate-300">→</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded font-mono">
                              {JSON.stringify(log.changes.after).slice(0, 40)}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">Page {filters.page} of {pagination.totalPages}</span>
            <div className="flex gap-1.5">
              <button className="btn btn-secondary btn-sm" disabled={filters.page <= 1}
                onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}>← Previous</button>
              <button className="btn btn-secondary btn-sm" disabled={filters.page >= pagination.totalPages}
                onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
