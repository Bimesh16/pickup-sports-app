import { Platform } from 'react-native';

// Web-compatible animation configuration
export const getAnimationConfig = (config: any) => {
  if (Platform.OS === 'web') {
    // On web, disable useNativeDriver to avoid warnings
    return {
      ...config,
      useNativeDriver: false,
    };
  }
  return config;
};

// Helper function for timing animations
export const createTimingAnimation = (value: any, config: any) => {
  const { Animated } = require('react-native');
  return Animated.timing(value, getAnimationConfig(config));
};

// Helper function for spring animations
export const createSpringAnimation = (value: any, config: any) => {
  const { Animated } = require('react-native');
  return Animated.spring(value, getAnimationConfig(config));
};

// Helper function for sequence animations
export const createSequenceAnimation = (animations: any[]) => {
  const { Animated } = require('react-native');
  return Animated.sequence(animations);
};

// Helper function for loop animations
export const createLoopAnimation = (animation: any, config?: any) => {
  const { Animated } = require('react-native');
  return Animated.loop(animation, config);
};
