import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, culturalMotifs } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

interface MandalaMotifProps {
  size?: number;
  animated?: boolean;
  style?: any;
  opacity?: number;
}

export const MandalaMotif: React.FC<MandalaMotifProps> = ({
  size = 200,
  animated = true,
  style,
  opacity = 0.1,
}) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      // Rotation animation
      Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      ).start();

      // Scale animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated, rotationAnim, scaleAnim]);

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Animated.View
        style={[
          styles.mandala,
          {
            transform: [
              { rotate: rotation },
              { scale: scaleAnim },
            ],
            opacity,
          },
        ]}
      >
        {/* Outer ring */}
        <View style={[styles.ring, styles.outerRing, { width: size, height: size }]}>
          <LinearGradient
            colors={[colors.glassPrimary, colors.glassSecondary, colors.glassPrimary]}
            style={styles.gradientRing}
          />
        </View>

        {/* Middle ring */}
        <View style={[styles.ring, styles.middleRing, { width: size * 0.7, height: size * 0.7 }]}>
          <LinearGradient
            colors={[colors.glassSecondary, colors.glassPrimary, colors.glassSecondary]}
            style={styles.gradientRing}
          />
        </View>

        {/* Inner ring */}
        <View style={[styles.ring, styles.innerRing, { width: size * 0.4, height: size * 0.4 }]}>
          <LinearGradient
            colors={[colors.glassPrimary, colors.glassSecondary]}
            style={styles.gradientRing}
          />
        </View>

        {/* Center */}
        <View style={[styles.center, { width: size * 0.2, height: size * 0.2 }]}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.gradientCenter}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandala: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
  },
  outerRing: {
    borderColor: colors.glassPrimary,
  },
  middleRing: {
    borderColor: colors.glassSecondary,
  },
  innerRing: {
    borderColor: colors.glassPrimary,
  },
  gradientRing: {
    flex: 1,
    borderRadius: 9999,
  },
  center: {
    borderRadius: 9999,
  },
  gradientCenter: {
    flex: 1,
    borderRadius: 9999,
  },
});
