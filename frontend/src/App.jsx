import React, { useState, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import { AppLayout } from 'components/layout/AppLayout';
import { LoginPage, RegisterPage } from 'pages/AuthPages';
import { ProfilePage } from 'pages/ProfilePage';
import { Dashboard } from 'components/dashboard/Dashboard';
import { ReportsPage } from 'components/dashboard/ReportsPage';
import { TicketsTable } from 'components/tickets/TicketsTable';
import { NewTicketModal } from 'components/tickets/NewTicketModal';
import { AdminUsersPage } from 'components/admin/AdminUsersPage';
import { AuditTrailPage } from 'components/admin/AuditTrailPage';
import { Spinner } from 'components/common';
import { ErrorBoundary } from 'components/common/ErrorBoundary';
import { NotFoundPage } from 'pages/NotFoundPage';
import { ForgotPasswordPage, ResetPasswordPage } from 'pages/ForgotPasswordPage';

// ─── New Ticket Context (so any component can trigger it) ─────────────────────
const NewTicketCtx = createContext(null);
export const useNewTicket = () => useContext(NewTicketCtx);

// ─── Route guards ──────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Spinner size="xl" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles) {
    const allowed = Array.isArray(roles) ? roles : [roles];
    if (!allowed.includes(user.role)) return <Navigate to="/" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <Spinner size="xl" />
    </div>
  );
  if (user) return <Navigate to="/" replace />;
  return children;
};

// ─── Authenticated shell with shared NewTicketModal ───────────────────────────
const AuthenticatedApp = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const openNewTicket  = () => setOpen(true);
  const closeNewTicket = () => setOpen(false);
  const onTicketCreated = () => {
    setRefreshKey(k => k + 1); // signal tables to refresh
    closeNewTicket();
  };

  return (
    <NewTicketCtx.Provider value={{ openNewTicket }}>
      <AppLayout title={title} onNewTicket={openNewTicket}>
        <ErrorBoundary>
          {React.cloneElement(children, { refreshKey, onNewTicket: openNewTicket })}
        </ErrorBoundary>
      </AppLayout>
      <NewTicketModal open={open} onClose={closeNewTicket} onSuccess={onTicketCreated} />
    </NewTicketCtx.Provider>
  );
};

// ─── App router ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* ── All logged-in users ── */}
      <Route path="/" element={
        <ProtectedRoute>
          <AuthenticatedApp title="Dashboard">
            <Dashboard />
          </AuthenticatedApp>
        </ProtectedRoute>
      } />

      <Route path="/tickets/my" element={
        <ProtectedRoute>
          <AuthenticatedApp title="My Tickets">
            <TicketsTable
              scope="my"
              title="My Tickets"
              emptyTitle="No tickets yet"
              emptyDesc="Tickets you submit will appear here. Use 'New Ticket' to report an issue."
            />
          </AuthenticatedApp>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <AuthenticatedApp title="My Profile">
            <ProfilePage />
          </AuthenticatedApp>
        </ProtectedRoute>
      } />

      {/* ── Technician + Admin only ── */}
      <Route path="/tickets" element={
        <ProtectedRoute roles={['technician', 'admin']}>
          <AuthenticatedApp title="All Tickets">
            <TicketsTable
              scope="all"
              title="All Tickets"
              emptyTitle="No tickets found"
              emptyDesc="All submitted tickets appear here. Try adjusting filters."
            />
          </AuthenticatedApp>
        </ProtectedRoute>
      } />

      <Route path="/tickets/queue" element={
        <ProtectedRoute roles={['technician', 'admin']}>
          <AuthenticatedApp title="My Queue">
            <TicketsTable
              scope="queue"
              title="My Queue"
              emptyTitle="Queue is empty"
              emptyDesc="Tickets assigned to you will appear here."
            />
          </AuthenticatedApp>
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute roles={['technician', 'admin']}>
          <AuthenticatedApp title="Reports & Analytics">
            <ReportsPage />
          </AuthenticatedApp>
        </ProtectedRoute>
      } />

      {/* ── Admin only ── */}
      <Route path="/admin/users" element={
        <ProtectedRoute roles="admin">
          <AuthenticatedApp title="User Management">
            <AdminUsersPage />
          </AuthenticatedApp>
        </ProtectedRoute>
      } />

      <Route path="/admin/audit" element={
        <ProtectedRoute roles="admin">
          <AuthenticatedApp title="Audit Trail">
            <AuditTrailPage />
          </AuthenticatedApp>
        </ProtectedRoute>
      } />

      {/* ── Password reset (public) ── */}
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password"  element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

      {/* ── 404 ── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
