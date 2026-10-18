import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = {
  ADMIN: { email: 'admin@farmdirect.dev', pass: 'Admin@FarmDirect2024!', label: 'Admin (Platform)' },
  FARMER: { email: 'mary@farmdirect.dev', pass: 'FarmDirect@123', label: "Farmer (Mary's Organic)" },
  CONSUMER: { email: 'alice@consumer.dev', pass: 'FarmDirect@123', label: 'Consumer (Alice Wong)' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  const fetchCurrentUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setFarmerProfile(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setFarmerProfile(res.farmerProfile || null);
      } else {
        setAuthToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn('Failed to fetch user with existing token:', err.message);
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!getAuthToken()) return;
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch {
      // ignore in background
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      setAuthModalOpen(false);
      await fetchCurrentUser();
      await fetchNotifications();
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      setAuthModalOpen(false);
      await fetchCurrentUser();
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAuthToken(null);
      setUser(null);
      setFarmerProfile(null);
      setNotifications([]);
    }
  };

  const quickLogin = async (role) => {
    const account = DEMO_ACCOUNTS[role];
    if (!account) return;
    return login(account.email, account.pass);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        farmerProfile,
        loading,
        notifications,
        unreadCount,
        login,
        register,
        logout,
        quickLogin,
        fetchNotifications,
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
