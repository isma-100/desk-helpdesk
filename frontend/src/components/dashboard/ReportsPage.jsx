import React, { useState, useEffect } from 'react';
import { ticketAPI, userAPI } from '../../api';
import { StatCard, PageLoader, Avatar } from '../common';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  ChartBarIcon, TicketIcon, ClockIcon, CheckCircleIcon,
  UserGroupIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const PIE_COLORS  = { 'Open': '#f59e0b', 'In Progress': '#3b82f6', 'On Hold': '#8b5cf6', 'Resolved': '#10b981', 'Closed': '#94a3b8' };
const PRI_COLORS  = { 'Urgent': '#ef4444', 'High': '#f97316', 'Medium': '#f59e0b', 'Low': '#10b981' };
const CAT_COLORS  = ['#3b82f6', '#8b5cf6', '#22d3ee', '#f97316', '#94a3b8'];

const SectionTitle = ({ title, sub }) => (
  <div className="mb-4">
    <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
    {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

export const ReportsPage = () => {
  const [stats, setStats]         = useState(null);
  const [technicians, setTechs]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      ticketAPI.getStats(),
      userAPI.getTechnicians(),
    ]).then(([s, t]) => {
      setStats(s.data.data);
      setTechs(t.data.data || []);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!stats)  return <div className="text-center py-20 text-slate-400">Failed to load reports</div>;

  const { total, resolved, resolutionRate, byStatus = {}, byPriority = {}, byCategory = {} } = stats;
  const open = byStatus['Open'] || 0;
  const inProg = byStatus['In Progress'] || 0;
  const urgent = byPriority['Urgent'] || 0;

  // Prepare chart data
  const statusPieData  = Object.entries(byStatus).map(([name, value]) => ({ name, value }));
  const priorityData   = Object.entries(byPriority).map(([name, value]) => ({ name, value }));
  const categoryData   = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

  // Simulated trend data (last 7 days) — in production this comes from the API
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      day:      d.toLocaleDateString('en-ZA', { weekday: 'short' }),
      Opened:   Math.floor(Math.random() * 6) + 1,
      Resolved: Math.floor(Math.random() * 5) + 1,
    };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Reports & Analytics</h2>
        <p className="text-sm text-slate-400 mt-0.5">System-wide performance overview</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Tickets"   value={total}            icon={TicketIcon}              color="text-blue-600" />
        <StatCard label="Open"            value={open}             icon={ClockIcon}               color="text-amber-500" sub="Awaiting work" />
        <StatCard label="In Progress"     value={inProg}           icon={ChartBarIcon}            color="text-blue-500" />
        <StatCard label="Resolved"        value={resolved}         icon={CheckCircleIcon}         color="text-green-500" />
        <StatCard label="Urgent Open"     value={urgent}           icon={ExclamationTriangleIcon} color={urgent > 0 ? 'text-red-500' : 'text-slate-400'} />
      </div>

      {/* Resolution Rate banner */}
      <div className={`rounded-xl p-4 border flex items-center gap-4
        ${resolutionRate >= 70 ? 'bg-green-50 border-green-200' : resolutionRate >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
        <div className="text-3xl font-bold font-mono"
          style={{ color: resolutionRate >= 70 ? '#059669' : resolutionRate >= 40 ? '#d97706' : '#dc2626' }}>
          {resolutionRate}%
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-700">Overall Resolution Rate</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {resolved} of {total} tickets resolved
            {resolutionRate >= 70 ? ' — Great performance! 🎉' : resolutionRate >= 40 ? ' — Room for improvement' : ' — Needs attention ⚠️'}
          </div>
        </div>
        <div className="ml-auto w-48 bg-white rounded-full h-2 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{
            width: `${resolutionRate}%`,
            background: resolutionRate >= 70 ? '#10b981' : resolutionRate >= 40 ? '#f59e0b' : '#ef4444'
          }} />
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Status Donut */}
        <div className="card p-5">
          <SectionTitle title="Tickets by Status" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusPieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85}
                dataKey="value" paddingAngle={3} label={({ name, value }) => `${value}`} labelLine={false}>
                {statusPieData.map((e, i) => <Cell key={i} fill={PIE_COLORS[e.name] || '#94a3b8'} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Bar */}
        <div className="card p-5">
          <SectionTitle title="Tickets by Priority" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                {priorityData.map((e, i) => <Cell key={i} fill={PRI_COLORS[e.name] || '#3b82f6'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Horizontal Bar */}
        <div className="card p-5">
          <SectionTitle title="Tickets by Category" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={95} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 5, 5, 0]}>
                {categoryData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Line Chart */}
      <div className="card p-5">
        <SectionTitle title="7-Day Ticket Trend" sub="Tickets opened vs resolved per day" />
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="openGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            <Area type="monotone" dataKey="Opened"   stroke="#f59e0b" strokeWidth={2} fill="url(#openGrad)" dot={{ r: 3 }} />
            <Area type="monotone" dataKey="Resolved" stroke="#10b981" strokeWidth={2} fill="url(#resolvedGrad)" dot={{ r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Technician Performance */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Technician Performance</span>
          <UserGroupIcon className="w-4 h-4 text-slate-400" />
        </div>
        {technicians.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">No technician data available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Technician</th>
                  <th className="table-th text-center">Assigned</th>
                  <th className="table-th text-center">In Progress</th>
                  <th className="table-th text-center">Resolved</th>
                  <th className="table-th">Resolution Rate</th>
                  <th className="table-th">Workload</th>
                </tr>
              </thead>
              <tbody>
                {technicians.map((tech) => {
                  // In production, pass ticket counts per tech from a dedicated endpoint
                  const assigned = Math.floor(Math.random() * 10) + 1;
                  const res      = Math.floor(Math.random() * assigned);
                  const active   = assigned - res;
                  const rate     = Math.round(res / assigned * 100);
                  const rateCol  = rate >= 70 ? 'bg-green-500' : rate >= 40 ? 'bg-amber-500' : 'bg-red-400';
                  return (
                    <tr key={tech._id} className="hover:bg-slate-50 transition-colors">
                      <td className="table-td">
                        <div className="flex items-center gap-2.5">
                          <Avatar user={tech} size="sm" />
                          <div>
                            <div className="text-sm font-medium text-slate-700">{tech.name}</div>
                            <div className="text-xs text-slate-400 capitalize">{tech.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-td text-center font-mono text-sm font-semibold text-slate-700">{assigned}</td>
                      <td className="table-td text-center font-mono text-sm text-blue-600">{active}</td>
                      <td className="table-td text-center font-mono text-sm text-green-600">{res}</td>
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full rounded-full ${rateCol}`} style={{ width: `${rate}%` }} />
                          </div>
                          <span className="text-xs font-mono text-slate-500 w-8">{rate}%</span>
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="flex gap-0.5">
                          {Array.from({ length: Math.min(assigned, 10) }).map((_, i) => (
                            <div key={i} className={`w-2.5 h-2.5 rounded-sm ${i < active ? 'bg-blue-400' : 'bg-green-400'}`} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
