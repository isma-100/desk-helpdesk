import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import { Spinner } from 'components/common';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  { role: 'Employee',   email: 'sarah@company.com',  password: 'password123' },
  { role: 'Technician', email: 'alex@company.com',   password: 'password123' },
  { role: 'Admin',      email: 'david@company.com',  password: 'password123' },
];

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim())    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password.trim()) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'employee' ? '/tickets/my' : '/', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc) => setForm({ email: acc.email, password: acc.password });

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">DESK</h1>
          <p className="text-sm text-slate-500 mt-1">IT Support Portal</p>
        </div>

        <div className="card p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Sign in</h2>
          <p className="text-sm text-slate-500 mb-6">Enter your credentials to access the helpdesk</p>

          <div className="mb-5 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-xs font-semibold text-blue-700 mb-2">Demo Accounts</div>
            <div className="flex gap-2 flex-wrap">
              {DEMO_ACCOUNTS.map(acc => (
                <button key={acc.role} onClick={() => fillDemo(acc)}
                  className="px-2.5 py-1 bg-white rounded border border-blue-200 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                  {acc.role}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {errors.general}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input type="email" value={form.email}
                  onChange={e => setForm(p => ({...p, email: e.target.value}))}
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@company.com" autoComplete="email" />
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label !mb-0">Password</label>
                  <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
                </div>
                <input type="password" value={form.password}
                  onChange={e => setForm(p => ({...p, password: e.target.value}))}
                  className={`input ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••" autoComplete="current-password" />
                {errors.password && <p className="error-text">{errors.password}</p>}
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full mt-6" disabled={loading}>
              {loading ? <><Spinner size="sm" /><span>Signing in…</span></> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            No account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirmPassword: '', department: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 6)  e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, department: form.department });
      navigate('/tickets/my', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      setErrors({ general: err.message });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
          <p className="text-sm text-slate-500 mt-1">IT Helpdesk Portal</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} noValidate>
            {errors.general && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{errors.general}</div>}
            <div className="space-y-4">
              {[
                { field: 'name',            label: 'Full Name',        type: 'text',     placeholder: 'Sarah Johnson' },
                { field: 'email',           label: 'Email',            type: 'email',    placeholder: 'you@company.com' },
                { field: 'department',      label: 'Department',       type: 'text',     placeholder: 'Marketing' },
                { field: 'password',        label: 'Password',         type: 'password', placeholder: 'Min. 6 characters' },
                { field: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password' },
              ].map(({ field, label, type, placeholder }) => (
                <div key={field}>
                  <label className="label">{label}</label>
                  <input type={type} value={form[field]} onChange={set(field)}
                    className={`input ${errors[field] ? 'input-error' : ''}`} placeholder={placeholder} />
                  {errors[field] && <p className="error-text">{errors[field]}</p>}
                </div>
              ))}
            </div>
            <button type="submit" className="btn btn-primary w-full mt-6" disabled={loading}>
              {loading ? <><Spinner size="sm" />Creating account…</> : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
