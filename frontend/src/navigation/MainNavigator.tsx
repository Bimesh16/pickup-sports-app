import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { NepalColors } from '../styles/theme';
import { BottomTabParamList, RootStackParamList } from '../types';

// Screen imports
import HomeScreen from '../screens/main/HomeScreen';
import ExploreScreen from '../screens/main/ExploreScreen';
import CreateGameScreen from '../screens/main/CreateGameScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Detail screen imports
import GameDetailsScreen from '../screens/games/GameDetailsScreen';
import VenueDetailsScreen from '../screens/venues/VenueDetailsScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

/**
 * Bottom Tab Navigator
 * Main app navigation with 5 primary tabs
 */
const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Explore':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Create':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: NepalColors.primaryCrimson,
        tabBarInactiveTintColor: NepalColors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: NepalColors.surface,
          borderTopColor: NepalColors.outlineVariant,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 12,
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Explore',
        }}
      />
      <Tab.Screen 
        name="Create" 
        component={CreateGameScreen}
        options={{
          tabBarLabel: 'Create',
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarBadge: undefined, // Will be set dynamically based on unread count
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Main Navigator with Stack Navigation
 * Handles all authenticated user screens
 */
const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="BottomTabs"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, next, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
                {
                  scale: next
                    ? next.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.95],
                      })
                    : 1,
                },
              ],
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
            overlayStyle: {
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.1],
              }),
            },
          };
        },
      }}
    >
      {/* Main Tab Navigation */}
      <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />
      
      {/* Game Screens */}
      <Stack.Screen 
        name="GameDetails" 
        component={GameDetailsScreen}
        options={{
          presentation: 'modal',
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              transform: [
                {
                  translateY: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.height, 0],
                  }),
                },
              ],
            },
            overlayStyle: {
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
            },
          }),
        }}
      />
      
      {/* Venue Screens */}
      <Stack.Screen name="VenueDetails" component={VenueDetailsScreen} />
      
      {/* Payment Screens */}
      <Stack.Screen 
        name="Payment" 
        component={PaymentScreen}
        options={{
          presentation: 'modal',
        }}
      />
      
      {/* Settings Screens */}
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;