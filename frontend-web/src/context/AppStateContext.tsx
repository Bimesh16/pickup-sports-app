import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Notification, User } from '@app-types/api';
import { notificationsApi, profilesApi } from '@api/dashboard';
import { useAuth } from '@hooks/useAuth';

interface AppStateContextValue {
  profile: User | null;
  notifications: Notification[];
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  getUnreadCount: () => number;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const result = await profilesApi.me();
      setProfile(result);
    } catch (error) {
      console.warn('Failed to load profile', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const refreshNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const result = await notificationsApi.list();
      setNotifications(result);
    } catch (error) {
      console.warn('Failed to load notifications', error);
    }
  }, [token]);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  }, []);

  const markNotificationAsRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markRead(parseInt(id));
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.warn('Failed to mark notification as read', error);
      // Update locally even if API fails
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(unreadNotifications.map(notif => 
        notificationsApi.markRead(parseInt(notif.id))
      ));
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.warn('Failed to mark all notifications as read', error);
      // Update locally even if API fails
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    }
  }, [notifications]);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  useEffect(() => {
    if (!token) {
      setProfile(null);
      setNotifications([]);
      return;
    }
    void refreshProfile();
    void refreshNotifications();
  }, [token, refreshProfile, refreshNotifications]);

  const value = useMemo(() => ({
    profile,
    notifications,
    isLoading,
    refreshProfile,
    refreshNotifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadCount
  }), [profile, notifications, isLoading, refreshProfile, refreshNotifications, addNotification, markNotificationAsRead, markAllNotificationsAsRead, getUnreadCount]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}
