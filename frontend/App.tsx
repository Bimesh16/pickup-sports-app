import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as PaperProvider } from 'react-native-paper';

import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore } from './src/stores/authStore';
import { useLocationStore } from './src/stores/locationStore';
import { ModalProvider } from './src/components/common/ModalProvider';
import { nepalTheme } from './src/styles/theme';
import { initializeApp } from './src/services/appInitializer';

// React Query client with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const requestLocationPermission = useLocationStore((state) => state.requestPermission);

  useEffect(() => {
    // Initialize app services
    const initApp = async () => {
      try {
        await initializeApp();
        await initializeAuth();
        await requestLocationPermission();
      } catch (error) {
        console.error('App initialization failed:', error);
      }
    };

    initApp();
  }, [initializeAuth, requestLocationPermission]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={nepalTheme}>
            <ModalProvider>
              <NavigationContainer>
                <RootNavigator />
                <StatusBar style="auto" />
              </NavigationContainer>
            </ModalProvider>
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}