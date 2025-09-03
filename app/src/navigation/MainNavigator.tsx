import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Screens
import { HomeScreen } from '@/screens/main/HomeScreen';
import { ExploreScreen } from '@/screens/main/ExploreScreen';
import { GamesScreen } from '@/screens/games/GamesScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { GameDetailsScreen } from '@/screens/games/GameDetailsScreen';
import { CreateGameScreen } from '@/screens/games/CreateGameScreen';
import { VenueDetailsScreen } from '@/screens/venues/VenueDetailsScreen';
import { ChatScreen } from '@/screens/chat/ChatScreen';
import { PaymentScreen } from '@/screens/payment/PaymentScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';

import { colors } from '@/constants/theme';

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Games: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  GameDetails: { gameId: number };
  CreateGame: undefined;
  VenueDetails: { venueId: number };
  Chat: { gameId: number };
  Payment: { gameId: number; provider: 'ESEWA' | 'KHALTI' };
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Games') {
            iconName = focused ? 'football' : 'football-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: Platform.OS === 'ios' ? 5 : 0,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter',
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? 0 : 5,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'होम' }} // Home in Nepali
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen}
        options={{ tabBarLabel: 'खोज्नुहोस्' }} // Explore in Nepali
      />
      <Tab.Screen 
        name="Games" 
        component={GamesScreen}
        options={{ tabBarLabel: 'खेलहरू' }} // Games in Nepali
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'प्रोफाइल' }} // Profile in Nepali
      />
    </Tab.Navigator>
  );
};

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
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
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="GameDetails" component={GameDetailsScreen} />
      <Stack.Screen name="CreateGame" component={CreateGameScreen} />
      <Stack.Screen name="VenueDetails" component={VenueDetailsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};