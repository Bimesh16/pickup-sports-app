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
    refreshNotifications
  }), [profile, notifications, isLoading, refreshProfile, refreshNotifications]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}
