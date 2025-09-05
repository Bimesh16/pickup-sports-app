import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  sports: string[];
  amenities: string[];
  rating: number;
  image?: string;
}

interface LocationState {
  locations: Location[];
  currentLocation: Location | null;
  isLoading: boolean;
  error: string | null;
}

interface LocationActions {
  setLocations: (locations: Location[]) => void;
  setCurrentLocation: (location: Location | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addLocation: (location: Location) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  deleteLocation: (id: string) => void;
}

export const useLocationStore = create<LocationState & LocationActions>()(
  persist(
    (set, get) => ({
      locations: [],
      currentLocation: null,
      isLoading: false,
      error: null,
      setLocations: (locations) => set({ locations }),
      setCurrentLocation: (location) => set({ currentLocation: location }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      addLocation: (location) => set((state) => ({ locations: [...state.locations, location] })),
      updateLocation: (id, updates) =>
        set((state) => ({
          locations: state.locations.map((location) =>
            location.id === id ? { ...location, ...updates } : location
          ),
        })),
      deleteLocation: (id) =>
        set((state) => ({
          locations: state.locations.filter((location) => location.id !== id),
        })),
    }),
    {
      name: 'location-storage',
    }
  )
);
