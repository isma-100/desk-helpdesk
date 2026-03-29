import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Load persisted session on app start
  useEffect(() => {
    const token    = localStorage.getItem('hd_token');
    const savedUser = localStorage.getItem('hd_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify token is still valid
        authAPI.getMe()
          .then(res => setUser(res.data.data))
          .catch(() => { logout(false); })
          .finally(() => setLoading(false));
      } catch {
        logout(false);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('hd_token', token);
    localStorage.setItem('hd_user', JSON.stringify(userData));
    setUser(userData);
    toast.success(`Welcome back, ${userData.name.split(' ')[0]}!`);
    return userData;
  }, []);

  const register = useCallback(async (formData) => {
    const res = await authAPI.register(formData);
    const { token, user: userData } = res.data;
    localStorage.setItem('hd_token', token);
    localStorage.setItem('hd_user', JSON.stringify(userData));
    setUser(userData);
    toast.success('Account created successfully!');
    return userData;
  }, []);

  const logout = useCallback((showToast = true) => {
    localStorage.removeItem('hd_token');
    localStorage.removeItem('hd_user');
    setUser(null);
    if (showToast) toast.success('Signed out successfully');
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('hd_user', JSON.stringify(updatedUser));
  }, []);

  // Role helpers
  const isAdmin     = user?.role === 'admin';
  const isTech      = user?.role === 'technician';
  const isEmployee  = user?.role === 'employee';
  const isStaff     = isAdmin || isTech;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAdmin, isTech, isEmployee, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
