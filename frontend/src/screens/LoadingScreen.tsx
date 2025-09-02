import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NepalColors, commonStyles } from '../styles/theme';

/**
 * Loading Screen with Nepal-themed animations
 */
const LoadingScreen: React.FC = () => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    // Start animations
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000 }),
      -1,
      false
    );
    
    scale.value = withRepeat(
      withTiming(1.2, { duration: 1000 }),
      -1,
      true
    );
    
    opacity.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    );
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0.3, 1], [0.6, 1]),
  }));

  return (
    <LinearGradient
      colors={[NepalColors.primaryBlue, NepalColors.primaryCrimson]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {/* Animated Logo */}
        <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
          <Ionicons
            name="football"
            size={80}
            color={NepalColors.primaryWhite}
          />
        </Animated.View>
        
        {/* App Title */}
        <Animated.View style={animatedTextStyle}>
          <Text style={styles.title}>Pickup Sports</Text>
          <Text style={styles.subtitle}>Connect. Play. Compete.</Text>
        </Animated.View>
        
        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            {[0, 1, 2].map((index) => (
              <LoadingDot key={index} delay={index * 200} />
            ))}
          </View>
          <Text style={styles.loadingText}>Setting up your experience...</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

/**
 * Individual Loading Dot Component
 */
const LoadingDot: React.FC<{ delay: number }> = ({ delay }) => {
  const scale = useSharedValue(0.8);

  useEffect(() => {
    const animate = () => {
      scale.value = withRepeat(
        withTiming(1.2, { duration: 600 }),
        -1,
        true
      );
    };

    const timer = setTimeout(animate, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.dot, animatedStyle]} />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: commonStyles.padding.xl,
  },
  iconContainer: {
    marginBottom: commonStyles.padding.xl,
    padding: commonStyles.padding.large,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: NepalColors.primaryWhite,
    textAlign: 'center',
    marginBottom: commonStyles.padding.small,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.primaryWhite,
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    marginTop: commonStyles.padding.xl * 2,
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: commonStyles.padding.medium,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: NepalColors.primaryWhite,
    marginHorizontal: 4,
    opacity: 0.7,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.primaryWhite,
    opacity: 0.8,
    textAlign: 'center',
  },
});

export default LoadingScreen;