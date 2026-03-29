import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ticketAPI } from '../../api';
import { StatCard, PageLoader, StatusBadge, PriorityBadge, UserChip } from '../common';
import { TicketDetailModal } from '../tickets/TicketDetailModal';
import { relativeTime, truncate } from '../../utils/helpers';
import {
  TicketIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon,
  QueueListIcon, ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const CHART_COLORS = {
  'Open': '#f59e0b', 'In Progress': '#3b82f6', 'On Hold': '#8b5cf6',
  'Resolved': '#10b981', 'Closed': '#94a3b8',
  'Urgent': '#ef4444', 'High': '#f97316', 'Medium': '#f59e0b', 'Low': '#10b981',
};

export const Dashboard = ({ onNewTicket, refreshKey = 0 }) => {
  const { user, isStaff, isEmployee } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (isEmployee) { setLoading(false); return; }
    ticketAPI.getStats()
      .then(res => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isEmployee]);

  if (isEmployee) return <EmployeeDashboard user={user} onNewTicket={onNewTicket} refreshKey={refreshKey} />;
  if (loading)    return <PageLoader />;

  const statusData = Object.entries(stats?.byStatus || {}).map(([name, value]) => ({ name, value, fill: CHART_COLORS[name] || '#94a3b8' }));
  const priorityData = Object.entries(stats?.byPriority || {}).map(([name, value]) => ({ name, value }));
  const categoryData = Object.entries(stats?.byCategory || {}).map(([name, value]) => ({ name, value }));
  const urgent = (stats?.byPriority?.Urgent || 0) + (stats?.byPriority?.High || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Support Overview</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          {new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tickets"    value={stats?.total}           sub="All time"            icon={TicketIcon}              color="text-blue-600" />
        <StatCard label="Open"             value={stats?.byStatus?.Open || 0} sub="Need assignment"  icon={ClockIcon}               color="text-amber-500" />
        <StatCard label="Resolved"         value={stats?.resolved}        sub={`${stats?.resolutionRate}% rate`} icon={CheckCircleIcon} color="text-green-500" />
        <StatCard label="Urgent / High"    value={urgent}                 sub="Escalate now"        icon={ExclamationTriangleIcon} color={urgent > 0 ? 'text-red-500' : 'text-slate-400'} />
      </div>

      {/* Urgent alert */}
      {stats?.byPriority?.Urgent > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">
            <strong>{stats.byPriority.Urgent}</strong> urgent ticket{stats.byPriority.Urgent > 1 ? 's' : ''} require immediate attention.
          </span>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status Pie */}
        <div className="card p-5">
          <div className="card-title mb-4">By Status</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={2}>
                {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Bar */}
        <div className="card p-5">
          <div className="card-title mb-4">By Priority</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={priorityData} barSize={28}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {priorityData.map((entry, i) => <Cell key={i} fill={CHART_COLORS[entry.name] || '#3b82f6'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Bar */}
        <div className="card p-5">
          <div className="card-title mb-4">By Category</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={categoryData} layout="vertical" barSize={14}>
              <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent tickets */}
      {stats?.recentTickets?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Tickets</span>
            <QueueListIcon className="w-4 h-4 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-50">
            {stats.recentTickets.map(t => (
              <div key={t._id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedId(t._id)}>
                <span className="font-mono text-xs text-blue-600 w-20 flex-shrink-0">{t.ticketId}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700 truncate">{t.title}</div>
                  <div className="text-xs text-slate-400">{t.submittedBy?.name}</div>
                </div>
                <StatusBadge status={t.status} />
                <PriorityBadge priority={t.priority} />
                <span className="text-xs text-slate-400 font-mono">{relativeTime(t.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <TicketDetailModal ticketId={selectedId} open={!!selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
};

const EmployeeDashboard = ({ user, onNewTicket, refreshKey = 0 }) => {
  const [myStats, setMyStats] = useState({ open: 0, resolved: 0, total: 0 });
  const [recentTickets, setRecentTickets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketAPI.getAll({ limit: 5, sort: '-createdAt' })
      .then(res => {
        const tickets = res.data.data || [];
        setRecentTickets(tickets);
        setMyStats({
          total:    res.data.pagination?.total || 0,
          open:     tickets.filter(t => !['Resolved','Closed'].includes(t.status)).length,
          resolved: tickets.filter(t => ['Resolved','Closed'].includes(t.status)).length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Hello, {firstName} 👋</h2>
          <p className="text-sm text-slate-400 mt-1">Submit a ticket if you have an IT issue and we will sort it out fast.</p>
        </div>
        <button className="btn btn-primary" onClick={onNewTicket}>+ New Ticket</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Open Issues"     value={myStats.open}     sub="Awaiting resolution" icon={ClockIcon}        color="text-amber-500" />
        <StatCard label="Resolved"        value={myStats.resolved} sub="Fixed"               icon={CheckCircleIcon} color="text-green-500" />
        <StatCard label="Total Submitted" value={myStats.total}    sub="All time"             icon={TicketIcon}      color="text-blue-600" />
      </div>

      {loading ? <PageLoader /> : recentTickets.length > 0 ? (
        <div className="card">
          <div className="card-header"><span className="card-title">My Recent Tickets</span></div>
          <div className="divide-y divide-slate-50">
            {recentTickets.map(t => (
              <div key={t._id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedId(t._id)}>
                <span className="font-mono text-xs text-blue-600 w-20">{t.ticketId}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700 truncate">{t.title}</div>
                  <div className="text-xs text-slate-400">{relativeTime(t.createdAt)}</div>
                </div>
                <StatusBadge status={t.status} />
                <PriorityBadge priority={t.priority} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="flex flex-col items-center py-14 text-center">
            <CheckCircleIcon className="w-12 h-12 text-green-300 mb-3" />
            <h3 className="text-sm font-semibold text-slate-600">No open issues!</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Everything is running smoothly.</p>
            <button className="btn btn-primary btn-sm" onClick={onNewTicket}>Report an issue</button>
          </div>
        </div>
      )}

      <TicketDetailModal ticketId={selectedId} open={!!selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
};
