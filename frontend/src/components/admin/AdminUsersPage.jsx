import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { userAPI } from 'api';
import {
  Avatar, StatCard, SearchInput, PageLoader, EmptyState,
  Modal, FormField, Select, Spinner, ConfirmDialog
} from 'components/common';
import { formatDateTime, ROLES } from 'utils/helpers';
import {
  UserGroupIcon, UserPlusIcon, PencilIcon,
  UserCircleIcon, CheckCircleIcon, XCircleIcon
} from '@heroicons/react/24/outline';

const ROLE_LABELS = { employee: 'Employee', technician: 'IT Technician', admin: 'Administrator' };
const ROLE_COLORS = {
  employee:   'bg-green-50 text-green-700',
  technician: 'bg-blue-50 text-blue-700',
  admin:      'bg-red-50 text-red-700',
};

const DEPT_OPTIONS = ['IT', 'Marketing', 'Finance', 'HR', 'Operations', 'Sales', 'Legal', 'General'];

const defaultForm = { name: '', email: '', password: '', role: 'employee', department: 'General', phone: '' };

const UserFormModal = ({ open, onClose, user, onSaved }) => {
  const isEdit = !!user;
  const [form, setForm]     = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(user
        ? { name: user.name, email: user.email, password: '', role: user.role, department: user.department || 'General', phone: user.phone || '' }
        : defaultForm
      );
      setErrors({});
    }
  }, [open, user]);

  const set = (field) => (val) => {
    setForm(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!isEdit && form.password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email, role: form.role, department: form.department, phone: form.phone };
      if (!isEdit || form.password) payload.password = form.password;
      const res = isEdit ? await userAPI.update(user._id, payload) : await userAPI.create(payload);
      toast.success(isEdit ? 'User updated' : 'User created successfully');
      onSaved(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save user');
    } finally { setSaving(false); }
  };

  return (
    <Modal
      open={open} onClose={onClose}
      title={isEdit ? 'Edit User' : 'Create New User'}
      subtitle={isEdit ? `Editing: ${user?.email}` : 'Add a new user to the system'}
      size="md"
      footer={<>
        <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <><Spinner size="sm" />Saving…</> : isEdit ? 'Save Changes' : 'Create User'}
        </button>
      </>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Full Name" required error={errors.name}>
            <input value={form.name} onChange={e => set('name')(e.target.value)}
              className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Jane Smith" />
          </FormField>
          <FormField label="Email Address" required error={errors.email}>
            <input type="email" value={form.email} onChange={e => set('email')(e.target.value)}
              className={`input ${errors.email ? 'input-error' : ''}`} placeholder="jane@company.com" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label={isEdit ? 'New Password (optional)' : 'Password'} required={!isEdit} error={errors.password}>
            <input type="password" value={form.password} onChange={e => set('password')(e.target.value)}
              className={`input ${errors.password ? 'input-error' : ''}`} placeholder={isEdit ? 'Leave blank to keep' : 'Min 6 characters'} />
          </FormField>
          <FormField label="Phone">
            <input value={form.phone} onChange={e => set('phone')(e.target.value)}
              className="input" placeholder="+27 82 000 0000" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Role" required>
            <Select value={form.role} onChange={set('role')}
              options={ROLES.map(r => ({ value: r, label: ROLE_LABELS[r] }))} />
          </FormField>
          <FormField label="Department">
            <Select value={form.department} onChange={set('department')}
              options={DEPT_OPTIONS} />
          </FormField>
        </div>
        {form.role === 'admin' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            ⚠️ Admin users have full access to all tickets, users, and system settings.
          </div>
        )}
      </div>
    </Modal>
  );
};

