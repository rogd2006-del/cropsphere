import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children, clerkBridge = null }) {
  const [user, setUser] = useState(null);
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
  const [pendingClerkRole, setPendingClerkRole] = useState('CONSUMER');

  // Clerk publishable key management (checks .env or localStorage for flexibility)
  const [clerkPubKey, setClerkPubKey] = useState(
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || localStorage.getItem('clerk_publishable_key') || ''
  );

  const saveClerkPublishableKey = (key) => {
    const trimmed = (key || '').trim();
    if (trimmed) {
      localStorage.setItem('clerk_publishable_key', trimmed);
    } else {
      localStorage.removeItem('clerk_publishable_key');
    }
    setClerkPubKey(trimmed);
  };

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
      // ignore background poll error
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

  const syncClerkSession = async (clerkUserData, options = {}) => {
    if (!clerkUserData) return;

    try {
      const email =
        clerkUserData.primaryEmailAddress?.emailAddress ||
        clerkUserData.emailAddresses?.[0]?.emailAddress ||
        clerkUserData.email;

      const name =
        clerkUserData.fullName ||
        [clerkUserData.firstName, clerkUserData.lastName].filter(Boolean).join(' ') ||
        clerkUserData.name ||
        email?.split('@')[0];

      const avatar = clerkUserData.imageUrl || clerkUserData.avatar;
      const role = options.role || pendingClerkRole || 'CONSUMER';

      const res = await api.clerkSync({
        clerkId: clerkUserData.id,
        email,
        name,
        avatar,
        role,
        farmName: options.farmName,
        city: options.city,
        state: options.state,
      });

      if (res.success && res.token) {
        setAuthToken(res.token);
        setUser(res.user);
        setFarmerProfile(res.farmerProfile || null);
        setAuthModalOpen(false);
        await fetchNotifications();
        return res;
      }
    } catch (err) {
      console.error('Clerk session synchronization failed:', err);
      throw err;
    }
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
      if (clerkBridge?.signOut) {
        try {
          await clerkBridge.signOut();
        } catch (e) {
          console.warn('Clerk sign out:', e.message);
        }
      }
    }
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
        syncClerkSession,
        fetchNotifications,
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        clerkPubKey,
        saveClerkPublishableKey,
        pendingClerkRole,
        setPendingClerkRole,
        clerkBridge,
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
