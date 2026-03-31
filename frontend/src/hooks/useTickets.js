import { useState, useEffect, useCallback, useRef } from 'react';
import { ticketAPI } from 'api';
import { useAuth } from 'context/AuthContext';

/**
 * useTickets — fetches, filters and paginates tickets
 * @param {object} options
 * @param {'all'|'my'|'queue'} options.scope
 * @param {number}  options.limit
 * @param {boolean} options.autoFetch
 */
export const useTickets = ({
  scope = 'all',
  limit = 20,
  autoFetch = true,
} = {}) => {
  const { isStaff } = useAuth();

  const [tickets, setTickets]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const [filters, setFiltersState] = useState({
    status:   'all',
    priority: 'all',
    category: 'all',
    search:   '',
    page:     1,
    sort:     '-createdAt',
  });

  // Track whether a fetch is in progress to avoid race conditions
  const fetchingRef = useRef(false);

  const buildParams = useCallback((overrides = {}) => {
    const f = { ...filters, ...overrides };
    const params = {
      page:  f.page,
      limit,
      sort:  f.sort,
    };
    if (f.status   !== 'all') params.status   = f.status;
    if (f.priority !== 'all') params.priority = f.priority;
    if (f.category !== 'all') params.category = f.category;
    if (f.search)             params.search   = f.search;
    // Scope-based filtering
    if (scope === 'queue' && isStaff) params.assignedTo = 'me';
    return params;
  }, [filters, limit, scope, isStaff]);

  const fetchTickets = useCallback(async (overrides = {}) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const params = buildParams(overrides);
      const res = await ticketAPI.getAll(params);
      setTickets(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, page: 1, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [buildParams]);

  useEffect(() => {
    if (autoFetch) fetchTickets();
  }, [fetchTickets, autoFetch]);

  // Filter setters — each resets to page 1
  const setFilter = useCallback((key, value) => {
    setFiltersState(prev => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setFiltersState(prev => ({ ...prev, page }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({ status: 'all', priority: 'all', category: 'all', search: '', page: 1, sort: '-createdAt' });
  }, []);

  // Optimistic update after editing a ticket inline
  const updateTicketInList = useCallback((updatedTicket) => {
    setTickets(prev =>
      prev.map(t => t._id === updatedTicket._id ? { ...t, ...updatedTicket } : t)
    );
  }, []);

  // Remove ticket from list (e.g. after delete)
  const removeTicket = useCallback((ticketId) => {
    setTickets(prev => prev.filter(t => t._id !== ticketId));
    setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
  }, []);

  // Add a newly created ticket to top of list
  const prependTicket = useCallback((ticket) => {
    setTickets(prev => [ticket, ...prev]);
    setPagination(prev => ({ ...prev, total: prev.total + 1 }));
  }, []);

  return {
    tickets,
    loading,
    error,
    pagination,
    filters,
    setFilter,
    setPage,
    resetFilters,
    refetch:           fetchTickets,
    updateTicketInList,
    removeTicket,
    prependTicket,
  };
};

/**
 * useTicket — fetches a single ticket by ID
 */
export const useTicket = (ticketId) => {
  const [ticket, setTicket]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await ticketAPI.getOne(ticketId);
      setTicket(res.data.data);
    } catch (err) {
      setError(err.message || 'Ticket not found');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => { fetchTicket(); }, [fetchTicket]);

  const updateTicket = useCallback((updates) => {
    setTicket(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  return { ticket, loading, error, refetch: fetchTicket, updateTicket };
};

/**
 * useTicketStats — fetches dashboard stats
 */
export const useTicketStats = () => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ticketAPI.getStats();
      setStats(res.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};
