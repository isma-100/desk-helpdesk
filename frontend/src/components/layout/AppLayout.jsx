import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Avatar } from '../common';
import { relativeTime } from '../../utils/helpers';
import {
  HomeIcon, TicketIcon, QueueListIcon, UserGroupIcon,
  ChartBarIcon, ShieldCheckIcon, BellIcon, PlusCircleIcon,
  ArrowRightOnRectangleIcon, Cog6ToothIcon
} from '@heroicons/react/24/outline';

const NavItem = ({ to, icon: Icon, label, badge, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
       ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`
    }
  >
    <Icon className="w-4 h-4 flex-shrink-0" />
    <span className="flex-1">{label}</span>
    {badge > 0 && (
      <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold px-1">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </NavLink>
);

const Sidebar = ({ onNewTicket }) => {
  const { user, isAdmin, isStaff, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShieldCheckIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-800 leading-none">DESK</div>
            <div className="text-[10px] text-slate-400 tracking-widest uppercase">IT Support</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
        <NavItem to="/" icon={HomeIcon} label="Dashboard" end />

        {user?.role === 'employee' ? (
          <>
            <NavItem to="/tickets/my" icon={TicketIcon} label="My Tickets" />
            <button
              onClick={onNewTicket}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
                         text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
            >
              <PlusCircleIcon className="w-4 h-4 flex-shrink-0" />
              Submit Ticket
            </button>
          </>
        ) : (
          <>
            <NavItem to="/tickets" icon={QueueListIcon} label="All Tickets" />
            <NavItem to="/tickets/queue" icon={TicketIcon} label="My Queue" />
          </>
        )}

        {isStaff && (
          <>
            <div className="pt-3 pb-1 px-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tools</span>
            </div>
            <NavItem to="/reports" icon={ChartBarIcon} label="Reports" />
          </>
        )}

        {isAdmin && (
          <>
            <NavItem to="/admin/users" icon={UserGroupIcon} label="Users" />
            <NavItem to="/admin/audit" icon={ShieldCheckIcon} label="Audit Trail" />
          </>
        )}
      </nav>

      {/* User section */}
      <div className="px-3 py-3 border-t border-slate-100">
        <div
          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer group"
          onClick={() => navigate('/profile')}
        >
          <Avatar user={user} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-700 truncate">{user?.name}</div>
            <div className="text-[10px] text-slate-400 capitalize">{user?.role}</div>
          </div>
          <Cog6ToothIcon className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
        </div>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2 mt-1 px-2 py-1.5 rounded-lg text-xs font-medium
                     text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
};

const Topbar = ({ title, actions }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markRead } = useNotifications();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4 sticky top-0 z-30">
      <h1 className="text-sm font-semibold text-slate-800 flex-1">{title}</h1>
      <div className="flex items-center gap-2">
        {actions}
        {/* Bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen(v => !v)}
            className="btn-icon relative"
          >
            <BellIcon className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-slide-up overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-700">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={() => markRead()} className="text-xs text-blue-600 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-400">No notifications</div>
                ) : notifications.slice(0, 10).map(n => (
                  <div
                    key={n._id}
                    onClick={() => { markRead([n._id]); setBellOpen(false); }}
                    className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors
                      ${!n.isRead ? 'border-l-2 border-blue-500 bg-blue-50/30' : ''}`}
                  >
                    <div className="text-xs text-slate-700 leading-relaxed">{n.message}</div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">{relativeTime(n.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Avatar user={user} size="sm" />
      </div>
    </header>
  );
};

export const AppLayout = ({ children, title, actions, onNewTicket }) => (
  <div className="flex h-screen bg-slate-50 overflow-hidden">
    <Sidebar onNewTicket={onNewTicket} />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Topbar title={title} actions={actions} />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  </div>
);
