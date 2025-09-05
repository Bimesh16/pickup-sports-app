import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';

import { useAuthStore } from '@/stores/authStore';
import { NepalTheme } from '@/constants/theme';
import RootNavigator from '@/navigation/RootNavigator';
import { LoadingScreen } from '@/screens/LoadingScreen';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function App() {
  const { isLoading: authLoading } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // App initialization - auth is handled by Zustand persist
        console.log('App initialized');
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    initializeApp();
  }, []);

  const isLoading = authLoading;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <PaperProvider theme={NepalTheme}>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </PaperProvider>
        </LanguageProvider>
      </SafeAreaProvider>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}