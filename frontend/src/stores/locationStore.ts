import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData, LocationCoordinates } from '../types';

interface LocationState {
  // State
  currentLocation: LocationData | null;
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
  watchId: Location.LocationSubscription | null;

  // Actions
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<LocationCoordinates>;
  startLocationTracking: () => Promise<void>;
  stopLocationTracking: () => void;
  updateLocation: (location: LocationData) => void;
  clearError: () => void;
}

// Reverse geocoding to get address from coordinates
const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<{ address: string; city: string; country: string; countryCode: string }> => {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    
    if (results && results.length > 0) {
      const location = results[0];
      const address = [
        location.name,
        location.street,
        location.district,
        location.city,
        location.region,
      ]
        .filter(Boolean)
        .join(', ');

      return {
        address: address || 'Unknown location',
        city: location.city || location.district || 'Unknown city',
        country: location.country || 'Unknown country',
        countryCode: location.isoCountryCode || 'XX',
      };
    }
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
  }

  return {
    address: 'Unknown location',
    city: 'Unknown city',
    country: 'Unknown country',
    countryCode: 'XX',
  };
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentLocation: null,
      hasPermission: false,
      isLoading: false,
      error: null,
      watchId: null,

      // Request location permission
      requestPermission: async () => {
        set({ isLoading: true, error: null });

        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          const hasPermission = status === 'granted';
          
          set({ hasPermission, isLoading: false });
          
          if (hasPermission) {
            // Get initial location
            await get().getCurrentLocation();
          } else {
            set({ error: 'Location permission denied' });
          }
          
          return hasPermission;
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to request location permission';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      // Get current location
      getCurrentLocation: async () => {
        const { hasPermission } = get();
        
        if (!hasPermission) {
          throw new Error('Location permission not granted');
        }

        set({ isLoading: true, error: null });

        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            maximumAge: 60000, // 1 minute cache
          });

          const coordinates: LocationCoordinates = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
          };

          // Get address information
          const addressInfo = await reverseGeocode(
            coordinates.latitude,
            coordinates.longitude
          );

          const locationData: LocationData = {
            coordinates,
            ...addressInfo,
            timestamp: Date.now(),
          };

          set({
            currentLocation: locationData,
            isLoading: false,
            error: null,
          });

          return coordinates;
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to get current location';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Start continuous location tracking
      startLocationTracking: async () => {
        const { hasPermission, watchId } = get();
        
        if (!hasPermission) {
          await get().requestPermission();
        }

        // Stop existing tracking
        if (watchId) {
          get().stopLocationTracking();
        }

        try {
          const newWatchId = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 30000, // Update every 30 seconds
              distanceInterval: 100, // Update every 100 meters
            },
            async (location) => {
              const coordinates: LocationCoordinates = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy,
              };

              // Get address information
              const addressInfo = await reverseGeocode(
                coordinates.latitude,
                coordinates.longitude
              );

              const locationData: LocationData = {
                coordinates,
                ...addressInfo,
                timestamp: Date.now(),
              };

              set({ currentLocation: locationData });
            }
          );

          set({ watchId: newWatchId });
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to start location tracking';
          set({ error: errorMessage });
        }
      },

      // Stop location tracking
      stopLocationTracking: () => {
        const { watchId } = get();
        
        if (watchId) {
          watchId.remove();
          set({ watchId: null });
        }
      },

      // Update location manually
      updateLocation: (location: LocationData) => {
        set({ currentLocation: location, error: null });
      },

      // Clear error state
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist non-sensitive location data
      partialize: (state) => ({
        currentLocation: state.currentLocation,
        hasPermission: state.hasPermission,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useCurrentLocation = () => useLocationStore((state) => state.currentLocation);
export const useLocationPermission = () => useLocationStore((state) => state.hasPermission);
export const useLocationLoading = () => useLocationStore((state) => state.isLoading);
export const useLocationError = () => useLocationStore((state) => state.error);
export const useLocationActions = () => useLocationStore((state) => ({
  requestPermission: state.requestPermission,
  getCurrentLocation: state.getCurrentLocation,
  startLocationTracking: state.startLocationTracking,
  stopLocationTracking: state.stopLocationTracking,
  updateLocation: state.updateLocation,
  clearError: state.clearError,
}));

// Utility functions
export const calculateDistance = (
  coord1: LocationCoordinates,
  coord2: LocationCoordinates
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};