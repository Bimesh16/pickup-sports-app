import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  reducedMotion: boolean;
  highContrast: boolean;
  rtlEnabled: boolean;
}

interface UIActions {
  setReducedMotion: (v: boolean) => void;
  setHighContrast: (v: boolean) => void;
  setRtlEnabled: (v: boolean) => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      reducedMotion: false,
      highContrast: false,
      rtlEnabled: false,
      setReducedMotion: (v) => set({ reducedMotion: v }),
      setHighContrast: (v) => set({ highContrast: v }),
      setRtlEnabled: (v) => set({ rtlEnabled: v }),
    }),
    { name: 'ui-pref' }
  )
);
