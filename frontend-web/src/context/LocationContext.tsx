// src/context/LocationContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { NEPAL_LOCATIONS } from '@constants/nepal';

export type LocationData = { lat: number; lng: number; name: string };

type Ctx = {
  location: LocationData;
  setLocation: (loc: LocationData) => void;
};

const LocationContext = createContext<Ctx | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<LocationData>(() => {
    try {
      const raw = localStorage.getItem('ps_user_location');
      if (raw) return JSON.parse(raw);
    } catch {}
    return NEPAL_LOCATIONS.KATHMANDU;
  });

  const setLocation = (loc: LocationData) => {
    setLocationState(loc);
    try { localStorage.setItem('ps_user_location', JSON.stringify(loc)); } catch {}
  };

  const value = useMemo(() => ({ location, setLocation }), [location]);
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationContext must be used within LocationProvider');
  return ctx;
}

