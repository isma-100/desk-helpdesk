import React, { useState, useEffect, useCallback } from 'react';
import { ticketAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge, CategoryTag, UserChip, SearchInput, PageLoader, EmptyState, Select } from '../common';
import { TicketDetailModal } from './TicketDetailModal';
import { relativeTime, debounce, CATEGORIES, PRIORITIES } from '../../utils/helpers';
import { TicketIcon, FunnelIcon } from '@heroicons/react/24/outline';

const STATUS_FILTERS = [
  { key: 'all',         label: 'All' },
  { key: 'Open',        label: 'Open' },
  { key: 'In Progress', label: 'In Progress' },
  { key: 'On Hold',     label: 'On Hold' },
  { key: 'Resolved',    label: 'Resolved' },
  { key: 'Closed',      label: 'Closed' },
];

export const TicketsTable = ({ scope = 'all', title, emptyTitle, emptyDesc, refreshKey = 0, onNewTicket }) => {
  const { isStaff } = useAuth();
  const [tickets, setTickets]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [pagination, setPagination]   = useState({ total: 0, page: 1, totalPages: 1 });
  const [selectedId, setSelectedId]   = useState(null);
  const [showFilter, setShowFilter]   = useState(false);

  const [filters, setFilters] = useState({
    status: 'all', priority: 'all', category: 'all', search: '', page: 1
  });

  const setFilter = (key, val) => setFilters(p => ({ ...p, [key]: val, page: 1 }));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce((val) => setFilter('search', val), 350), []);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: 20,
        sort: '-createdAt',
        ...(filters.status   !== 'all' && { status:   filters.status   }),
        ...(filters.priority !== 'all' && { priority: filters.priority }),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.search   && { search: filters.search }),
        ...(scope === 'queue' && { assignedTo: 'me' }),
      };
      const res = await ticketAPI.getAll(params);
      setTickets(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, page: 1, totalPages: 1 });
    } catch { /* handled globally */ }
    finally { setLoading(false); }
  }, [filters, scope, isStaff]);

  useEffect(() => { fetchTickets(); }, [fetchTickets, refreshKey]);

  const handleUpdated = (updated) => {
    setTickets(prev => prev.map(t => t._id === updated._id ? { ...t, ...updated } : t));
  };

  const statusCounts = STATUS_FILTERS.reduce((acc, f) => {
    if (f.key === 'all') acc[f.key] = pagination.total;
    return acc;
  }, {});

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{pagination.total}</span>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            value={filters.search}
            onChange={val => { setFilter('search', val); debouncedSearch(val); }}
            placeholder="Search by ID, title, user…"
            className="w-52"
          />
          <button onClick={() => setShowFilter(v => !v)}
            className={`btn btn-secondary btn-sm gap-1.5 ${showFilter ? 'bg-slate-100' : ''}`}>
            <FunnelIcon className="w-3.5 h-3.5" />Filters
          </button>
        </div>
      </div>

      {/* Status chips */}
      <div className="flex items-center gap-1.5 px-5 py-2.5 border-b border-slate-100 overflow-x-auto">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter('status', f.key)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all border
              ${filters.status === f.key
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      {showFilter && (
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 bg-slate-50 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Priority:</span>
            <Select value={filters.priority} onChange={v => setFilter('priority', v)}
              options={[{ value: 'all', label: 'All' }, ...PRIORITIES.map(p => ({ value: p, label: p }))]}
              className="w-32 !py-1.5 !text-xs" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Category:</span>
            <Select value={filters.category} onChange={v => setFilter('category', v)}
              options={[{ value: 'all', label: 'All' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
              className="w-36 !py-1.5 !text-xs" />
          </div>
          <button onClick={() => setFilters({ status: 'all', priority: 'all', category: 'all', search: '', page: 1 })}
            className="text-xs text-blue-600 hover:underline ml-auto">
            Clear filters
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <PageLoader />
      ) : tickets.length === 0 ? (
        <EmptyState icon={TicketIcon} title={emptyTitle || 'No tickets found'} description={emptyDesc || 'Try adjusting your filters'} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th w-24">ID</th>
                <th className="table-th">Issue</th>
                <th className="table-th w-28">Category</th>
                <th className="table-th w-24">Priority</th>
                <th className="table-th w-28">Status</th>
                {isStaff && <th className="table-th w-28">Submitted by</th>}
                {isStaff && <th className="table-th w-28">Assigned</th>}
                <th className="table-th w-24">Date</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket._id} className="table-row" onClick={() => setSelectedId(ticket._id)}>
                  <td className="table-td">
                    <span className="font-mono text-xs text-blue-600 font-medium">{ticket.ticketId}</span>
                  </td>
                  <td className="table-td max-w-xs">
                    <div className="font-medium text-slate-800 text-sm truncate">{ticket.title}</div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">{ticket.description}</div>
                  </td>
                  <td className="table-td"><CategoryTag category={ticket.category} /></td>
                  <td className="table-td"><PriorityBadge priority={ticket.priority} /></td>
                  <td className="table-td"><StatusBadge status={ticket.status} /></td>
                  {isStaff && <td className="table-td"><UserChip user={ticket.submittedBy} /></td>}
                  {isStaff && (
                    <td className="table-td">
                      {ticket.assignedTo
                        ? <UserChip user={ticket.assignedTo} />
                        : <span className="text-xs text-slate-400">Unassigned</span>}
                    </td>
                  )}
                  <td className="table-td whitespace-nowrap">
                    <span className="text-xs text-slate-400 font-mono">{relativeTime(ticket.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            Showing {((filters.page - 1) * 20) + 1}–{Math.min(filters.page * 20, pagination.total)} of {pagination.total}
          </span>
          <div className="flex gap-1.5">
            <button className="btn btn-secondary btn-sm" disabled={filters.page <= 1}
              onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}>Previous</button>
            <button className="btn btn-secondary btn-sm" disabled={filters.page >= pagination.totalPages}
              onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}>Next</button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <TicketDetailModal
        ticketId={selectedId}
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        onUpdated={handleUpdated}
      />
    </div>
  );
};
