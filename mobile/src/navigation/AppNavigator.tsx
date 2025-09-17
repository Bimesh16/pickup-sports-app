import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { NepalColors, NepalBorderRadius, NepalSpacing } from '../design-system/nepal-theme';

// Import Expo vector icons
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Import screens (we'll create these)
import HomeScreen from '../screens/HomeScreen';
import GamesScreen from '../screens/GamesScreen';
import TournamentsScreen from '../screens/TournamentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import GameDetailsScreen from '../screens/games/GameDetailsScreen';
import CreateGameScreen from '../screens/games/CreateGameScreen';
import TournamentDetailsScreen from '../screens/tournaments/TournamentDetailsScreen';

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  GameDetails: { gameId: string };
  CreateGame: undefined;
  TournamentDetails: { tournamentId: string };
};

export type TabParamList = {
  Home: undefined;
  Games: undefined;
  Tournaments: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Custom Tab Bar with Nepal Cultural Design
function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Get cultural icons and Nepali text
        const getTabConfig = (routeName: string) => {
          switch (routeName) {
            case 'Home':
              return {
                icon: 'home',
                nepali: 'घर',
                iconFamily: 'Ionicons' as const
              };
            case 'Games':
              return {
                icon: 'football',
                nepali: 'खेलहरू',
                iconFamily: 'MaterialCommunityIcons' as const
              };
            case 'Tournaments':
              return {
                icon: 'trophy',
                nepali: 'प्रतियोगिता',
                iconFamily: 'Ionicons' as const
              };
            case 'Profile':
              return {
                icon: 'person',
                nepali: 'प्रोफाइल',
                iconFamily: 'Ionicons' as const
              };
            default:
              return {
                icon: 'help',
                nepali: '',
                iconFamily: 'Ionicons' as const
              };
          }
        };

        const tabConfig = getTabConfig(route.name);

        return (
          <View key={index} style={styles.tabItem}>
            <View
              style={[
                styles.tabButton,
                isFocused ? styles.tabButtonActive : styles.tabButtonInactive
              ]}
            >
              <View
                style={[
                  styles.tabIconContainer,
                  isFocused && styles.tabIconContainerActive
                ]}
                onTouchEnd={onPress}
              >
                {tabConfig.iconFamily === 'MaterialCommunityIcons' ? (
                  <MaterialCommunityIcons
                    name={tabConfig.icon as any}
                    size={24}
                    color={isFocused ? NepalColors.snow_white : NepalColors.text_secondary}
                  />
                ) : (
                  <Ionicons
                    name={tabConfig.icon as any}
                    size={24}
                    color={isFocused ? NepalColors.snow_white : NepalColors.text_secondary}
                  />
                )}
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isFocused ? NepalColors.snow_white : NepalColors.text_secondary }
                  ]}
                >
                  {label}
                </Text>
                {tabConfig.nepali && (
                  <Text
                    style={[
                      styles.tabLabelNepali,
                      { color: isFocused ? NepalColors.snow_white : NepalColors.text_muted }
                    ]}
                  >
                    {tabConfig.nepali}
                  </Text>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// Main Tab Navigator with Nepal Cultural Design
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: NepalColors.primary,
          shadowColor: NepalColors.prayer_flag_red,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerTintColor: NepalColors.snow_white,
        headerTitleStyle: {
          fontFamily: 'Noto Sans Devanagari', // Nepal font
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'होमपेज', // Nepal text in header
          headerStyle: {
            backgroundColor: NepalColors.primary,
          },
        }}
      />
      <Tab.Screen 
        name="Games" 
        component={GamesScreen}
        options={{
          title: 'खेलहरू',
        }}
      />
      <Tab.Screen 
        name="Tournaments" 
        component={TournamentsScreen}
        options={{
          title: 'प्रतियोगिताहरू',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'प्रोफाइल',
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  // In a real app, you'd check authentication state here
  const isAuthenticated = true; // TODO: Replace with real auth state

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: NepalColors.primary,
          },
          headerTintColor: NepalColors.snow_white,
          headerTitleStyle: {
            fontFamily: 'Noto Sans Devanagari',
            fontWeight: '600',
          },
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="Main"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="GameDetails"
              component={GameDetailsScreen}
              options={{
                title: 'खेल विवरण', // Game Details in Nepali
                headerStyle: {
                  backgroundColor: NepalColors.secondary,
                },
              }}
            />
            <Stack.Screen
              name="CreateGame"
              component={CreateGameScreen}
              options={{
                title: 'नयाँ खेल सिर्जना', // Create New Game in Nepali
                headerStyle: {
                  backgroundColor: NepalColors.himalayan_gold,
                },
                headerTintColor: NepalColors.text_primary,
              }}
            />
            <Stack.Screen
              name="TournamentDetails"
              component={TournamentDetailsScreen}
              options={{
                title: 'प्रतियोगिता विवरण', // Tournament Details in Nepali
              }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles with Nepal Cultural Design
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: NepalColors.surface,
    borderTopWidth: 1,
    borderTopColor: NepalColors.divider,
    paddingBottom: NepalSpacing.sm,
    paddingHorizontal: NepalSpacing.sm,
    // Nepal flag gradient effect
    shadowColor: NepalColors.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: NepalSpacing.sm,
    paddingHorizontal: NepalSpacing.xs,
    borderRadius: NepalBorderRadius.md,
    minWidth: 60,
  },
  tabButtonActive: {
    backgroundColor: NepalColors.primary,
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: NepalSpacing.xs,
    paddingHorizontal: NepalSpacing.sm,
    borderRadius: NepalBorderRadius.lg,
  },
  tabIconContainerActive: {
    // Prayer flag colors effect
    shadowColor: NepalColors.prayer_flag_yellow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  tabLabelNepali: {
    fontSize: 8,
    fontFamily: 'Noto Sans Devanagari',
    marginTop: 1,
    textAlign: 'center',
  },
});
