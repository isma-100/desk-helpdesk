import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export const NotFoundPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md animate-slide-up">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg mb-8">
          <ShieldCheckIcon className="w-8 h-8 text-white" />
        </div>

        {/* 404 display */}
        <div className="text-8xl font-black text-slate-200 select-none leading-none mb-2">
          404
        </div>
        <h1 className="text-xl font-semibold text-slate-700 mb-3">Page not found</h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-8">
          The page you are looking for does not exist or you may not have permission to access it.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            ← Go back
          </button>
          <Link
            to={user ? '/' : '/login'}
            className="btn btn-primary"
          >
            {user ? 'Dashboard' : 'Sign In'}
          </Link>
        </div>

        {/* Quick links */}
        {user && (
          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-xs text-slate-400 mb-3">Quick links</p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/"           className="text-sm text-blue-600 hover:underline">Dashboard</Link>
              <Link to="/tickets/my" className="text-sm text-blue-600 hover:underline">My Tickets</Link>
              <Link to="/profile"    className="text-sm text-blue-600 hover:underline">Profile</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
