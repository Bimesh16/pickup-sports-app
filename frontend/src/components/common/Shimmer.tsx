import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';
import { useUIStore } from '@/stores/uiStore';

interface ShimmerProps {
  width?: number | string;
  height?: number | string;
  style?: ViewStyle;
  borderRadius?: number;
}

export default function Shimmer({ width = '100%', height = 16, style, borderRadius = 8 }: ShimmerProps) {
  const translateX = useRef(new Animated.Value(-100)).current;
  const reducedMotion = useUIStore(s => s.reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, { toValue: 300, duration: 1200, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: -100, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [translateX, reducedMotion]);

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
            opacity: reducedMotion ? 0.3 : 0.7,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  shimmer: {
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    opacity: 0.7,
  },
});
