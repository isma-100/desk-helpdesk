import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from 'api';
import { Spinner } from 'components/common';
import { ShieldCheckIcon, EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// ─── Step 1: Request reset code ───────────────────────────────────────────────
export const ForgotPasswordPage = () => {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [devCode, setDevCode] = useState(null);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.forgotPassword({ email });
      setSent(true);
      // Dev mode: show the code
      if (res.data.resetCode) setDevCode(res.data.resetCode);
      toast.success('Reset code sent!');
    } catch (err) {
      // Always show success to prevent enumeration (even on error)
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Reset your password</h1>
          <p className="text-sm text-slate-500 mt-1">DESK — IT Helpdesk</p>
        </div>

        <div className="card p-8">
          {!sent ? (
            <>
              <h2 className="text-base font-semibold text-slate-800 mb-1">Forgot password?</h2>
              <p className="text-sm text-slate-500 mb-6">
                Enter your work email and we'll send you a reset code.
              </p>
              <form onSubmit={handleSubmit} noValidate>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}
                <div className="mb-5">
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={`input pl-9 ${error ? 'input-error' : ''}`}
                      placeholder="you@company.com"
                      autoFocus
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-full justify-center" disabled={loading}>
                  {loading ? <><Spinner size="sm" />Sending…</> : 'Send Reset Code'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl mb-4">
                <EnvelopeIcon className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-base font-semibold text-slate-800 mb-2">Check your email</h2>
              <p className="text-sm text-slate-500 mb-4">
                If <strong>{email}</strong> is registered, a 6-digit code has been sent. It expires in 15 minutes.
              </p>

              {/* Dev mode: show code */}
              {devCode && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                  <div className="text-amber-700 font-semibold text-xs mb-1">⚠️ DEV MODE ONLY — Reset Code:</div>
                  <div className="text-2xl font-bold font-mono text-amber-800 tracking-widest">{devCode}</div>
                </div>
              )}

              <button
                onClick={() => navigate('/reset-password', { state: { email } })}
                className="btn btn-primary w-full justify-center mb-3"
              >
                Enter Reset Code
              </button>
              <button onClick={() => { setSent(false); setDevCode(null); }} className="text-xs text-slate-400 hover:text-slate-600">
                Try a different email
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">← Back to Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Step 2: Enter code + new password ───────────────────────────────────────
export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', resetCode: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (f) => (e) => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    if (errors[f]) setErrors(p => ({ ...p, [f]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.resetCode.trim() || form.resetCode.length !== 6)   e.resetCode = '6-digit code required';
    if (form.newPassword.length < 6) e.newPassword = 'Min 6 characters';
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authAPI.resetPassword({
        email: form.email,
        resetCode: form.resetCode,
        newPassword: form.newPassword,
      });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err.message || 'Invalid or expired code');
      setErrors({ resetCode: err.message || 'Invalid or expired code' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
            <KeyIcon className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Password Reset!</h2>
          <p className="text-sm text-slate-500">Redirecting to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Enter your reset code</h1>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input type="email" value={form.email} onChange={set('email')}
                className={`input ${errors.email ? 'input-error' : ''}`} placeholder="you@company.com" />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>
            <div>
              <label className="label">6-Digit Reset Code</label>
              <input
                type="text"
                value={form.resetCode}
                onChange={e => set('resetCode')({ target: { value: e.target.value.replace(/\D/g, '').slice(0, 6) } })}
                className={`input text-center font-mono text-xl tracking-[0.4em] ${errors.resetCode ? 'input-error' : ''}`}
                placeholder="000000"
                maxLength={6}
              />
              {errors.resetCode && <p className="error-text">{errors.resetCode}</p>}
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" value={form.newPassword} onChange={set('newPassword')}
                className={`input ${errors.newPassword ? 'input-error' : ''}`} placeholder="Min 6 characters" />
              {errors.newPassword && <p className="error-text">{errors.newPassword}</p>}
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                className={`input ${errors.confirmPassword ? 'input-error' : ''}`} placeholder="Repeat password" />
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
            </div>
            <button type="submit" className="btn btn-primary w-full justify-center mt-2" disabled={loading}>
              {loading ? <><Spinner size="sm" />Resetting…</> : 'Reset Password'}
            </button>
          </form>
          <div className="mt-5 text-center">
            <Link to="/forgot-password" className="text-xs text-slate-400 hover:text-slate-600">← Request a new code</Link>
            <span className="mx-2 text-slate-300">·</span>
            <Link to="/login" className="text-xs text-slate-400 hover:text-slate-600">Back to Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
