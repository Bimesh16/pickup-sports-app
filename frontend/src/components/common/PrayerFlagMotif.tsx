import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, culturalMotifs } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface PrayerFlagMotifProps {
  count?: number;
  animated?: boolean;
  style?: any;
  opacity?: number;
}

export const PrayerFlagMotif: React.FC<PrayerFlagMotifProps> = ({
  count = 5,
  animated = true,
  style,
  opacity = 0.3,
}) => {
  const waveAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Wave animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [animated, waveAnim, fadeAnim]);

  const getFlagColors = (index: number) => {
    const colorSets = [
      [colors.primary, colors.accent],
      [colors.secondary, colors.sunriseOrange],
      [colors.twilightPurple, colors.twilightLight],
      [colors.sunriseOrange, colors.sunriseLight],
      [colors.nepalGold, colors.templeRed],
    ];
    return colorSets[index % colorSets.length];
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
        style,
      ]}
    >
      {Array.from({ length: count }, (_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.flagContainer,
            {
              transform: [
                {
                  translateY: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, Math.sin(index * 0.5) * 10],
                  }),
                },
                {
                  rotate: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', `${Math.sin(index * 0.3) * 5}deg`],
                  }),
                },
              ],
              opacity,
            },
          ]}
        >
          <LinearGradient
            colors={getFlagColors(index)}
            style={styles.flag}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  flagContainer: {
    marginHorizontal: 2,
  },
  flag: {
    width: 20,
    height: 30,
    borderRadius: 2,
  },
});
