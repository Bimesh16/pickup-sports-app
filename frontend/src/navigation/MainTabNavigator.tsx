import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { MainTabParamList } from '../types';

// Import screens
import HomeScreen from '../screens/main/HomeScreen';
import ExploreScreen from '../screens/main/ExploreScreen';
import CreateGameScreen from '../screens/main/CreateGameScreen';
import ChatScreen from '../screens/main/ChatScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
  name: string;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, color, size, name }) => {
  const { theme } = useTheme();
  const scale = useSharedValue(focused ? 1 : 0.8);
  const translateY = useSharedValue(focused ? -4 : 0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 0.9, {
      damping: 10,
      stiffness: 150,
    });
    
    translateY.value = withSpring(focused ? -4 : 0, {
      damping: 10,
      stiffness: 150,
    });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const getIconName = (routeName: string, focused: boolean): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, [string, string]> = {
      Home: ['home-outline', 'home'],
      Explore: ['compass-outline', 'compass'],
      Create: ['add-circle-outline', 'add-circle'],
      Chat: ['chatbubble-outline', 'chatbubble'],
      Profile: ['person-outline', 'person'],
    };
    
    const [outline, filled] = iconMap[routeName] || ['home-outline', 'home'];
    return focused ? (filled as keyof typeof Ionicons.glyphMap) : (outline as keyof typeof Ionicons.glyphMap);
  };

  return (
    <Animated.View style={[styles.tabIcon, animatedStyle]}>
      <Ionicons 
        name={getIconName(name, focused)} 
        size={size} 
        color={focused ? theme.colors.primary : color} 
      />
      {focused && <View style={[styles.indicator, { backgroundColor: theme.colors.primary }]} />}
    </Animated.View>
  );
};

const MainTabNavigator: React.FC = () => {
  const { theme, isDark } = useTheme();

  const handleTabPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView 
            intensity={isDark ? 40 : 20} 
            tint={isDark ? 'dark' : 'light'} 
            style={StyleSheet.absoluteFillObject} 
          />
        ),
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon
            focused={focused}
            color={color}
            size={size}
            name={route.name}
          />
        ),
      })}
      screenListeners={{
        tabPress: handleTabPress,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Create" component={CreateGameScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    ...Platform.select({
      android: {
        elevation: 8,
      },
    }),
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  indicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default MainTabNavigator;