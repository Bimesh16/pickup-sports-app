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
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useUIStore } from '@/stores/uiStore';
import { I18nManager } from 'react-native';

export default function App() {
  const { isLoading: authLoading } = useAuthStore();
  const { rtlEnabled, highContrast } = useUIStore();

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

  // Note: changing RTL at runtime may require app reload; we set allowRTL
  I18nManager.allowRTL(rtlEnabled);

  const theme = React.useMemo(() => {
    if (!highContrast) return NepalTheme;
    return {
      ...NepalTheme,
      colors: {
        ...NepalTheme.colors,
        primary: '#FFD700',
        secondary: '#FFFFFF',
        background: '#000000',
        surface: '#0A0A0A',
        onSurface: '#FFFFFF',
        onBackground: '#FFFFFF',
        onPrimary: '#000000',
        onSecondary: '#000000',
      },
    } as typeof NepalTheme;
  }, [highContrast]);

  const isLoading = authLoading;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <PaperProvider theme={theme}>
            <ErrorBoundary>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </ErrorBoundary>
          </PaperProvider>
        </LanguageProvider>
      </SafeAreaProvider>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
