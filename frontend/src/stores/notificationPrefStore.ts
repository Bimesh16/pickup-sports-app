import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationPrefsState {
  gameInvites: boolean;
  recommendations: boolean;
  systemAlerts: boolean;
}

interface NotificationPrefsActions {
  setGameInvites: (v: boolean) => void;
  setRecommendations: (v: boolean) => void;
  setSystemAlerts: (v: boolean) => void;
}

export const useNotificationPrefStore = create<NotificationPrefsState & NotificationPrefsActions>()(
  persist(
    (set) => ({
      gameInvites: true,
      recommendations: true,
      systemAlerts: true,
      setGameInvites: (v) => set({ gameInvites: v }),
      setRecommendations: (v) => set({ recommendations: v }),
      setSystemAlerts: (v) => set({ systemAlerts: v }),
    }),
    { name: 'notification-prefs' }
  )
);

