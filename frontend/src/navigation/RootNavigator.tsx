import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../contexts/ThemeContext';

// Import navigators
import AuthStackNavigator from './AuthStackNavigator';
import MainTabNavigator from './MainTabNavigator';

// Import screens
import GameDetailsScreen from '../screens/game/GameDetailsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';

// Types
import { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.log('Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return null; // You can add a loading screen here
  }

  const linking = {
    prefixes: ['pickupsports://'],
    config: {
      screens: {
        Auth: {
          screens: {
            Welcome: 'welcome',
            Login: 'login',
            Signup: 'signup',
            ForgotPassword: 'forgot-password',
          },
        },
        Main: {
          screens: {
            Home: 'home',
            Explore: 'explore',
            Create: 'create',
            Chat: 'chat',
            Profile: 'profile',
          },
        },
        GameDetails: 'game/:gameId',
        Profile: 'user/:userId',
        EditProfile: 'edit-profile',
        Settings: 'settings',
        Notifications: 'notifications',
      },
    },
  };

  return (
    <NavigationContainer
      linking={linking}
      theme={{
        dark: theme === theme, // Will be properly implemented
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.primary,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
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
          // Authenticated screens
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen 
              name="GameDetails" 
              component={GameDetailsScreen}
              options={{
                headerShown: true,
                headerBackTitleVisible: false,
                headerStyle: {
                  backgroundColor: theme.colors.background,
                  elevation: 0,
                  shadowOpacity: 0,
                  borderBottomWidth: 0,
                },
                headerTintColor: theme.colors.text,
              }}
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen}
              options={{
                headerShown: true,
                headerTitle: 'Edit Profile',
                headerBackTitleVisible: false,
                headerStyle: {
                  backgroundColor: theme.colors.background,
                  elevation: 0,
                  shadowOpacity: 0,
                  borderBottomWidth: 0,
                },
                headerTintColor: theme.colors.text,
              }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{
                headerShown: true,
                headerTitle: 'Settings',
                headerBackTitleVisible: false,
                headerStyle: {
                  backgroundColor: theme.colors.background,
                  elevation: 0,
                  shadowOpacity: 0,
                  borderBottomWidth: 0,
                },
                headerTintColor: theme.colors.text,
              }}
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen}
              options={{
                headerShown: true,
                headerTitle: 'Notifications',
                headerBackTitleVisible: false,
                headerStyle: {
                  backgroundColor: theme.colors.background,
                  elevation: 0,
                  shadowOpacity: 0,
                  borderBottomWidth: 0,
                },
                headerTintColor: theme.colors.text,
              }}
            />
          </>
        ) : (
          // Authentication screens
          <Stack.Screen name="Auth" component={AuthStackNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;