import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from 'api';
import { useAuth } from 'context/AuthContext';
import { Avatar, Spinner, FormField } from 'components/common';
import { formatDateTime } from 'utils/helpers';
import { UserCircleIcon, KeyIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const ROLE_LABELS = { employee: 'Employee', technician: 'IT Technician', admin: 'Administrator' };
const ROLE_COLORS = {
  employee:   'bg-green-50 text-green-700 border-green-200',
  technician: 'bg-blue-50 text-blue-700 border-blue-200',
  admin:      'bg-red-50 text-red-700 border-red-200',
};

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', department: user?.department || '', phone: user?.phone || '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  const setProfile = (f) => (e) => { setProfileForm(p => ({ ...p, [f]: e.target.value })); if (profileErrors[f]) setProfileErrors(p => ({ ...p, [f]: '' })); };
  const setPw     = (f) => (e) => { setPwForm(p => ({ ...p, [f]: e.target.value }));       if (pwErrors[f])      setPwErrors(p => ({ ...p, [f]: '' })); };

  const saveProfile = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!profileForm.name.trim()) errs.name = 'Name is required';
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }
    setSavingProfile(true);
    try {
      const res = await authAPI.updateProfile(profileForm);
      updateUser(res.data.data);
      toast.success('Profile updated');
    } catch (err) { toast.error(err.message || 'Update failed'); }
    finally { setSavingProfile(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = 'Current password required';
    if (pwForm.newPassword.length < 6) errs.newPassword = 'Min 6 characters';
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setSavingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.message || 'Failed to change password'); }
    finally { setSavingPw(false); }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">My Profile</h2>
        <p className="text-sm text-slate-400 mt-0.5">Manage your personal information and security settings</p>
      </div>

      {/* Profile summary */}
      <div className="card p-6 flex items-center gap-5">
        <Avatar user={user} size="lg" />
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-800">{user?.name}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge border ${ROLE_COLORS[user?.role]}`}>
              <ShieldCheckIcon className="w-3 h-3" />
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
            {user?.department && (
              <span className="badge bg-slate-100 text-slate-600">{user.department}</span>
            )}
          </div>
        </div>
        <div className="text-right text-xs text-slate-400">
          <div>Member since</div>
          <div className="font-mono mt-0.5">{formatDateTime(user?.createdAt)}</div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <UserCircleIcon className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">Personal Information</h3>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name" required error={profileErrors.name}>
              <input value={profileForm.name} onChange={setProfile('name')}
                className={`input ${profileErrors.name ? 'input-error' : ''}`} placeholder="Your full name" />
            </FormField>
            <FormField label="Department">
              <input value={profileForm.department} onChange={setProfile('department')}
                className="input" placeholder="e.g. Marketing" />
            </FormField>
          </div>
          <FormField label="Phone Number">
            <input value={profileForm.phone} onChange={setProfile('phone')}
              className="input" placeholder="+27 82 000 0000" type="tel" />
          </FormField>
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? <><Spinner size="sm" />Saving…</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <KeyIcon className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">Change Password</h3>
        </div>
        <form onSubmit={changePassword} className="space-y-4">
          <FormField label="Current Password" required error={pwErrors.currentPassword}>
            <input type="password" value={pwForm.currentPassword} onChange={setPw('currentPassword')}
              className={`input ${pwErrors.currentPassword ? 'input-error' : ''}`} placeholder="••••••••" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="New Password" required error={pwErrors.newPassword}>
              <input type="password" value={pwForm.newPassword} onChange={setPw('newPassword')}
                className={`input ${pwErrors.newPassword ? 'input-error' : ''}`} placeholder="Min 6 characters" />
            </FormField>
            <FormField label="Confirm New Password" required error={pwErrors.confirmPassword}>
              <input type="password" value={pwForm.confirmPassword} onChange={setPw('confirmPassword')}
                className={`input ${pwErrors.confirmPassword ? 'input-error' : ''}`} placeholder="Repeat new password" />
            </FormField>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
            Password must be at least 6 characters. We recommend using a mix of letters, numbers, and symbols.
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={savingPw}>
              {savingPw ? <><Spinner size="sm" />Updating…</> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
