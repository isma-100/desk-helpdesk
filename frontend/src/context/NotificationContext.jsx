import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationAPI } from 'api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch { /* silent */ }
  }, [user]);

  // Poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = useCallback(async (ids = []) => {
    try {
      await notificationAPI.markRead(ids);
      setNotifications(prev =>
        prev.map(n => (!ids.length || ids.includes(n._id)) ? { ...n, isRead: true } : n)
      );
      setUnreadCount(0);
    } catch { /* silent */ }
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
