import React, { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useIsAuthenticated, useAuthLoading } from '../stores/authStore';
import { appLifecycle } from '../services/appInitializer';
import { RootStackParamList } from '../types';

// Screen imports
import LoadingScreen from '../screens/LoadingScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Root Navigator with Authentication Flow
 * Handles app-level navigation and authentication state
 */
const RootNavigator: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      appLifecycle.onAppStateChange(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Show loading screen during authentication check
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;