export const AdminUsersPage = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRole]   = useState('all');
  const [modalOpen, setModal]   = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [toggling, setToggling] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (search) params.search = search;
      const res = await userAPI.getAll(params);
      setUsers(res.data.data || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSaved = (saved) => {
    setUsers(prev => {
      const idx = prev.findIndex(u => u._id === saved._id);
      if (idx >= 0) { const arr = [...prev]; arr[idx] = saved; return arr; }
      return [saved, ...prev];
    });
  };

  const handleToggle = async () => {
    if (!confirmToggle) return;
    setToggling(true);
    try {
      const res = await userAPI.toggle(confirmToggle._id);
      handleSaved(res.data.data);
      toast.success(res.data.message);
    } catch (err) { toast.error(err.message); }
    finally { setToggling(false); setConfirmToggle(null); }
  };

  const stats = {
    total:      users.length,
    employees:  users.filter(u => u.role === 'employee').length,
    technicians: users.filter(u => u.role === 'technician').length,
    admins:     users.filter(u => u.role === 'admin').length,
    inactive:   users.filter(u => !u.isActive).length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">User Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">Manage system access and roles</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditUser(null); setModal(true); }}>
          <UserPlusIcon className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Total Users"   value={stats.total}       icon={UserGroupIcon}   color="text-blue-600" />
        <StatCard label="Employees"     value={stats.employees}   icon={UserCircleIcon}  color="text-green-600" />
        <StatCard label="Technicians"   value={stats.technicians} icon={UserCircleIcon}  color="text-blue-600" />
        <StatCard label="Admins"        value={stats.admins}      icon={UserCircleIcon}  color="text-red-600" />
        <StatCard label="Inactive"      value={stats.inactive}    icon={XCircleIcon}     color="text-slate-400" />
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email…" className="w-64" />
          <div className="flex gap-1.5 ml-2">
            {[{ v: 'all', l: 'All Roles' }, ...ROLES.map(r => ({ v: r, l: ROLE_LABELS[r] }))].map(({ v, l }) => (
              <button key={v} onClick={() => setRole(v)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                  ${roleFilter === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {loading ? <PageLoader /> : users.length === 0 ? (
          <EmptyState icon={UserGroupIcon} title="No users found" description="Try adjusting your search" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">User</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Role</th>
                  <th className="table-th">Department</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Last Login</th>
                  <th className="table-th">Joined</th>
                  <th className="table-th w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-td">
                      <div className="flex items-center gap-2.5">
                        <Avatar user={u} size="sm" />
                        <span className="text-sm font-medium text-slate-700">{u.name}</span>
                      </div>
                    </td>
                    <td className="table-td text-slate-500 text-xs font-mono">{u.email}</td>
                    <td className="table-td">
                      <span className={`badge ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span>
                    </td>
                    <td className="table-td text-slate-500 text-xs">{u.department || '—'}</td>
                    <td className="table-td">
                      {u.isActive ? (
                        <span className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
                          <CheckCircleIcon className="w-3.5 h-3.5" />Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                          <XCircleIcon className="w-3.5 h-3.5" />Inactive
                        </span>
                      )}
                    </td>
                    <td className="table-td text-slate-400 text-xs font-mono">
                      {u.lastLogin ? formatDateTime(u.lastLogin) : 'Never'}
                    </td>
                    <td className="table-td text-slate-400 text-xs font-mono">
                      {formatDateTime(u.createdAt)}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditUser(u); setModal(true); }}
                          className="btn-icon w-7 h-7" title="Edit">
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmToggle(u)}
                          className={`btn-icon w-7 h-7 ${u.isActive ? 'hover:text-red-500' : 'hover:text-green-500'}`}
                          title={u.isActive ? 'Deactivate' : 'Activate'}>
                          {u.isActive ? <XCircleIcon className="w-3.5 h-3.5" /> : <CheckCircleIcon className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserFormModal
        open={modalOpen}
        onClose={() => setModal(false)}
        user={editUser}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        onConfirm={handleToggle}
        loading={toggling}
        title={confirmToggle?.isActive ? 'Deactivate User' : 'Activate User'}
        message={confirmToggle?.isActive
          ? `Deactivate ${confirmToggle?.name}? They will not be able to log in.`
          : `Re-activate ${confirmToggle?.name}? They will regain access immediately.`}
        confirmLabel={confirmToggle?.isActive ? 'Deactivate' : 'Activate'}
        danger={confirmToggle?.isActive}
      />
    </div>
  );
};
